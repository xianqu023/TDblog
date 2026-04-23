# 🚀 快速部署指南

## 3 步完成部署

### 第 1 步：配置环境

```bash
# 编辑配置文件（只需修改这一处）
vim conf.ini
```

**最少需要修改的配置：**
```ini
[database]
url = file:./packages/database/prisma/blog.db  # 或使用 MySQL/PostgreSQL

[auth]
secret = 运行 openssl rand -base64 32 生成  # 生产环境必须修改！

[site]
url = https://yourdomain.com  # 你的域名
```

### 第 2 步：初始化

```bash
# 一键完成：配置加载 + 数据库初始化
pnpm init
```

输出示例：
```
┌─────────────────────────────────────────────────────────┐
       🔧 配置加载器 - 自动识别和初始化环境配置
└─────────────────────────────────────────────────────────┘

✓ 读取配置文件：conf.ini
✓ 数据库类型：sqlite
✓ 已加载配置项：
  数据库：sqlite
  服务器端口：3000
  网站名称：My Blog
  存储驱动：local

📊 初始化数据库...
  ✓ 生成 Prisma Client...
  ✓ 执行数据库迁移...
  ✓ 数据库初始化完成
✓ 已生成 .env 文件

✅ 配置加载和初始化完成！
```

### 第 3 步：启动

**方式 A：直接启动**
```bash
pnpm start:prod
```

**方式 B：使用 PM2（推荐生产环境）**
```bash
# 安装 PM2（如果未安装）
npm install -g pm2

# 启动应用
pnpm start:pm2

# 或
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

## 🎉 完成！

访问：http://localhost:3000

---

## 常用命令

```bash
# 开发环境
pnpm dev

# 生产环境
pnpm start:prod

# 使用 PM2
pnpm start:pm2

# 初始化配置
pnpm init

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart all

# 停止
pm2 stop all
```

---

## 配置检查清单

- [ ] 修改了 `conf.ini` 中的数据库配置
- [ ] 修改了 `conf.ini` 中的 `auth.secret`（生产环境）
- [ ] 修改了 `conf.ini` 中的网站 URL
- [ ] 运行了 `pnpm init`
- [ ] 检查了生成的 `.env` 文件
- [ ] 数据库初始化成功
- [ ] 应用启动成功

---

## 需要帮助？

- 📖 完整配置示例：`conf.ini.full-example`
- 📚 详细部署文档：`DEPLOY.md`
- 💡 配置说明：`SIMPLIFIED_CONFIG.md`
