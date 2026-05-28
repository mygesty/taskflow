# TaskFlow — 系统架构概览

## 系统上下文

```
用户 → 浏览器 → [前端 :3000] → [BFF :3002] → [后端 :3001] → [PostgreSQL + Redis]
```

## 领域映射

| 领域 | 包路径 | 说明 |
|------|--------|------|
| 认证 | `apps/api/app/api/v1/auth/` | 注册、登录、JWT |
| 工作区 | `apps/api/app/api/v1/workspaces/` | 工作区增删改查、成员 |
| 看板 | `apps/api/app/api/v1/boards/` | 看板 + 列管理 |
| 任务 | `apps/api/app/api/v1/tasks/` | 任务增删改查、指派、移动 |
| 评论 | `apps/api/app/api/v1/comments/` | 评论含@提及 |
| 通知 | `apps/api/app/api/v1/notifications/` | 通知增删改查、已读状态 |
| 数据看板 | `apps/api/app/api/v1/dashboard/` | 统计聚合 |

## 包分层（后端 — 严格）

```
Types → Config → Repository → Service → API Route
```

- **Types**：Zod 模式、Prisma 生成类型、领域接口
- **Config**：环境配置、数据库客户端、Redis 客户端单例
- **Repository**：数据访问，仅查询，不含业务逻辑
- **Service**：业务逻辑、校验、编排
- **API Route**：HTTP 处理、请求解析、响应格式化

**横切关注点**：`Providers`（认证、日志、遥测）通过显式接口接入。

### 依赖规则

| 来源 | 可导入 |
|------|--------|
| API Route | Service、Types、Providers |
| Service | Repository、Types、Providers |
| Repository | Types、Config |
| Config | Types |
| Types | 无 |

**禁止向上导入。** CI 通过自定义 Linter 强制执行。

## 包分层（BFF — 严格）

```
Types → DTO → Route → API Client
```

- **Types**：请求/响应 Zod 模式
- **DTO**：数据转换函数（后端数据形状 → 前端形状）
- **Route**：Hono 路由处理器
- **API Client**：对后端 API 的 HTTP 调用

## 包分层（前端 — 严格）

```
Types → Component → Page
```

- **Types**：来自 `@taskflow/shared` 的共享类型
- **Component**：可复用 UI 组件、hooks
- **Page**：Next.js App Router 页面、布局

## 共享包

`@taskflow/shared` 是以下内容的唯一事实来源：
- TypeScript 类型定义
- Zod 校验模式
- 常量和枚举
- 纯工具函数（无副作用）

所有其他包从 `@taskflow/shared` 导入。它不从任何包导入。

## 数据流

### 写入路径（如：创建任务）

```
前端表单 → BFF POST /api/bff/boards/:id/tasks
  → BFF 校验请求 DTO
  → BFF 调用后端 POST /api/v1/tasks
    → API Route 用 Zod 解析
    → Service 校验业务规则
    → Repository 通过 Prisma 插入
    → Service 触发副作用（通知）
  → BFF 转换后端响应 → 前端 DTO
  → 前端使 TanStack Query 缓存失效
```

### 读取路径（如：看板详情）

```
前端 → BFF GET /api/bff/boards/:id/detail
  → BFF 调用后端 GET /api/v1/boards/:id/columns
  → BFF 调用后端 GET /api/v1/boards/:id/members
  → BFF 调用后端 GET /api/v1/tasks?boardId=:id
  → BFF 在 DTO 层合并数据
  → 返回单个聚合响应
```
