# TaskFlow CI/CD 部署配置（Jenkins + ngrok）

## 架构

```
git push → GitHub webhook → ngrok 公网隧道 → Jenkins (192.168.1.230:8080)
                                                    │
                                          docker compose build && up -d
                                                    │
                              ┌─────────────────────┼─────────────────────┐
                              ▼                     ▼                     ▼
                        Nginx :80             Web :3000           BFF :3002 ─── API :3001 ─── PostgreSQL + Redis
```

- **ngrok** — 内网穿透，将 Jenkins 8080 暴露为公网 URL，接收 GitHub webhook
- **Jenkins** — CI/CD 引擎，运行在 Docker 容器中，通过 `docker.sock` 操控宿主 Docker
- **Nginx** (80) — 反向代理，`/` → Web，`/api/bff/` → BFF
- **Web** (3000) — Next.js 前端，SSR
- **BFF** (3002) — Hono 中间层，鉴权、聚合
- **API** (3001) — Next.js 后端，业务逻辑
- **PostgreSQL** (5432) — 数据库
- **Redis** (6379) — 缓存和队列

---

## 一、服务器配置 (192.168.1.230)

### 1.1 前置条件

- Docker Desktop 已安装并运行
- Jenkins 已按"服务器改造.md"部署在 Docker 容器中
- ngrok 已安装

### 1.2 克隆项目

```powershell
mkdir C:\srv\deploy
cd C:\srv\deploy
git clone git@github.com:mygesty/taskflow.git .
```

### 1.3 创建数据目录

```powershell
mkdir C:\srv\deploy\data\pgdata
mkdir C:\srv\deploy\data\redis
```

### 1.4 首次部署后更新 .env

Jenkinsfile 首次运行时会自动从 `.env.example` 复制生成 `.env`。**部署成功后**，SSH 到服务器编辑 `C:\srv\deploy\.env`，将 `JWT_SECRET` 替换为真实密钥：

```powershell
notepad C:\srv\deploy\.env
```

之后 `git pull` 不会影响该文件（untracked）。

生成随机密钥：

```powershell
powershell -Command "[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()"
```

---

## 二、Jenkins 配置

### 2.1 挂载项目目录到 Jenkins

编辑 Jenkins 的 `docker-compose.yml`（位于 `C:\srv\compose\jenkins\`），在 `volumes` 下添加：

```yaml
volumes:
  - jenkins_home:/var/jenkins_home
  - /var/run/docker.sock:/var/run/docker.sock
  - C:\srv\deploy:/workspace    # 新增这一行
```

重启 Jenkins：

```powershell
docker compose -f C:\srv\compose\jenkins\docker-compose.yml restart
```

### 2.2 创建 Jenkins Pipeline 任务

1. 浏览器访问 `http://192.168.1.230:8080`
2. **New Item** → 输入名称（如 `taskflow`）→ 选择 **Pipeline** → OK
3. 配置：
   - **GitHub project**：填写 `https://github.com/mygesty/taskflow/`
   - **Build Triggers**：勾选 **GitHub hook trigger for GITScm polling**
   - **Pipeline → Definition**：`Pipeline script from SCM`
     - **SCM**：`Git`
     - **Repository URL**：`https://github.com/mygesty/taskflow.git`
     - **Credentials**：选择已添加的 GitHub 凭据
     - **Branches to build**：`*/main`
     - **Script Path**：`Jenkinsfile`
4. 保存

### 2.3 验证 docker.sock 连通性

在 Jenkins 容器中执行，确认能操控宿主 Docker：

```powershell
docker exec jenkins docker version
```

---

## 三、ngrok 配置

### 3.1 启动 ngrok 隧道

在 `192.168.1.230` 上运行：

```powershell
ngrok http 8080
```

你会看到 Forwarding URL：`https://jinkens-gesty.ddnsto.com`

### 3.2 设置为 Windows 服务（开机自启）

使用 NSSM 或创建计划任务，让 ngrok 在后台持续运行：

```powershell
# 创建计划任务方式
$action  = New-ScheduledTaskAction -Execute "ngrok" -Argument "http 8080 --log=stdout"
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "NgrokTunnel" -Action $action -Trigger $trigger -RunLevel Highest
```

---

## 四、GitHub Webhook 配置

### 4.1 添加 Webhook

GitHub 仓库 → **Settings → Webhooks → Add webhook**：

| 字段 | 值 |
|------|-----|
| Payload URL | `https://jinkens-gesty.ddnsto.com/github-webhook/` |
| Content type | `application/json` |
| Secret | 见 4.2 |
| Events | `Just the push event` |
| Active | 勾选 |

### 4.2 配置 Webhook Secret（推荐）

1. 生成随机字符串：
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})
   ```
2. GitHub webhook 表单 **Secret** 填入该串
3. Jenkins → **Manage Jenkins → System → GitHub → Advanced → Shared secrets → Add → Secret text**，填入同一串

---

## 五、验证流程

### 5.1 手动触发测试

在 Jenkins 任务页点 **Build Now**，确认能走通完整流水线：
- Pull 代码 → Build 镜像 → Deploy → DB Migration → Health Check

### 5.2 Webhook 触发测试

```bash
git commit --allow-empty -m "test: trigger Jenkins deploy"
git push origin main
```

观察：
1. GitHub webhook Recent Deliveries 显示 `200`
2. Jenkins 任务页自动触发构建
3. 容器更新完成

### 5.3 验证部署

```powershell
# 内网访问
curl http://192.168.1.230/
curl http://192.168.1.230/api/bff/health

# 查看容器状态
docker ps
```

---

## 六、常用运维命令

```powershell
cd C:\srv\deploy

# 查看日志
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f web

# 重启单个服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart web

# 停止所有服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# 手动更新部署（不走 Jenkins）
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker image prune -f

# 数据库备份
docker compose exec postgres pg_dump -U taskflow taskflow > backup_$(Get-Date -Format "yyyyMMdd").sql

# 清理旧镜像
docker image prune -af --filter "until=240h"
```

---

## 七、故障排查

| 现象 | 排查方向 |
|------|----------|
| Jenkins 构建失败 `docker: not found` | Jenkins 容器内未安装 docker CLI，参考 服务器改造.md 4.3 |
| Webhook 返回 404 | URL 末尾缺少 `/`，完整路径是 `/github-webhook/` |
| Webhook 返回 timeout | GitHub 访问不到 ngrok URL，检查 ngrok 是否在运行 |
| 容器无法启动 | `docker compose logs` 查看日志 |
| 数据库迁移失败 | 确认 postgres 容器已 healthy，手动执行迁移 |
| 路径无法访问 | 确认 `C:\srv\deploy` 已挂载到 Jenkins 容器 `/workspace` |
测试cicd
