# TaskFlow — 治理规则

## Agent 自治范围

### 始终允许（无需批准）

- 运行测试
- 修复 Lint 错误
- 更新文档使其与代码一致
- 添加缺失的类型注解
- 在单个文件内重构

### 需先询问（需要人工批准）

- 添加新依赖
- 修改数据库模式（Prisma 迁移）
- 修改 CI/CD 工作流
- 修改共享包的公共 API
- 同一任务连续 3 次测试失败
- 操作超出所分配的包范围

### 绝对禁止（始终阻止）

- 提交密钥或令牌
- 删除迁移文件
- 修改 `constitution.md` 或 `governance.md`
- 强制推送到 main 分支
- 跳过 CI 检查
- 在分层架构中向上导入

## 升级协议

1. **连续 3 次失败** → 停止，在 `issues.json` 中记录，等待人工
2. **发现超出范围的问题** → 在 `issues.json` 中记录，继续处理范围内的工作
3. **架构不确定** → 检查 `docs/decisions/`，如果没有 ADR，停止并请求人工指导
4. **安全隐患** → 立即停止，记录问题，不要继续

## 质量门禁

特性只有在满足以下条件后才可在 `features.json` 中标记为 `passing`：

1. 所有单元测试通过（`pnpm test:unit`）
2. 所有集成测试通过（`pnpm test:integration`）
3. TypeScript 严格模式通过（`pnpm typecheck`）
4. Lint 通过（`pnpm lint`）
5. 手动验证描述在 `verification.md` 中

## 提交标准

格式：`<类型>(<范围>): <描述> [feat-XXX]`

类型：`feat`、`fix`、`refactor`、`test`、`docs`、`chore`、`ci`

示例：`feat(auth): 实现 JWT Token 刷新 [feat-001]`
