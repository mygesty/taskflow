# ADR-001: 单体仓库 + Turborepo

## 状态：已采纳

## 背景

TaskFlow 有三个可部署应用（web、bff、api）和两个共享包（shared、db）。我们需要一种支持代码共享、原子变更和统一 CI/CD 的仓库结构。

## 决策

使用 pnpm workspace + Turborepo 单体仓库。

## 理由

- **pnpm 工作区**：严格的依赖解析、磁盘高效符号链接
- **Turborepo**：增量构建、任务并行化、远程缓存
- **单一仓库**：前端/BFF/后端跨切面变更只需一个 PR，原子提交
- **共享类型**：`@taskflow/shared` 包确保类型一致性

## 影响

- 所有应用共享一个 `pnpm-lock.yaml` — 高速迭代时可能出现锁文件冲突
- Turborepo 缓存需在 CI 中配置
- 每个应用独立构建为 Docker 镜像部署
