# TaskFlow — Claude Code 配置

> 从 `AGENTS.md` 导入约定。本文件仅包含 Claude Code 专用设置。

## 行为规则

- 始终先阅读 `AGENTS.md` 获取项目约定
- 做结构变更前先阅读 `docs/ARCHITECTURE.md`
- 引入新模式前先检查 `docs/decisions/` 中是否有已有 ADR
- 使用 `@taskflow/shared` 处理跨包工具函数
- 代码变更后运行 `pnpm typecheck`
- 实现特性后运行 `pnpm test:unit`

## 文件大小限制

- Service 文件：最多 200 行
- Route 处理器：最多 100 行
- React 组件：最多 150 行
- 逼近限制时提取为子模块

## 测试要求

- 每个新增 Service 函数必须有单元测试
- 每个新增 API 端点必须有集成测试
- Bug 修复必须包含回归测试
- E2E 测试仅覆盖完整用户流程

## 会话

- 开始：运行 `bash init.sh`
- 结束：更新 `claude-progress.txt`、提交、推送
