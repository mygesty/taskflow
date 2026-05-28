# ADR-002: Hono 作为 BFF 框架

## 状态：已采纳

## 背景

BFF 层需要一个轻量级 HTTP 框架来聚合后端 API 调用、转换数据和处理认证。它不应与 Next.js 前端或后端重叠。

## 决策

使用 Hono v4 作为 BFF 层的独立 Node.js 服务器。

## 理由

- **轻量**：最小开销，快速冷启动
- **TypeScript 优先**：配合 Zod 校验器实现端到端类型安全
- **多运行时**：未来可部署到 Edge/Cloudflare
- **中间件模式**：JWT 认证、限流、错误处理作为可组合中间件
- **无重叠**：Hono 与 Next.js 明确分离，强化 BFF ≠ 后端边界

## 备选方案

- **Next.js API Routes（在 web 应用中）**：会模糊前端/BFF 边界，BFF 需独立扩展
- **Express**：较重、回调风格、TypeScript 原生支持较弱
- **Fastify**：性能良好但插件系统比 Hono 中间件更复杂

## 影响

- BFF 是独立的部署单元（Docker 容器）
- BFF 有自己的健康检查和扩展策略
- 前端必须在构建/运行时知道 BFF URL
