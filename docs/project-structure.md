# TaskFlow — 项目结构

## 命名约定

### 文件
- 组件：PascalCase（`TaskCard.tsx`、`BoardColumn.tsx`）
- 工具函数：camelCase（`formatDate.ts`、`apiClient.ts`）
- 类型：PascalCase 带后缀（`Task.ts`、`TaskResponse.ts`）
- 测试：共置或 `__tests__/` 目录，`.test.ts`/`.spec.ts` 后缀
- 路由：kebab-case（`[board-id]/`、`create-task/`）

### 导出
- 仅命名导出（禁止默认导出）
- 每个文件一个主要导出
- 通过 `index.ts` 桶文件重新导出

### 变量
- 变量和函数：camelCase
- 类、类型、接口、Zod 模式：PascalCase
- 常量：UPPER_SNAKE_CASE

### 数据库
- 表名：PascalCase（Prisma 约定）
- 列名：camelCase（Prisma 约定）
- 迁移：描述性名称（`add_task_due_date`）

## 目录规则

1. 每个领域在 `src/services/`、`src/repositories/`、`src/validators/` 中有自己的目录
2. 测试文件镜像源代码结构
3. 嵌套组件不超过 3 层
4. 共享代码 → `packages/shared/`，绝不重复

## 禁止模式

- `export default` — 使用命名导出
- `any` 类型 — 使用 unknown + 类型守卫或 Zod
- `console.log` — 使用结构化日志器
- `@ts-ignore` / `@ts-expect-error` — 修复类型而非忽略
- `eval()` — 禁止使用
- 硬编码 URL — 使用环境变量
- 内联样式 — 使用 Tailwind 类名
