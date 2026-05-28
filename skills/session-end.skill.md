---
name: session-end
tier: T2
description: 验证、提交、更新状态、干净交接
---

# 会话结束

每次会话结束时执行以下步骤：

1. 运行 `pnpm test:unit` — 必须全部通过
2. 运行 `pnpm typecheck` — 必须无错误
3. 运行 `pnpm lint` — 必须无错误
4. 如果所有检查通过：
   - 更新 `features.json` 中所处理特性的状态（`passing` 或 `in_progress`）
   - 追加到 `claude-progress.txt`，包含：
     - 时间戳
     - 处理的特性 ID
     - 实现了什么
     - 还剩什么
     - 任何阻碍
   - 更新 `agents.json`：设置 `status` 为 `done`，清空 `currentFeature`
   - 用描述性消息提交，引用特性 ID
   - 推送代码（如已配置）
5. 如果检查失败：
   - 不要将特性标记为 passing
   - 追加到 `claude-progress.txt` 描述失败情况
   - 用 `[WIP]` 前缀提交
   - 更新 `agents.json`：设置 `status` 为 `blocked`，描述阻碍原因

绝不在未更新 `claude-progress.txt` 的情况下结束会话。
