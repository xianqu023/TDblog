# 🚀 博客平台自动化部署指南

## 📋 目录

- [快速开始](#快速开始)
- [部署脚本功能](#部署脚本功能)
- [使用方法](#使用方法)
- [交互式菜单](#交互式菜单)
- [命令行参数](#命令行参数)
- [常见问题](#常见问题)

---

## 🎯 快速开始

### 一键完整部署

```bash
# 方法 1: 使用 npm script
pnpm deploy:full

# 方法 2: 直接运行脚本
bash deploy.sh full
```

### 交互式部署

```bash
# 方法 1: 使用 npm script
pnpm deploy:menu

# 方法 2: 直接运行脚本
bash deploy.sh
```

---

## ✨ 部署脚本功能

### 自动化功能

- ✅ **环境检查**: 自动检查 Node.js、pnpm、Git、磁盘空间
- ✅ **依赖安装**: 自动安装项目依赖
- ✅ **数据库初始化**: 自动创建和迁移数据库
- ✅ **管理员创建**: 自动生成默认管理员账户
- ✅ **应用构建**: 自动构建生产版本
- ✅ **文件复制**: 自动复制必要的静态资源
- ✅ **服务启动**: 自动启动应用服务
- ✅ **日志查看**: 自动加载系统运行日志

### 安全特性

- 🔒 环境变量检查
- 🔒 数据库连接验证
- 🔒 端口冲突检测
- 🔒 进程管理（PM2 支持）

---

## 📖 使用方法

### 1️⃣ 首次部署

```bash
# 步骤 1: 克隆代码
git clone <repository-url>
cd blog

# 步骤 2: 复制环境变量
cp .env.example .env
# 编辑 .env 文件，修改必要配置

# 步骤 3: 运行完整部署
bash deploy.sh full

# 或使用 npm script
pnpm deploy:full
```

### 2️⃣ 快速部署（更新代码后）

```bash
# 拉取最新代码
git pull

# 运行快速部署
bash deploy.sh quick

# 或使用 npm script
pnpm deploy:quick
```

### 3️⃣ 交互式部署

```bash
# 运行交互式菜单
bash deploy.sh

# 或使用 npm script
pnpm deploy:menu
```

---

## 🎮 交互式菜单

运行 `bash deploy.sh` 后，将显示以下菜单：

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

请选择操作 (0-11):
```

### 操作说明

| 数字 | 功能 | 说明 |
|------|------|------|
| 1 | 完整部署 | 执行完整的部署流程，包括环境检查、依赖安装、数据库初始化、构建和启动 |
| 2 | 快速部署 | 跳过环境检查，直接构建和启动（适合更新部署） |
| 3 | 环境检查 | 检查系统环境是否满足要求 |
| 4 | 安装依赖 | 安装项目依赖（pnpm install） |
| 5 | 数据库初始化 | 初始化数据库并创建默认管理员 |
| 6 | 构建应用 | 构建生产版本并复制必要文件 |
| 7 | 启动服务 | 启动应用服务 |
| 8 | 停止服务 | 停止运行中的服务 |
| 9 | 重启服务 | 重启服务 |
| 10 | 查看日志 | 查看最近的系统日志 |
| 11 | 清理缓存 | 清理构建缓存和临时文件 |
| 0 | 退出 | 退出部署脚本 |

---

## 💻 命令行参数

### 直接执行特定任务

```bash
# 完整部署
bash deploy.sh full

# 快速部署
bash deploy.sh quick

# 构建应用
bash deploy.sh build

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
```

### NPM Scripts

```bash
# 完整部署
pnpm deploy:full

# 快速部署
pnpm deploy:quick

# 交互式菜单
pnpm deploy:menu

# 数据库初始化
pnpm init:db

# 启动服务
pnpm start

# 使用 PM2 启动
pnpm start:pm2

# 查看日志
pnpm logs

# 查看状态
pnpm status

# 重启服务
pnpm restart

# 停止服务
pnpm stop

# 清理缓存
pnpm clean

# 设置环境变量
pnpm env:setup
```

---

## 📊 部署流程详解

### 完整部署流程

```
1. 环境检查
   ├─ 检查 Node.js (>= 18)
   ├─ 检查 pnpm
   ├─ 检查 Git
   └─ 检查磁盘空间 (>= 5GB)

2. 依赖安装
   └─ pnpm install --frozen-lockfile

3. 数据库初始化
   ├─ 创建数据库目录
   ├─ 执行 Prisma 迁移
   └─ 生成 Prisma 客户端

4. 管理员创建
   ├─ 创建 ADMIN 角色
   ├─ 创建管理员用户
   └─ 输出默认密码

5. 应用构建
   ├─ 设置环境变量
   ├─ 运行 Next.js 构建
   └─ 生成 standalone 输出

6. 文件复制
   ├─ 复制 static 目录
   ├─ 复制 public 目录
   └─ 复制数据库文件

7. 服务启动
   ├─ 启动 Node.js 服务
   └─ 输出访问地址
```

---

## 🔧 默认管理员账户

部署完成后，系统将显示默认管理员账户信息：

```
========================================
✅ 默认管理员账户创建成功！
========================================
用户名：admin
邮箱：admin@example.com
密码：Admin@123456
========================================
⚠️  请首次登录后立即修改密码！
========================================
```

### 修改密码

1. 使用默认账户登录
2. 进入「个人设置」
3. 选择「修改密码」
4. 输入新密码并保存

---

## 📝 日志管理

### 查看日志

```bash
# 查看最近 100 行日志
bash deploy.sh logs

# 实时查看日志
tail -f logs/*.log

# 查看 PM2 日志
pm2 logs blog-platform
```

### 日志文件位置

- **部署日志**: `logs/deploy-YYYYMMDD-HHMMSS.log`
- **PM2 错误日志**: `logs/pm2-error.log`
- **PM2 输出日志**: `logs/pm2-out.log`
- **应用日志**: `logs/app.log`

---

## 🚨 常见问题

### 1. 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# 停止占用端口的进程
lsof -ti:3000 | xargs kill -9

# 或修改端口
echo "PORT=3001" >> .env
```

### 2. 数据库连接失败

**错误**: `Cannot open database because the directory does not exist`

**解决**:
```bash
# 运行数据库初始化
bash deploy.sh init-db

# 或手动创建目录
mkdir -p packages/database/prisma
```

### 3. 依赖安装失败

**错误**: `pnpm install` 失败

**解决**:
```bash
# 清理缓存
pnpm clean

# 删除 node_modules
rm -rf node_modules

# 重新安装
pnpm install
```

### 4. 构建失败

**错误**: `Build failed`

**解决**:
```bash
# 清理构建缓存
bash deploy.sh clean

# 重新构建
bash deploy.sh build
```

### 5. PM2 未安装

**错误**: `pm2: command not found`

**解决**:
```bash
# 全局安装 PM2
npm install -g pm2

# 或使用 node 启动
node apps/web/.next/standalone/apps/web/server.js
```

---

## 🎯 最佳实践

### 生产环境部署

1. **修改默认密码**
   - 首次登录后立即修改管理员密码

2. **配置环境变量**
   - 编辑 `.env` 文件
   - 设置强随机 `JWT_SECRET`
   - 配置正确的 `NEXTAUTH_URL`

3. **使用 PM2 管理进程**
   ```bash
   # 安装 PM2
   npm install -g pm2
   
   # 启动服务
   pm2 start ecosystem.config.js
   
   # 设置开机自启
   pm2 startup
   pm2 save
   ```

4. **配置反向代理（可选）**
   - 使用 Nginx 或 Apache
   - 配置 SSL 证书
   - 启用 Gzip 压缩

5. **定期备份**
   - 备份数据库文件
   - 备份上传的文件
   - 备份环境变量

### 性能优化

- 启用 Redis 缓存
- 使用 CDN 加速静态资源
- 启用 Gzip/Brotli 压缩
- 配置浏览器缓存
- 优化图片加载

---

## 📞 技术支持

如遇到问题，请检查：

1. 系统日志
2. PM2 日志
3. 数据库连接状态
4. 端口占用情况

---

## 📄 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ 自动化部署脚本
- ✅ 交互式菜单
- ✅ 数据库初始化
- ✅ 日志管理

---

**祝部署顺利！** 🎉
