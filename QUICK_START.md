# 🚀 快速开始指南

## 📦 已完成的功能

### ✅ 自动化部署脚本
- **文件位置**: [`deploy.sh`](deploy.sh)
- **功能**: 环境检查、依赖安装、数据库初始化、应用构建、服务启动
- **默认管理员**: admin / Admin@123456

### ✅ 路由和数据库路径修复
- **配置文件**: [`packages/database/prisma.config.js`](packages/database/prisma.config.js)
- **环境变量**: [`.env.example`](.env.example)
- **PM2 配置**: [`ecosystem.config.js`](ecosystem.config.js)

### ✅ 交互式菜单系统
- 支持数字选择操作
- 支持命令行参数直接执行
- 自动加载系统日志

---

## 🎯 使用方法

### 方法 1: 交互式菜单（推荐新手）

```bash
# 运行交互式菜单
bash deploy.sh

# 或使用 npm script
pnpm deploy:menu
```

**菜单选项：**
```
╔═══════════════════════════════════════════════════════════╗
║                  📋 部署管理菜单                     ║
╠═══════════════════════════════════════════════════════════╣
║  1. 完整部署（环境检查 + 安装 + 构建 + 启动）         ║
║  2. 快速部署（仅构建 + 启动）                         ║
║  3. 环境检查                                          ║
║  4. 安装依赖                                          ║
║  5. 数据库初始化                                      ║
║  6. 构建应用                                          ║
║  7. 启动服务                                          ║
║  8. 停止服务                                          ║
║  9. 重启服务                                          ║
║  10. 查看日志                                         ║
║  11. 清理构建缓存                                     ║
║  0. 退出                                              ║
╚═══════════════════════════════════════════════════════════╝
```

**操作示例：**
- 输入 `1` 并回车 → 执行完整部署
- 输入 `7` 并回车 → 启动服务
- 输入 `9` 并回车 → 重启服务
- 输入 `10` 并回车 → 查看日志
- 输入 `0` 并回车 → 退出

---

### 方法 2: 命令行参数（推荐高级用户）

```bash
# 完整部署（首次部署）
bash deploy.sh full

# 快速部署（更新代码后）
bash deploy.sh quick

# 启动服务
bash deploy.sh start

# 停止服务
bash deploy.sh stop

# 重启服务
bash deploy.sh restart

# 查看日志
bash deploy.sh logs

# 清理缓存
bash deploy.sh clean

# 环境检查
bash deploy.sh check
```

---

### 方法 3: NPM Scripts

```bash
# 完整部署
pnpm deploy:full

# 快速部署
pnpm deploy:quick

# 交互式菜单
pnpm deploy:menu

# 启动服务
pnpm start

# 使用 PM2 启动
pnpm start:pm2

# 重启服务
pnpm restart

# 停止服务
pnpm stop

# 查看日志
pnpm logs

# 清理缓存
pnpm clean
```

---

## 🎮 完整部署流程

### 步骤 1: 首次部署

```bash
# 1. 检查环境
bash test-deploy.sh

# 2. 复制环境变量
cp .env.example .env

# 3. 运行完整部署
bash deploy.sh full

# 等待部署完成，记录默认管理员密码
```

### 步骤 2: 访问系统

部署完成后，打开浏览器访问：
```
http://localhost:3000
```

使用默认管理员账户登录：
- **用户名**: admin
- **邮箱**: admin@example.com
- **密码**: Admin@123456

**⚠️ 重要：首次登录后立即修改密码！**

### 步骤 3: 生产环境配置（可选）

```bash
# 1. 编辑环境变量
nano .env

# 2. 修改以下配置：
JWT_SECRET=生成强随机字符串
NEXTAUTH_SECRET=生成强随机字符串
NEXTAUTH_URL=https://your-domain.com

# 3. 使用 PM2 管理进程
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📊 系统状态检查

### 检查环境
```bash
bash test-deploy.sh
```

### 查看服务状态
```bash
# 检查端口
lsof -ti:3000

# 查看 PM2 状态
pm2 status blog-platform

# 查看进程
ps aux | grep node
```

### 查看日志
```bash
# 实时日志
tail -f logs/*.log

# PM2 日志
pm2 logs blog-platform

# 最近部署日志
ls -lt logs/deploy-*.log | head -1 | awk '{print $9}' | xargs tail -100
```

---

## 🔧 常见问题快速解决

### 问题 1: 端口被占用
```bash
# 查找占用进程
lsof -ti:3000

# 停止进程
lsof -ti:3000 | xargs kill -9

# 或修改端口
echo "PORT=3001" >> .env
```

### 问题 2: 服务未启动
```bash
# 启动服务
bash deploy.sh start

# 或使用 PM2
pm2 start ecosystem.config.js
```

### 问题 3: 数据库错误
```bash
# 重新初始化数据库
bash deploy.sh 5

# 或手动执行
cd packages/database
npx prisma migrate deploy
cd ../..
```

### 问题 4: 构建失败
```bash
# 清理缓存
bash deploy.sh clean

# 重新构建
bash deploy.sh build
```

---

## 📁 重要文件位置

### 配置文件
- **环境变量**: `.env`
- **PM2 配置**: `ecosystem.config.js`
- **数据库配置**: `packages/database/prisma.config.js`
- **Prisma Schema**: `packages/database/prisma/schema.prisma`

### 日志文件
- **部署日志**: `logs/deploy-YYYYMMDD-HHMMSS.log`
- **PM2 错误日志**: `logs/pm2-error.log`
- **PM2 输出日志**: `logs/pm2-out.log`

### 构建产物
- **Standalone**: `apps/web/.next/standalone/`
- **Static**: `apps/web/.next/static/`
- **数据库**: `packages/database/prisma/blog.db`

---

## 🎯 日常运维命令

### 启动/停止/重启
```bash
# 启动
bash deploy.sh start

# 停止
bash deploy.sh stop

# 重启
bash deploy.sh restart
```

### 查看状态
```bash
# 查看日志
bash deploy.sh logs

# 查看进程
ps aux | grep node

# 查看端口
lsof -ti:3000
```

### 更新部署
```bash
# 1. 拉取最新代码
git pull

# 2. 快速部署
bash deploy.sh quick

# 3. 查看日志
bash deploy.sh logs
```

---

## 📖 详细文档

- **完整部署指南**: [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
- **测试脚本**: [`test-deploy.sh`](test-deploy.sh)
- **构建优化指南**: [`BUILD_OPTIMIZATION_GUIDE.md`](BUILD_OPTIMIZATION_GUIDE.md)

---

## 🎉 总结

现在您拥有一个完整的自动化部署系统：

✅ **一键部署** - 支持完整部署和快速部署  
✅ **交互菜单** - 数字选择，简单易用  
✅ **自动初始化** - 数据库、管理员自动创建  
✅ **路径修复** - 所有路由和数据库路径已修复  
✅ **日志管理** - 自动加载系统运行日志  
✅ **便捷操作** - 支持多种操作方式  

**开始使用：**
```bash
bash deploy.sh
```

**祝使用愉快！** 🚀
