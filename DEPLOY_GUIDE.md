# 博客平台 - 服务器部署文档

## 📦 部署包说明

本部署包包含完整的服务器部署和配置系统，让您能够轻松在服务器上部署和启动博客平台。

## 🚀 快速开始

### 1. 上传代码到服务器

```bash
# 方式 1: 使用 Git
git clone https://github.com/xianqu023/TDblog.git
cd TDblog

# 方式 2: 使用 SCP 上传压缩包
scp blog-platform.tar.gz user@server:/path/to/deploy
tar -xzf blog-platform.tar.gz
cd blog-platform
```

### 2. 安装系统依赖

```bash
# 安装 Node.js (>= 18.0.0)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2
```

### 3. 配置系统

```bash
# 复制配置文件
cp conf.ini.example conf.ini

# 编辑配置文件
vim conf.ini

# 生成安全密钥
openssl rand -base64 32
# 将生成的密钥填入 conf.ini 的 [auth] 部分
```

### 4. 部署和启动

```bash
# 方式 1: 使用部署脚本（推荐）
chmod +x deploy.sh
./deploy.sh

# 方式 2: 使用快速启动脚本
chmod +x start.sh
./start.sh

# 方式 3: 手动部署
pnpm install
pnpm build
pm2 start ecosystem.config.js
pm2 save
```

## 📋 配置文件说明

### conf.ini 配置项

#### [server] - 服务器配置
- `port`: 服务端口（默认：3000）
- `host`: 监听地址（默认：0.0.0.0）
- `node_env`: 运行环境（默认：production）
- `instances`: 进程数（默认：1）
- `max_memory`: 最大内存（默认：1G）

#### [database] - 数据库配置
- `url`: 数据库连接 URL（SQLite 文件路径）

#### [auth] - 认证配置
- `secret`: JWT 密钥（**必须修改**，使用 `openssl rand -base64 32` 生成）
- `url`: 网站 URL

#### [site] - 网站配置
- `name`: 网站名称
- `url`: 网站地址

#### [storage] - 存储配置
- `driver`: 存储驱动（local, s3, oss 等）
- `local_path`: 本地存储路径
- `local_url`: 访问 URL 前缀

#### [ai] - AI 配置（可选）
- `api_key`: OpenAI API 密钥
- `base_url`: API 基础 URL
- `model`: 使用的模型

## 🔧 常用命令

### 部署脚本 (deploy.sh)

```bash
# 标准部署
./deploy.sh

# 重新构建（清理 .next）
./deploy.sh --rebuild

# 完全清理后部署
./deploy.sh --clean

# 跳过构建，只安装依赖
./deploy.sh --skip-build

# 查看帮助
./deploy.sh --help
```

### 快速启动脚本 (start.sh)

```bash
# 启动服务
./start.sh

# 重启服务
./start.sh --restart

# 停止服务
./start.sh --stop

# 查看状态
./start.sh --status

# 查看日志
./start.sh --logs

# 查看帮助
./start.sh --help
```

### PM2 命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs blog-platform

# 重启服务
pm2 restart blog-platform

# 停止服务
pm2 stop blog-platform

# 删除服务
pm2 delete blog-platform

# 保存进程列表
pm2 save

# 开机自启
pm2 startup
pm2 save
```

## 🌐 Nginx 反向代理配置

如果需要将博客平台暴露在 80 端口，建议使用 Nginx 反向代理：

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 启用 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 🔍 故障排查

### 查看日志

```bash
# PM2 日志
pm2 logs blog-platform

# 应用日志
tail -f logs/pm2-error.log
tail -f logs/pm2-out.log
```

### 检查端口占用

```bash
# 查看 3000 端口
lsof -i:3000
netstat -tulpn | grep 3000
```

### 重启服务

```bash
# 使用 PM2
pm2 restart blog-platform

# 使用脚本
./start.sh --restart
```

### 数据库问题

```bash
# 检查数据库文件
ls -la packages/database/prisma/blog.db

# 重新生成 Prisma 客户端
cd packages/database
pnpm exec prisma generate

# 运行迁移
pnpm exec prisma migrate deploy
```

## 📊 性能优化

### 1. 调整 PM2 进程数

在 `conf.ini` 中修改：
```ini
[server]
instances = 4  # 根据 CPU 核心数调整
```

### 2. 增加内存限制

```ini
[server]
max_memory = 2G  # 根据服务器内存调整
```

### 3. 启用 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

## 🔐 安全建议

1. **修改默认密钥**：使用强随机密钥
2. **启用 HTTPS**：使用 Let's Encrypt 免费证书
3. **配置防火墙**：只开放必要的端口
4. **定期备份**：备份数据库和上传文件
5. **更新系统**：定期更新 Node.js 和依赖

## 📝 备份和恢复

### 备份数据库

```bash
# 备份
cp packages/database/prisma/blog.db blog.db.backup.$(date +%Y%m%d)

# 恢复
cp blog.db.backup.20260423 packages/database/prisma/blog.db
```

### 备份上传文件

```bash
tar -czf uploads.backup.tar.gz apps/web/uploads/
```

## 🎯 完整部署示例

```bash
# 1. 安装依赖
sudo apt-get update
sudo apt-get install -y nodejs npm nginx
npm install -g pnpm pm2

# 2. 克隆代码
git clone https://github.com/xianqu023/TDblog.git
cd TDblog

# 3. 配置系统
cp conf.ini.example conf.ini
vim conf.ini  # 修改配置

# 4. 部署
chmod +x deploy.sh
./deploy.sh

# 5. 配置 Nginx
sudo ln -s $(pwd)/nginx.conf /etc/nginx/sites-available/blog
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. 启用开机自启
pm2 startup
pm2 save

# 7. 配置防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📞 技术支持

如有问题，请查看：
- 项目文档：`docs/` 目录
- GitHub Issues: https://github.com/xianqu023/TDblog/issues
- PM2 文档：https://pm2.keymetrics.io/docs/
