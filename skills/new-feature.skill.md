---
name: new-feature
tier: T2
description: 为新特性创建规格流水线脚手架
---

# 新特性

为新特性创建规格流水线：

1. 阅读 `features.json` 找到下一个可用的特性 ID
2. 创建目录：`docs/features/<id>/`
3. 创建 `requirements.md`：
   - 用户故事
   - 验收标准
   - 明确排除的范围
4. 创建 `design.md`：
   - 后端：新增/修改的 service、repository、API route
   - BFF：新增/修改的 route、DTO、聚合逻辑
   - 前端：新增/修改的 page、component、hook
   - 数据库：新增/修改的表、列
5. 创建 `tasks.md`：
   - 按顺序排列的任务列表，标注依赖关系
   - 每个任务对应一次提交
6. 创建 `verification.md`（仅模板，实现后填写）：
   - 单元测试结果
   - 集成测试结果
   - 手动验证步骤
7. 在 `features.json` 中添加条目，状态为 `failing`

创建特性脚手架时不要实现任何代码。
