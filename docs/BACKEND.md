# TaskFlow — 后端约定

## 文件结构

```
apps/api/
├── app/
│   └── api/
│       └── v1/            # 版本化 API 路由
│           ├── auth/
│           ├── boards/
│           ├── tasks/
│           ├── members/
│           └── notifications/
├── src/
│   ├── services/          # 业务逻辑层
│   ├── repositories/      # 数据访问层
│   ├── validators/        # Zod 输入校验模式
│   ├── providers/         # 横切关注点：认证、日志、Redis
│   └── utils/             # 仅限内部工具
├── prisma/                → 符号链接至 packages/db/prisma/
└── tests/
    ├── unit/              # Service、Validator、工具测试
    └── integration/       # API 端点测试（含真实数据库）
```

## 分层规则（严格）

### Types 层
- Zod 模式位于 `validators/`
- 领域类型从 Zod 推导：`z.infer<typeof Schema>`
- 共享类型从 `@taskflow/shared` 导入

### Config 层
- `src/providers/prisma.ts` — Prisma 客户端单例
- `src/providers/redis.ts` — Redis 客户端单例
- `src/providers/env.ts` — 已校验的环境配置

### Repository 层
- 每个领域一个仓库（如 `TaskRepository`、`BoardRepository`）
- 方法：`findById`、`findMany`、`create`、`update`、`delete`
- 接受类型化输入，返回类型化输出
- 不含业务逻辑，仅数据访问

### Service 层
- 每个领域一个服务
- 方法代表用例（如 `createTask`、`moveTask`、`assignTask`）
- 用 Zod 模式校验输入
- 调用仓库获取数据，调用其他服务编排逻辑
- 抛出领域特定错误

### API Route 层
- 用 Zod 解析请求体/参数
- 调用 Service 方法
- 返回标准化响应格式
- 绝不包含业务逻辑

## 响应格式

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

错误：
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "任务标题为必填项"
  }
}
```

## 错误码

| 代码 | HTTP | 含义 |
|------|------|------|
| VALIDATION_ERROR | 400 | 输入无效 |
| UNAUTHORIZED | 401 | JWT 缺失或无效 |
| FORBIDDEN | 403 | 角色权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源重复 |
| INTERNAL_ERROR | 500 | 意外故障 |

## 测试

### 单元测试（`tests/unit/`）
- 使用 vitest mock 模拟 Repository 层
- 测试 Service 业务逻辑、校验、错误处理
- 测试 Validator：有效输入、无效输入、边界值
- 覆盖率目标：Service 80%+

### 集成测试（`tests/integration/`）
- 使用 testcontainers 连接真实 PostgreSQL
- 测试完整 API Route → Service → Repository → DB 链路
- 每个测试套件前填充测试数据
- 测试间清理数据
- 覆盖率目标：API Route 70%+
