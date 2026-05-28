# TaskFlow — Agent 指令

> 本文件是目录。更深入的规格位于 `docs/`。机器可读的文件索引见 `llms.txt`。

## 快速参考

| 内容 | 位置 |
|------|------|
| **产品需求** | **`需求.md`** |
| **开发计划** | **`开发计划.md`** |
| 特性规格 | `docs/features/<id>/` |
| 系统架构 | `docs/ARCHITECTURE.md` |
| 前端约定 | `docs/FRONTEND.md` |
| 后端约定 | `docs/BACKEND.md` |
| BFF 约定 | `docs/BFF.md` |
| 质量记分卡 | `docs/QUALITY_SCORE.md` |
| 安全策略 | `docs/SECURITY.md` |
| 可靠性策略 | `docs/RELIABILITY.md` |
| 架构决策 | `docs/decisions/` |
| 数据库模式 | `packages/db/prisma/schema.prisma` |
| 共享类型 | `packages/shared/src/` |
| 项目宪法 | `docs/constitution.md` |
| 治理规则 | `docs/governance.md` |

## 技术栈

- **单体仓库**: pnpm workspace + Turborepo
- **前端**: Next.js 15 App Router + TailwindCSS + shadcn/ui + Zustand + TanStack Query
- **BFF**: Hono (独立 Node.js 服务, 端口 :3002)
- **后端**: Next.js 15 API Routes (独立部署, 端口 :3001) + Prisma + PostgreSQL + Redis
- **测试**: Vitest (单元/集成) + Playwright (端到端)

## 分层架构（严格）

```
Types → Config → Repository → Service → API Route   (后端)
Types → DTO → Route → API Client                     (BFF)
Types → Component → Page                              (前端)
```

**禁止向上层导入。** 自定义 Linter 强制执行此规则。

## 规则

1. **每次会话只做一个特性** — 读取 `features.json`，选择优先级最高的 `failing` 项
2. **边界处解析校验** — 用 Zod 校验所有外部输入，绝不信任原始数据结构
3. **共享工具优于手写辅助函数** — 使用 `packages/shared/`，将不变量集中管理
4. **禁止裸数据探测** — 只使用类型化 SDK 或已校验的边界
5. **结构化日志** — 使用 `@taskflow/shared` 日志器，生产代码中绝不使用 `console.log`
6. **测试后方可标记通过** — 特性仅在单元测试 + 集成测试 + 手动验证均通过后才可标记为 `passing`
7. **提交附带上下文** — 描述性提交信息，引用特性 ID
8. **禁止在 Git 中存放密钥** — 使用 `.env` 文件，绝不提交密钥或令牌
9. **BFF 绝不接触数据库** — BFF 仅调用后端 API
10. **前端绝不直接调用后端** — 始终通过 BFF 中转

## 会话生命周期

1. 运行 `bash init.sh` 引导环境
2. 阅读 `claude-progress.txt` 了解近期历史
3. 阅读 `需求.md` 获取产品需求上下文
4. 阅读 `features.json`，选择下一个 failing 特性
5. 阅读 `docs/features/<id>/requirements.md` 获取特性专属规格
6. 实现 → 测试 → 验证
7. 更新 `features.json` 状态
8. 追加记录到 `claude-progress.txt`
9. 提交所有变更

## 命令

```bash
pnpm dev                  # 启动所有服务（热重载）
pnpm test:unit            # 跨所有包的单元测试
pnpm test:integration     # 集成测试（需要数据库）
pnpm test:e2e             # Playwright 端到端测试
pnpm lint                 # 跨所有包的 ESLint
pnpm typecheck            # TypeScript 严格模式检查
pnpm build                # 生产构建
```
