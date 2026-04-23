# 环境变量配置简化方案

## 📋 概述

通过 `conf.ini` 一个文件管理所有环境变量配置，系统自动识别数据库类型并初始化。

## 🎯 主要特性

### 1. 单一配置文件
- 所有配置项集中在 `conf.ini`
- 无需手动创建 `.env` 文件
- 支持所有环境（开发、测试、生产）

### 2. 自动数据库识别
- 自动识别 SQLite、MySQL、PostgreSQL
- 自动执行数据库迁移
- 自动生成 Prisma Client

### 3. 自动初始化
- 一键加载所有配置
- 自动设置环境变量
- 自动生成 `.env` 文件

## 🚀 快速开始

### 步骤 1：编辑配置文件

```bash
# 编辑配置
vim conf.ini

# 或使用完整示例
cp conf.ini.full-example conf.ini
```

### 步骤 2：初始化配置

```bash
pnpm init
```

这个命令会：
- ✅ 读取 `conf.ini` 配置
- ✅ 自动识别数据库类型
- ✅ 初始化数据库（迁移 + 生成 Prisma Client）
- ✅ 生成 `.env` 文件
- ✅ 显示配置摘要

### 步骤 3：启动应用

```bash
# 开发环境
pnpm dev

# 生产环境（直接启动）
pnpm start:prod

# 生产环境（PM2 管理）
pnpm start:pm2
```

## 📝 配置示例

### 最小配置（SQLite）

```ini
[database]
provider = sqlite
url = file:./packages/database/prisma/blog.db

[server]
port = 3000

[auth]
secret = your-secret-key

[site]
name = My Blog
url = http://localhost:3000
```

### MySQL 配置

```ini
[database]
provider = mysql
url = mysql://root:password@localhost:3306/blog

[server]
port = 3000
node_env = production

[auth]
secret = your-secret-key
url = https://yourdomain.com

[site]
name = My Blog
url = https://yourdomain.com
```

### PostgreSQL 配置

```ini
[database]
provider = postgresql
url = postgresql://user:password@localhost:5432/blog

[server]
port = 3000

[auth]
secret = your-secret-key

[site]
name = My Blog
url = https://yourdomain.com

[storage]
driver = oss
oss_bucket = my-bucket
oss_region = oss-cn-hangzhou
oss_access_key = YOUR_ACCESS_KEY
oss_secret_key = YOUR_SECRET_KEY
```

## 🔧 配置项说明

### 必需配置

| 配置段 | 配置项 | 说明 | 默认值 |
|--------|--------|------|--------|
| `[database]` | `provider` | 数据库类型 | `sqlite` |
| `[database]` | `url` | 数据库连接字符串 | - |
| `[server]` | `port` | 服务端口 | `3000` |
| `[auth]` | `secret` | 认证密钥 | 自动生成 |
| `[site]` | `name` | 网站名称 | `My Blog` |
| `[site]` | `url` | 网站 URL | `http://localhost:3000` |

### 可选配置

详见 `conf.ini.full-example` 文件，包含：
- AI 服务配置
- CDN 配置
- 支付配置（Stripe、PayPal、支付宝、微信支付）
- 邮件配置
- 日志配置
- 缓存配置
- 安全配置
- 性能优化配置

## 📦 部署脚本

### 配置加载器

```bash
node scripts/config-loader.js
```

功能：
- 解析 `conf.ini`
- 自动识别数据库类型
- 设置所有环境变量
- 初始化数据库
- 生成 `.env` 文件

### 生产环境启动

```bash
node scripts/start-prod.js
```

功能：
- 检查并安装依赖
- 加载配置
- 初始化数据库
- 构建应用（如未构建）
- 启动服务

### PM2 管理

```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart all

# 停止
pm2 stop all
```

## 🗄️ 数据库自动识别

系统通过以下方式自动识别数据库类型：

1. **从 URL 协议识别**
   - `file:` → SQLite
   - `mysql://` → MySQL
   - `postgresql://` 或 `postgres://` → PostgreSQL

2. **从文件扩展名识别**
   - `.db` → SQLite
   - `.sqlite` → SQLite

3. **从配置识别**
   - 使用 `provider` 配置项

## 🔐 安全建议

### 生产环境配置

1. **修改密钥**
   ```bash
   # 生成随机密钥
   openssl rand -base64 32
   ```
   
   然后在 `conf.ini` 中配置：
   ```ini
   [auth]
   secret = 生成的随机密钥
   ```

2. **使用 HTTPS**
   ```ini
   [auth]
   url = https://yourdomain.com
   
   [site]
   url = https://yourdomain.com
   ```

3. **配置数据库连接**
   - 使用强密码
   - 限制数据库访问 IP
   - 启用 SSL（如果支持）

4. **文件权限**
   ```bash
   # 保护配置文件
   chmod 600 conf.ini
   
   # 保护上传目录
   chmod 755 uploads
   ```

## 📊 环境变量映射

`conf.ini` 配置会自动映射为环境变量：

| conf.ini | 环境变量 |
|----------|----------|
| `database.url` | `DATABASE_URL` |
| `auth.secret` | `AUTH_SECRET`, `NEXTAUTH_SECRET` |
| `auth.url` | `NEXTAUTH_URL` |
| `site.name` | `NEXT_PUBLIC_SITE_NAME` |
| `site.url` | `NEXT_PUBLIC_SITE_URL` |
| `server.port` | `PORT` |
| `server.host` | `HOST` |
| `storage.driver` | `STORAGE_DRIVER` |
| `storage.local_path` | `STORAGE_LOCAL_PATH` |
| `storage.local_url` | `STORAGE_LOCAL_URL` |

## 🐛 故障排查

### 配置文件不生效

```bash
# 1. 检查文件是否存在
ls -la conf.ini

# 2. 重新初始化
pnpm init

# 3. 检查生成的 .env
cat .env
```

### 数据库连接失败

```bash
# 1. 检查数据库配置
cat conf.ini | grep -A 2 "\[database\]"

# 2. 手动初始化数据库
cd packages/database
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

### 端口被占用

```bash
# 修改端口
vim conf.ini

# 在 [server] 段修改
port = 3001
```

## 📚 相关文件

- `conf.ini` - 主配置文件
- `conf.ini.full-example` - 完整配置示例
- `scripts/config-loader.js` - 配置加载器
- `scripts/start-prod.js` - 生产环境启动脚本
- `ecosystem.config.js` - PM2 配置文件
- `DEPLOY.md` - 详细部署指南

## 🎉 总结

通过 `conf.ini` 配置系统，你只需要：

1. ✏️ **编辑一个文件** - `conf.ini`
2. 🚀 **运行一个命令** - `pnpm init`
3. ▶️ **启动服务** - `pnpm start:prod` 或 `pnpm start:pm2`

系统会自动处理：
- ✅ 配置加载
- ✅ 数据库识别
- ✅ 数据库初始化
- ✅ 环境变量设置
- ✅ `.env` 文件生成

让配置管理变得如此简单！
