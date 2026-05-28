# ADR-004: 测试策略

## 状态：已采纳

## 背景

我们需要一种在每一层确保可靠性的测试策略，并在 CI 中自动执行。

## 决策

三层测试：Vitest（单元）→ Vitest + MSW + testcontainers（集成）→ Playwright（端到端）。

## 理由

### 单元测试（Vitest）
- 快速、隔离、无外部依赖
- 覆盖：service 函数、validator、DTO、工具函数
- 模拟：Repository 层、外部 API
- 运行：每次 PR、每次推送

### 集成测试（Vitest + testcontainers + MSW）
- testcontainers 提供真实 PostgreSQL 用于后端集成测试
- MSW 用于 BFF 集成测试（模拟后端响应）
- 覆盖：API 端点、BFF 聚合逻辑、Repository + DB 交互
- 运行：单元测试通过后的每次 PR

### 端到端测试（Playwright）
- 真实浏览器中的完整用户流程
- 覆盖：登录 → 创建工作区 → 创建看板 → 添加任务 → 完成任务
- 运行：集成测试通过后的每次 PR，以及 main 推送时

## 测试比例目标

```
单元：100+ 测试 (60%)
集成：30-50 测试 (30%)
端到端：5-10 测试 (10%)
```

## 影响

- CI 流水线有 3 个顺序测试阶段
- testcontainers 要求 CI 中有 Docker
- 端到端测试需要所有服务运行（CI 中使用 docker-compose）
- 测试不稳定性必须在 3 次失败内解决，否则升级处理
