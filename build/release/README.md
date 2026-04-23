# 博客平台 - 服务版本发布包

版本：1.0.0
构建时间：20260423_195520
构建类型：standard

## 📦 快速部署

### 方式一：使用部署脚本（推荐）

```bash
# 1. 解压
tar -xzf blog-platform-1.0.0-20260423_195520.tar.gz
cd blog-platform

# 2. 配置
cp conf.ini.example conf.ini
vim conf.ini  # 修改配置

# 3. 部署
chmod +x deploy.sh
./deploy.sh
```

### 方式二：手动部署

```bash
# 1. 安装依赖（如果是 lite 构建）
pnpm install

# 2. 构建（如果需要）
pnpm build

# 3. 启动
pnpm start:prod
# 或使用 PM2
pm2 start ecosystem.config.js
```

## 📋 配置说明

编辑 `conf.ini` 文件：

```ini
[server]
port = 3000
host = 0.0.0.0
node_env = production

[database]
url = file:./packages/database/prisma/blog.db

[auth]
secret = your-secret-key-here  # 必须修改！
url = https://your-domain.com

[site]
name = 我的博客
url = https://your-domain.com
```

## 🔧 使用脚本

```bash
# 部署
./deploy.sh

# 启动
./start.sh

# 查看状态
./start.sh --status

# 查看日志
./start.sh --logs
```

## 📄 完整文档

- 部署指南：`DEPLOY_GUIDE.md`
- 服务器使用说明：`SERVER_README.md`

## 🆘 技术支持

GitHub: https://github.com/xianqu023/TDblog/issues
