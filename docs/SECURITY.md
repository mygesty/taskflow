# TaskFlow — 安全策略

## 认证

- JWT 令牌短期过期（15 分钟 Access，7 天 Refresh）
- 令牌存储在 httpOnly、Secure、SameSite=Strict Cookie 中
- 密码使用 bcrypt 哈希，cost 因子为 12
- 登录接口限流：每 IP 每分钟 5 次

## 授权

- 基于角色的访问控制：Owner > Admin > Member
- 每个 API 端点检查工作区成员身份
- 写操作需要 Member+ 角色
- 管理操作（邀请、移除）需要 Admin+ 角色
- 工作区删除需要 Owner 角色

## 输入校验

- 所有外部输入在 API 边界用 Zod 校验
- SQL 注入：Prisma 参数化查询防护
- XSS：React 自动转义 + CSP 头
- CSRF：SameSite Cookie + 来源校验

## 数据保护

- API 响应绝不返回密码
- BFF 在转发给前端前裁剪敏感字段
- 日志中不含 PII — 结构化日志含脱敏处理
- 所有密钥使用环境变量，绝不提交到仓库

## API 安全

- CORS：BFF 仅允许前端来源
- 后端仅允许 BFF 来源（内网）
- 限流：BFF 按IP执行限流
- 所有端点设置请求体大小限制

## OWASP Top 10 覆盖

| 风险 | 缓解措施 |
|------|----------|
| A01 权限控制失效 | 每条路由的 RBAC 中间件 |
| A02 加密失败 | bcrypt、强制 HTTPS |
| A03 注入 | Prisma 参数化、Zod 校验 |
| A04 不安全设计 | 分层架构、边界校验 |
| A05 安全配置错误 | 无默认凭据、基于环境的配置 |
| A06 易受攻击组件 | Dependabot + CI 中的 npm audit |
| A07 认证失败 | 限流、安全 Cookie 存储 |
| A08 数据完整性 | 所有边界使用 Zod 校验 |
| A09 日志记录不足 | 结构化日志、不含敏感数据 |
| A10 SSRF | 后端仅内网可达、BFF 白名单 |
