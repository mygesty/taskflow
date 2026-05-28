---
name: session-start
tier: T2
description: 定位会话，注册到 agents.json，阅读项目状态
---

# 会话开始

每次会话开始时执行以下步骤：

1. 运行 `bash init.sh` 引导环境
2. 阅读 `claude-progress.txt` 了解近期会话历史
3. 阅读 `features.json` 了解当前特性状态
4. 阅读 `agents.json` 检查活跃 Agent
5. 在 `agents.json` 中注册自己：
   - 设置 `status` 为 `active`
   - 设置 `currentFeature` 为优先级最高的 `failing` 特性
   - 设置 `heartbeat` 为当前时间戳
6. 阅读 `docs/ARCHITECTURE.md` 了解系统上下文
7. 阅读相关领域文档（FRONTEND.md、BACKEND.md 或 BFF.md）
8. 运行 `pnpm typecheck` 验证干净的初始状态
9. 报告：你正在处理哪个特性、当前项目状态

在定位完成之前，不要开始实现。
