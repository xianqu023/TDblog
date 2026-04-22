# Blog Platform 部署指南

## 系统要求

- Node.js >= 18.0.0
- npm 或 pnpm

## 快速部署

### 1. 上传到服务器

```bash
scp blog-platform-*.tar.gz user@server:/path/to/deploy/
```

### 2. 解压

```bash
ssh user@server
cd /path/to/deploy/
tar -xzf blog-platform-*.tar.gz
cd deploy
```

### 3. 配置 conf.ini（简单！）

```bash
cp conf.ini.example conf.ini
# 编辑 conf.ini，修改以下配置：
```

**conf.ini 配置说明：**

```ini
[database]
# 数据库类型: sqlite, postgresql, mysql
provider = sqlite

# 数据库连接字符串
# SQLite: file:./data/blog.db（相对路径，自动识别）
# PostgreSQL: postgresql://user:password@localhost:5432/blog
# MySQL: mysql://user:password@localhost:3306/blog
url = file:./data/blog.db

[server]
# 服务端口
port = 3000

# Node 环境
node_env = production

[auth]
# NextAuth 密钥（生产环境请修改为随机字符串）
# 生成: openssl rand -base64 32
secret = your-secret-key-change-in-production

# 认证 URL
url = https://your-domain.com

[site]
# 网站名称
name = My Blog

# 网站 URL
url = https://your-domain.com

[storage]
# 存储驱动: local, s3, oss
driver = local

# 本地存储路径（相对路径，自动识别）
local_path = ./uploads

# 本地存储 URL 前缀
local_url = /uploads
```

### 4. 启动应用

```bash
# 直接启动（自动读取 conf.ini 配置）
bash start.sh

# 或使用 PM2（推荐用于生产环境）
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 数据库切换

项目支持三种数据库，只需修改 conf.ini 中的 `provider` 和 `url`：

### SQLite（默认，适合开发/小型站点）

```ini
[database]
provider = sqlite
url = file:./data/blog.db
```

### PostgreSQL（推荐用于生产环境）

```ini
[database]
provider = postgresql
url = postgresql://user:password@localhost:5432/blog
```

### MySQL

```ini
[database]
provider = mysql
url = mysql://user:password@localhost:3306/blog
```

## 路径自动识别

所有相对路径都会自动转换为绝对路径，无需担心部署路径问题：

- `file:./data/blog.db` → 自动识别为部署目录的绝对路径
- `./uploads` → 自动识别为部署目录的 uploads 文件夹

## 目录结构

```
deploy/
├── apps/
│   └── web/
│       ├── .next/
│       │   ├── standalone/    # 构建产物
│       │   └── static/        # 静态资源
│       └── public/            # 公共静态文件
├── packages/
│   └── database/
│       └── prisma/
│           └── schema.prisma  # 数据库模型
├── uploads/                   # 上传文件目录
├── logs/                      # 日志目录
├── conf.ini.example           # 配置示例
├── conf.ini                   # 用户配置文件
├── start.sh                   # 启动脚本
├── ecosystem.config.js        # PM2 配置
└── DEPLOY.md                  # 部署说明
```

## 常见问题

### 1. 端口被占用

编辑 conf.ini，修改端口：
```ini
[server]
port = 3001
```

### 2. 数据库迁移失败

确保数据库连接字符串正确：
```bash
cd packages/database
npx prisma migrate status
```

### 3. 文件上传失败

确保 uploads 目录有写入权限：
```bash
chmod -R 755 uploads
```

## Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /path/to/deploy/uploads/;
        expires 30d;
    }
}
```

## 性能优化

1. 启用 gzip 压缩
2. 配置 CDN
3. 使用 PostgreSQL 替代 SQLite（生产环境）
4. 定期备份数据库
