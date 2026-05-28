# TaskFlow — 前端约定

## 文件结构

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 路由组：登录、注册
│   ├── (dashboard)/       # 路由组：主面板布局
│   │   ├── boards/        # 看板页
│   │   ├── tasks/         # 任务详情页
│   │   └── settings/      # 用户设置
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                # shadcn/ui 基础组件（不要直接修改）
│   ├── board/             # 看板相关组件
│   ├── task/              # 任务相关组件
│   └── layout/            # 共享布局组件（头部、侧边栏）
├── hooks/                 # 自定义 React Hooks
├── lib/                   # 工具函数、API 客户端、常量
├── stores/                # Zustand 状态管理
└── types/                 # 前端专用类型（从 @taskflow/shared 重新导出）
```

## 约定

### 路由
- 使用 App Router 路由组 `(auth)`、`(dashboard)` 分离布局
- 服务端组件用于通过 BFF 获取初始数据
- 客户端组件仅用于交互元素

### 状态管理
- **服务端状态**：TanStack Query v5（查询、变更、缓存失效）
- **客户端状态**：Zustand（拖拽状态、UI 开关、表单状态）
- 永远不要将服务端数据存储在 Zustand 中 — 使用 TanStack Query 缓存

### 数据请求
- 所有 API 调用通过 BFF（`NEXT_PUBLIC_BFF_URL`）
- 使用 `lib/api-client.ts` 中的集中 API 客户端
- 在 `lib/query-keys.ts` 中定义查询键

### 组件
- 以 shadcn/ui 为基础，在 `components/board/`、`components/task/` 中扩展
- Props：使用 TypeScript 接口，禁止 `any`
- 每个组件一个文件，命名导出
- 共置组件专用 hooks

### 样式
- 仅使用 TailwindCSS，不使用 CSS Modules
- 使用 `lib/utils` 中的 `cn()` 处理条件类名
- 遵循 shadcn/ui 主题变量

### 表单
- React Hook Form + Zod 校验
- 在组件文件或 `types/` 中定义模式
- 匹配时使用 `@taskflow/shared` 的模式

### 测试
- Vitest 用于组件单元测试
- Playwright 用于端到端用户流程
- 使用 MSW 模拟 BFF 响应
