# ADR-005: GitHub Actions CI/CD

## 状态：已采纳

## 背景

我们需要在每次 PR 时自动运行 CI/CD，并在 main 推送时自动部署，与我们三层测试策略集成。

## 决策

使用 GitHub Actions，CI 和 CD 分别配置独立工作流。

## 理由

- **GitHub 原生**：无需外部 CI 服务
- **矩阵构建**：并行化 lint/typecheck/test 任务
- **Docker 服务**：CI 中使用 PostgreSQL 和 Redis 容器
- **部署**：每个应用 Docker 构建 + 推送，部署到 Fly.io/Railway

## CI 流程（PR 触发）

1. Lint + 类型检查（快速、并行）
2. 单元测试（lint 通过后）
3. 集成测试（lint 通过后，需要数据库）
4. 端到端测试（单元 + 集成通过后）
5. 构建验证（单元 + 集成通过后）

## CD 流程（main 推送触发）

1. 完整 CI 流水线
2. 每个应用 Docker 构建
3. 推送到容器镜像仓库
4. 部署并执行健康检查
5. 失败时自动回滚

## 影响

- PR 需要所有 CI 检查通过才能合并
- main 分支保护强制执行
- 合并后自动部署（开发/预发环境无需人工审批）
