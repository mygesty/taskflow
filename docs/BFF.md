# TaskFlow — BFF 约定

## 文件结构

```
apps/bff/
├── src/
│   ├── routes/            # Hono 路由定义
│   │   ├── auth.ts
│   │   ├── boards.ts
│   │   ├── tasks.ts
│   │   └── notifications.ts
│   ├── middleware/        # Hono 中间件
│   │   ├── auth.ts        # JWT 验证 + 角色提取
│   │   ├── rateLimit.ts   # 按 IP 限流
│   │   └── errorHandler.ts # 统一错误包装
│   ├── services/          # API 编排
│   │   └── apiClient.ts   # 类型化后端 API 客户端
│   ├── dto/               # 数据转换对象
│   │   ├── request/       # 前端 → BFF 模式
│   │   └── response/      # BFF → 前端模式
│   └── index.ts           # Hono 应用入口
└── tests/
    ├── unit/              # DTO 转换测试
    └── integration/       # 路由测试（用 MSW 模拟后端）
```

## 分层规则（严格）

### Types/DTO 层
- 请求 DTO：校验前端发送给 BFF 的数据
- 响应 DTO：定义 BFF 发送给前端的数据
- 所有 DTO 均为 Zod 模式配合 `z.infer<>` 类型

### Route 层
- 用请求 DTO 解析请求
- 调用 apiClient 方法
- 用响应 DTO 转换响应
- 返回类型化响应

### API Client 层
- 类型化 HTTP 客户端，调用后端 API（`BFF_API_URL`）
- 方法与后端 API 端点一一对应
- 含指数退避的重试逻辑
- 按端点配置超时

## 核心原则

1. **BFF 绝不接触数据库** — 仅调用后端 API
2. **BFF 聚合数据** — 多次后端调用合并为一次响应
3. **BFF 转换数据** — 后端数据形状 → 前端友好形状
4. **BFF 执行鉴权** — JWT 验证、角色提取
5. **BFF 限流保护** — 保护后端免受突发流量

## 聚合模式

### 模式一：并行获取 + 合并
```
GET /api/bff/boards/:id/detail
  → Promise.all([
      apiClient.getBoardColumns(boardId),
      apiClient.getBoardMembers(boardId),
      apiClient.getBoardTasks(boardId),
    ])
  → mergeIntoBoardDetailDTO(columns, members, tasks)
```

### 模式二：顺序链式
```
POST /api/bff/tasks/:id/move
  → apiClient.moveTask(taskId, targetColumnId)
  → apiClient.createNotification(assignmentNotification)
  → transformMoveResponse(result)
```

### 模式三：透传 + 裁剪
```
POST /api/bff/auth/register
  → apiClient.register(data)
  → stripSensitiveFields(result)  // 移除 passwordHash 等
```

## 错误处理

BFF 捕获后端错误并统一包装：

```json
{
  "success": false,
  "error": {
    "code": "BACKEND_ERROR",
    "message": "用户友好的错误提示",
    "details": null
  }
}
```

- 后端返回 401 → BFF 返回 401（令牌过期）
- 后端返回 403 → BFF 返回 403（权限不足）
- 后端返回 500 → BFF 返回 502（上游错误）
- 网络错误 → BFF 返回 503（服务不可用）

## 测试

### 单元测试
- DTO 转换函数：已知输入/输出对
- 中间件逻辑（认证令牌提取、限流计数）

### 集成测试
- MSW 拦截后端 API 调用
- 使用模拟后端响应测试路由处理器
- 验证聚合、错误包装和响应裁剪
