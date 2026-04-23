# 服务器部署和配置系统

## 📦 概述

本项目提供完整的服务器部署解决方案，包括：

- ✅ 一键安装脚本（Ubuntu/Debian）
- ✅ 部署脚本（支持多种部署模式）
- ✅ 快速启动脚本
- ✅ PM2 进程管理
- ✅ Nginx 配置示例
- ✅ Systemd 服务配置
- ✅ 配置文件管理

## 🚀 快速部署

### 方式一：一键安装（推荐）

适合全新服务器部署：

```bash
# 下载并执行安装脚本
curl -O https://raw.githubusercontent.com/xianqu023/TDblog/main/install.sh
chmod +x install.sh
sudo ./install.sh
```

安装脚本会自动：
- 安装 Node.js、pnpm、PM2、Nginx
- 创建 blog 用户
- 下载代码
- 配置系统
- 部署应用
- 配置 Nginx 和防火墙

### 方式二：手动部署

适合已有环境的服务器：

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
```

## 📋 文件说明

### 核心脚本

| 文件 | 说明 | 用途 |
|------|------|------|
| `install.sh` | 一键安装脚本 | 自动安装所有依赖和配置系统 |
| `deploy.sh` | 部署脚本 | 安装依赖、构建、启动服务 |
| `start.sh` | 快速启动 | 启动、停止、重启服务 |
| `ecosystem.config.js` | PM2 配置 | 定义进程管理参数 |
| `conf.ini.example` | 配置示例 | 配置文件模板 |

### 配置文件

| 文件 | 说明 | 用途 |
|------|------|------|
| `conf.ini` | 主配置文件 | 服务器、数据库、认证等配置 |
| `nginx.conf.example` | Nginx 配置 | 反向代理配置示例 |
| `blog-platform.service` | Systemd 配置 | 系统服务配置示例 |

### 文档

| 文件 | 说明 |
|------|------|
| `DEPLOY_GUIDE.md` | 完整部署指南 |
| `SERVER_README.md` | 本文档 |

## 🔧 使用指南

### 1. 配置文件

编辑 `conf.ini`：

```ini
[server]
port = 3000
host = 0.0.0.0
node_env = production
instances = 1
max_memory = 1G

[database]
url = file:./packages/database/prisma/blog.db

[auth]
secret = your-secret-key-here  # 必须修改！
url = http://your-domain.com

[site]
name = 我的博客
url = http://your-domain.com
```

### 2. 部署脚本

```bash
# 标准部署
./deploy.sh

# 重新构建（清理 .next）
./deploy.sh --rebuild

# 完全清理后部署
./deploy.sh --clean

# 跳过构建，只安装依赖
./deploy.sh --skip-build
```

### 3. 启动脚本

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
```

### 4. PM2 管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs blog-platform

# 重启
pm2 restart blog-platform

# 停止
pm2 stop blog-platform

# 开机自启
pm2 startup
pm2 save
```

## 🌐 Nginx 配置

### 基本配置

```bash
# 复制配置
sudo cp nginx.conf.example /etc/nginx/sites-available/blog

# 编辑配置
sudo vim /etc/nginx/sites-available/blog

# 启用站点
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/

# 测试并重启
sudo nginx -t
sudo systemctl restart nginx
```

### HTTPS 配置

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 3 * * * certbot renew --quiet
```

## 🔍 故障排查

### 查看日志

```bash
# 应用日志
pm2 logs blog-platform

# PM2 日志
tail -f logs/pm2-error.log
tail -f logs/pm2-out.log

# Nginx 日志
sudo tail -f /var/log/nginx/blog-error.log
sudo tail -f /var/log/nginx/blog-access.log
```

### 常见问题

**1. 服务无法启动**

```bash
# 检查端口
lsof -i:3000

# 查看 PM2 状态
pm2 status

# 查看详细日志
pm2 logs blog-platform --lines 100
```

**2. 数据库错误**

```bash
# 检查数据库文件
ls -la packages/database/prisma/blog.db

# 重新生成 Prisma
cd packages/database
pnpm exec prisma generate
```

**3. 权限问题**

```bash
# 修复权限
chown -R blog:blog /home/blog/TDblog
chmod +x deploy.sh start.sh
```

## 📊 性能优化

### 1. 调整进程数

编辑 `conf.ini`：

```ini
[server]
instances = 4  # CPU 核心数
```

### 2. 增加内存限制

```ini
[server]
max_memory = 2G
```

### 3. 启用缓存

在 Nginx 配置中添加：

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔐 安全建议

1. **修改密钥**：使用强随机密钥
2. **启用 HTTPS**：使用 Let's Encrypt
3. **配置防火墙**：只开放必要端口
4. **定期备份**：
   ```bash
   # 备份数据库
   cp packages/database/prisma/blog.db blog.db.backup.$(date +%Y%m%d)
   
   # 备份上传文件
   tar -czf uploads.backup.tar.gz apps/web/uploads/
   ```

## 📝 备份和恢复

### 备份

```bash
# 完整备份
tar -czf blog-backup-$(date +%Y%m%d).tar.gz \
    apps/web/uploads \
    packages/database/prisma/blog.db \
    conf.ini
```

### 恢复

```bash
# 解压备份
tar -xzf blog-backup-20260423.tar.gz

# 恢复数据库
cp packages/database/prisma/blog.db packages/database/prisma/blog.db

# 恢复上传文件
cp -r apps/web/uploads/* apps/web/uploads/
```

## 🎯 完整部署流程

```bash
# 1. 准备服务器（Ubuntu 20.04+）
sudo apt-get update && sudo apt-get upgrade -y

# 2. 一键安装
curl -O https://raw.githubusercontent.com/xianqu023/TDblog/main/install.sh
chmod +x install.sh
sudo ./install.sh

# 3. 配置域名
# 编辑 conf.ini，修改 site.url

# 4. 配置 HTTPS
sudo certbot --nginx -d your-domain.com

# 5. 创建管理员账户
# 访问 http://your-domain.com/zh/admin/signup

# 6. 完成
# 访问：https://your-domain.com
```

## 📞 技术支持

- 文档：`DEPLOY_GUIDE.md`
- GitHub Issues: https://github.com/xianqu023/TDblog/issues
- PM2 文档：https://pm2.keymetrics.io

## 📄 许可证

MIT License
