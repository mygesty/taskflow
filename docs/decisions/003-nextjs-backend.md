# ADR-003: Next.js 作为后端 API 服务器

## 状态：已采纳

## 背景

后端需要提供 REST API 端点，包含业务逻辑、数据库访问和文件处理。我们希望通过统一技术栈最大化团队效率。

## 决策

使用 Next.js 15 API Routes 的 standalone 模式作为后端 API 服务器。

## 理由

- **统一技术栈**：与前端相同框架降低学习成本
- **API Routes**：对 REST 端点足够，无需 Express/Fastify
- **Standalone 模式**：`output: 'standalone'` 产出最小化 Node.js 服务器
- **TypeScript**：一等支持，兼容 strict 模式

## 备选方案

- **Express**：更灵活但引入了不同框架
- **Fastify**：最快的 Node.js 服务器但对我们的规模过重
- **NestJS**：过重，装饰器风格与前端不一致

## 影响

- 后端作为独立 Node.js 进程部署（不是 Next.js SSR 服务器）
- 后端应用中没有页面或 UI — 纯 API 服务器
- API Routes 在 `/api/v1/` 下版本化，确保未来兼容性
