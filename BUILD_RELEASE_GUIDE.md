# 服务版本发布包构建指南

## 📦 概述

本项目提供完整的服务版本发布包构建系统，支持多种构建模式，满足不同部署场景需求。

## 🚀 快速开始

### 方式一：使用 npm 命令（推荐）

```bash
# 标准构建（推荐）
pnpm build:release

# 完整构建（包含 node_modules，适合离线部署）
pnpm build:release:full

# 精简构建（仅构建文件，需要服务器有依赖）
pnpm build:release:lite

# 快速打包部署包
pnpm package:deploy

# 快速打包源码包
pnpm package:source

# 一次性构建所有包
pnpm package:all
```

### 方式二：使用脚本

```bash
# 标准构建
./build-release.sh

# 完整构建
./build-release.sh --full

# 精简构建
./build-release.sh --lite

# 快速打包
./scripts/quick-package.sh --deploy
```

## 📋 构建类型说明

### 1. 标准构建（Standard）

**适用场景**：常规服务器部署，服务器可访问 npm 仓库

**包含内容**：
- ✅ 构建好的 `.next` 目录
- ✅ 所有源代码和配置文件
- ✅ 部署脚本（deploy.sh, start.sh, install.sh）
- ✅ 配置示例和文档
- ❌ 不包含 `node_modules`

**构建命令**：
```bash
pnpm build:release
# 或
./build-release.sh
```

**输出文件**：
```
build/blog-platform-1.0.0-20260423_180000.tar.gz
build/blog-platform-1.0.0-20260423_180000.sha256
build/blog-platform-1.0.0-20260423_180000.md5
```

### 2. 完整构建（Full）

**适用场景**：离线环境部署，服务器无法访问外网

**包含内容**：
- ✅ 标准构建的所有内容
- ✅ `node_modules` 目录（包含所有依赖）

**构建命令**：
```bash
pnpm build:release:full
# 或
./build-release.sh --full
```

**特点**：
- 文件较大（约 500MB+）
- 部署速度快（无需安装依赖）
- 适合内网环境

### 3. 精简构建（Lite）

**适用场景**：开发环境或已有依赖的服务器

**包含内容**：
- ✅ 仅包含 `.next` 构建文件
- ✅ 必要的配置文件

**构建命令**：
```bash
pnpm build:release:lite
# 或
./build-release.sh --lite
```

**特点**：
- 文件最小（约 50MB+）
- 需要服务器预先安装依赖

### 4. 部署包（Deploy Package）

**适用场景**：快速部署，包含完整部署系统

**包含内容**：
- ✅ 构建好的应用
- ✅ 一键部署脚本
- ✅ 配置文件模板
- ✅ 完整文档

**构建命令**：
```bash
pnpm package:deploy
# 或
./scripts/quick-package.sh --deploy
```

### 5. 源码包（Source Package）

**适用场景**：源码分发，二次开发

**包含内容**：
- ✅ 完整源代码
- ✅ 构建脚本
- ✅ 开发文档
- ❌ 不包含构建文件

**构建命令**：
```bash
pnpm package:source
# 或
./scripts/quick-package.sh --source
```

## 🔧 构建流程

### 标准构建流程

```bash
# 1. 清理缓存
pnpm clean  # 或手动清理

# 2. 安装依赖
pnpm install

# 3. 生成 Prisma Client
cd packages/database
pnpm exec prisma generate

# 4. 构建 Next.js
cd apps/web
pnpm run build

# 5. 打包发布包
cd ../..
pnpm build:release
```

### 一键构建所有包

```bash
pnpm package:all
```

这会依次执行：
1. 标准构建
2. 部署包打包
3. 源码包打包

## 📦 输出文件

构建完成后，`build/` 目录会包含以下文件：

```
build/
├── blog-platform-1.0.0-20260423_180000.tar.gz    # 发布包
├── blog-platform-1.0.0-20260423_180000.sha256    # SHA256 校验
├── blog-platform-1.0.0-20260423_180000.md5       # MD5 校验
├── blog-platform-deploy-1.0.0-20260423_180000.tar.gz    # 部署包
├── blog-platform-deploy-1.0.0-20260423_180000.sha256
├── blog-platform-deploy-1.0.0-20260423_180000.md5
├── blog-platform-source-1.0.0-20260423_180000.tar.gz    # 源码包
├── blog-platform-source-1.0.0-20260423_180000.sha256
└── blog-platform-source-1.0.0-20260423_180000.md5
```

## ✅ 校验发布包

### 验证 SHA256

```bash
cd build
sha256sum -c blog-platform-1.0.0-20260423_180000.sha256
```

### 验证 MD5

```bash
cd build
md5sum -c blog-platform-1.0.0-20260423_180000.md5
```

## 📥 部署发布包

### 方式一：使用部署脚本

```bash
# 1. 解压
tar -xzf blog-platform-1.0.0-20260423_180000.tar.gz
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
# 1. 解压
tar -xzf blog-platform-1.0.0-20260423_180000.tar.gz
cd blog-platform

# 2. 安装依赖（如果是标准构建）
pnpm install

# 3. 初始化数据库
cd packages/database
pnpm exec prisma migrate deploy

# 4. 启动服务
cd ../..
pnpm start:prod
# 或使用 PM2
pm2 start ecosystem.config.js
```

## 🎯 构建场景对比

| 场景 | 推荐构建类型 | 文件大小 | 部署速度 | 离线支持 |
|------|-------------|----------|----------|----------|
| 常规服务器 | Standard | 中等 | 快 | ❌ |
| 内网/离线环境 | Full | 大 | 最快 | ✅ |
| 开发环境 | Lite | 小 | 中等 | ❌ |
| 快速部署 | Deploy | 中等 | 快 | ❌ |
| 源码分发 | Source | 小 | - | ✅ |

## 📊 构建统计

构建完成后会显示：

```
=========================================
  构建完成！
=========================================

✓ 版本：1.0.0
✓ 构建类型：standard
✓ 发布时间：20260423_180000

[INFO] 发布包：/Volumes/文档/blog/build/blog-platform-1.0.0-20260423_180000.tar.gz
[INFO] 大小：125MB
[INFO] SHA256: abc123...
[INFO] MD5: def456...

校验文件:
  - blog-platform-1.0.0-20260423_180000.sha256
  - blog-platform-1.0.0-20260423_180000.md5

部署说明:
  1. 解压：tar -xzf blog-platform-1.0.0-20260423_180000.tar.gz
  2. 进入：cd blog-platform
  3. 配置：cp conf.ini.example conf.ini && vim conf.ini
  4. 部署：./deploy.sh
```

## 🔍 故障排查

### 构建失败

```bash
# 清理缓存
pnpm clean

# 清理 node_modules
rm -rf node_modules apps/web/node_modules packages/database/node_modules

# 重新安装
pnpm install

# 重新构建
pnpm build:release
```

### 校验失败

```bash
# 重新下载或重新构建
# 确保使用相同的构建参数
```

### 部署失败

```bash
# 查看详细日志
./deploy.sh --verbose 2>&1 | tee deploy.log

# 检查依赖
pnpm install --verbose

# 检查数据库
cd packages/database
pnpm exec prisma generate
```

## 📝 最佳实践

### 1. 版本管理

```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. 定期构建

```bash
# 每周构建一次
0 2 * * 0 cd /path/to/blog && pnpm package:all
```

### 3. 多环境构建

```bash
# 开发环境
./build-release.sh --lite

# 测试环境
./build-release.sh

# 生产环境
./build-release.sh --full
```

### 4. 自动化部署

```bash
# CI/CD 流程
pnpm test
pnpm build:release
pnpm package:deploy
# 上传到服务器
scp build/*.tar.gz user@server:/path/to/deploy/
```

## 📄 相关文档

- 部署指南：`DEPLOY_GUIDE.md`
- 服务器使用说明：`SERVER_README.md`
- 快速开始：`README.md`

## 🆘 技术支持

GitHub Issues: https://github.com/xianqu023/TDblog/issues
