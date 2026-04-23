# Blog Platform - 部署指南

## 📋 目录

- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [部署方式](#部署方式)
- [数据库配置](#数据库配置)
- [生产环境优化](#生产环境优化)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

只需编辑 `conf.ini` 文件：

```bash
# 编辑配置文件
vim conf.ini

# 或使用示例文件
cp conf.ini.full-example conf.ini
```

### 3. 初始化配置和数据库

```bash
# 自动加载配置并初始化数据库
pnpm init
```

### 4. 启动应用

**开发环境：**
```bash
pnpm dev
```

**生产环境：**
```bash
# 方式 1：直接启动
pnpm start:prod

# 方式 2：使用 PM2（推荐）
pnpm start:pm2
```

---

## ⚙️ 配置说明

### 配置文件结构

`conf.ini` 包含所有必需的配置项，系统会自动识别并应用。

#### 数据库配置 `[database]`

```ini
[database]
# 数据库类型：sqlite, mysql, postgresql
provider = sqlite

# 连接字符串（自动识别数据库类型）
url = file:./packages/database/prisma/blog.db
```

**支持的数据库类型：**
- **SQLite**（默认）：适合开发和小型生产环境
  ```ini
  url = file:./packages/database/prisma/blog.db
  ```
  
- **MySQL**：
  ```ini
  provider = mysql
  url = mysql://user:password@localhost:3306/blog
  ```
  
- **PostgreSQL**：
  ```ini
  provider = postgresql
  url = postgresql://user:password@localhost:5432/blog
  ```

#### 服务器配置 `[server]`

```ini
[server]
port = 3000
host = 0.0.0.0
node_env = production
```

#### 认证配置 `[auth]`

```ini
[auth]
# 生成随机密钥：openssl rand -base64 32
secret = your-secret-key-change-in-production
url = http://localhost:3000
```

#### 网站配置 `[site]`

```ini
[site]
name = My Blog
url = https://yourdomain.com
description = 分享技术与生活
```

#### 存储配置 `[storage]`

**本地存储：**
```ini
[storage]
driver = local
local_path = ./uploads
local_url = /uploads
serve_static = true
```

**阿里云 OSS：**
```ini
[storage]
driver = oss
oss_bucket = my-bucket
oss_region = oss-cn-hangzhou
oss_access_key = YOUR_ACCESS_KEY
oss_secret_key = YOUR_SECRET_KEY
oss_endpoint = https://oss-cn-hangzhou.aliyuncs.com
```

**AWS S3：**
```ini
[storage]
driver = s3
s3_bucket = my-bucket
s3_region = us-east-1
s3_access_key = YOUR_ACCESS_KEY
s3_secret_key = YOUR_SECRET_KEY
```

---

## 📦 部署方式

### 方式 1：源码部署

1. 上传源码到服务器

2. 安装依赖
   ```bash
   pnpm install
   ```

3. 配置 `conf.ini`

4. 初始化
   ```bash
   pnpm init
   ```

5. 构建
   ```bash
   pnpm build
   ```

6. 启动
   ```bash
   pnpm start:prod
   ```

### 方式 2：使用 PM2（推荐）

1. 安装 PM2
   ```bash
   npm install -g pm2
   ```

2. 启动应用
   ```bash
   pm2 start ecosystem.config.js
   ```

3. 设置开机自启
   ```bash
   pm2 startup
   pm2 save
   ```

### 方式 3：Docker 部署

```bash
# 构建镜像
docker build -t blog-platform .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/conf.ini:/app/conf.ini \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/packages/database/prisma:/app/packages/database/prisma \
  blog-platform
```

---

## 🗄️ 数据库配置

### SQLite（推荐用于小型项目）

**优点：**
- 零配置
- 单文件
- 易于备份

**配置：**
```ini
[database]
provider = sqlite
url = file:./packages/database/prisma/blog.db
```

### MySQL/PostgreSQL（推荐用于大型项目）

**优点：**
- 高性能
- 支持并发
- 功能完整

**配置示例（PostgreSQL）：**
```ini
[database]
provider = postgresql
url = postgresql://user:password@localhost:5432/blog
```

**数据库迁移：**
```bash
cd packages/database
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

---

## 🚀 生产环境优化

### 1. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源
    location /uploads {
        alias /path/to/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. 启用 HTTPS

```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

### 3. 性能优化

- 启用 Gzip 压缩
- 配置 CDN
- 启用数据库连接池
- 使用 Redis 缓存

### 4. 监控和日志

```bash
# 查看应用日志
pm2 logs

# 监控状态
pm2 monit

# 查看错误日志
tail -f logs/error.log
```

---

## ❓ 常见问题

### 1. 配置文件不生效？

确保 `conf.ini` 文件在项目根目录，并运行：
```bash
pnpm init
```

### 2. 数据库连接失败？

检查数据库连接字符串格式：
- SQLite: `file:./packages/database/prisma/blog.db`
- MySQL: `mysql://user:password@host:port/database`
- PostgreSQL: `postgresql://user:password@host:port/database`

### 3. 端口被占用？

修改 `conf.ini` 中的端口：
```ini
[server]
port = 3001
```

### 4. 如何生成随机密钥？

```bash
openssl rand -base64 32
```

### 5. 如何备份数据？

**SQLite：**
```bash
cp packages/database/prisma/blog.db blog.db.backup
```

**MySQL/PostgreSQL：**
```bash
# MySQL
mysqldump -u user -p blog > backup.sql

# PostgreSQL
pg_dump -U user blog > backup.sql
```

### 6. 如何更新部署？

```bash
# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 重新构建
pnpm build

# 重启应用
pm2 restart all
```

---

## 📞 获取帮助

如有问题，请查看：
- 完整配置示例：`conf.ini.full-example`
- 配置加载器：`scripts/config-loader.js`
- 启动脚本：`scripts/start-prod.js`
