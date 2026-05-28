---
name: implement-feature
tier: T2
description: 规格驱动的特性实现
---

# 实现特性

实现特性时遵循此工作流：

1. **阅读规格** — 检查 `docs/features/<id>/` 中的需求、设计、任务
2. **如果规格不存在** — 先运行 `@new-feature` 创建脚手架
3. **从任务列表中选择一个任务** — 绝不同时实现多个任务
4. **按照分层架构实现**：
   - 后端：Types → Validators → Repository → Service → API Route
   - BFF：Types → DTO → API Client → Route
   - 前端：Types → Component → Page
5. **边实现边写测试**：
   - 每个新增 Service 函数写单元测试
   - 每个新增 API 端点写集成测试
   - 每个新增 BFF 路由写 DTO 转换测试
6. **每个逻辑工作单元后运行测试**：`pnpm test:unit`
7. **自行验证** 特性端到端可用
8. **更新规格** — 在 `docs/features/<id>/tasks.md` 中标记任务为完成
9. **提交**：`feat(<领域>): <描述> [<特性-id>]`

如果在同一任务上连续 3 次测试失败，停止并在 `issues.json` 中记录。
