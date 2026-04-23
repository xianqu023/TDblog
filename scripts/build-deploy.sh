#!/bin/bash

# =============================================================================
# 构建生产环境部署包脚本
# =============================================================================

set -e  # 遇到错误立即退出

echo "🚀 开始构建生产环境部署包..."

# 项目根目录
PROJECT_ROOT="/Volumes/文档/blog"
BUILD_DIR="$PROJECT_ROOT/build"
DEPLOY_DIR="$BUILD_DIR/deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_PACKAGE="$BUILD_DIR/blog-platform-$TIMESTAMP.tar.gz"

# 清理旧的构建目录
echo "🧹 清理旧的构建目录..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$DEPLOY_DIR"

# 1. 清理缓存
echo "📦 清理缓存..."
cd "$PROJECT_ROOT"
bash scripts/clean.sh

# 2. 安装生产依赖
echo "📦 安装生产依赖..."
cd "$PROJECT_ROOT"
pnpm install --prod=false

# 3. 生成 Prisma Client
echo "🗄️  生成 Prisma Client..."
cd "$PROJECT_ROOT/packages/database"
pnpm exec prisma generate

# 4. 构建 Next.js 应用
echo "🔨 构建 Next.js 应用..."
cd "$PROJECT_ROOT/apps/web"
pnpm run build -- --skip-prerender

# 5. 复制生产环境必需的文件
echo "📋 复制生产环境文件..."

# 创建部署目录结构
mkdir -p "$DEPLOY_DIR/apps/web"
mkdir -p "$DEPLOY_DIR/packages/database/prisma"
mkdir -p "$DEPLOY_DIR/scripts"
mkdir -p "$DEPLOY_DIR/uploads"

# 复制 Next.js 应用
cp -r "$PROJECT_ROOT/apps/web/.next" "$DEPLOY_DIR/apps/web/"
cp -r "$PROJECT_ROOT/apps/web/public" "$DEPLOY_DIR/apps/web/"
cp "$PROJECT_ROOT/apps/web/package.json" "$DEPLOY_DIR/apps/web/"
cp "$PROJECT_ROOT/apps/web/next.config.ts" "$DEPLOY_DIR/apps/web/"

# 复制数据库包
cp "$PROJECT_ROOT/packages/database/package.json" "$DEPLOY_DIR/packages/database/"
cp "$PROJECT_ROOT/packages/database/prisma/schema.prisma" "$DEPLOY_DIR/packages/database/prisma/"

# 复制根目录文件
cp "$PROJECT_ROOT/package.json" "$DEPLOY_DIR/"
cp "$PROJECT_ROOT/pnpm-lock.yaml" "$DEPLOY_DIR/"
cp "$PROJECT_ROOT/pnpm-workspace.yaml" "$DEPLOY_DIR/"
cp "$PROJECT_ROOT/turbo.json" "$DEPLOY_DIR/"

# 复制脚本
cp "$PROJECT_ROOT/scripts/clean.sh" "$DEPLOY_DIR/scripts/"

# 复制环境配置示例
cp "$PROJECT_ROOT/.env.example" "$DEPLOY_DIR/.env.example"
cp "$PROJECT_ROOT/.env.production" "$DEPLOY_DIR/.env.production"

# 6. 创建生产环境配置文件
echo "⚙️  创建生产环境配置..."

cat > "$DEPLOY_DIR/.env" << 'EOF'
# =============================================================================
# 生产环境配置
# =============================================================================

# 数据库配置（使用相对路径）
DATABASE_URL="file:./packages/database/prisma/blog.db"

# NextAuth 配置（必须修改为随机字符串）
NEXTAUTH_SECRET="CHANGE_ME_TO_RANDOM_STRING"
NEXTAUTH_URL="https://your-domain.com"

# 网站配置
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="My Blog"

# 文件存储配置
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_URL=/uploads
STORAGE_LOCAL_SERVE_STATIC=true

# 上传配置
UPLOAD_MAX_FILE_SIZE=104857600
UPLOAD_ORGANIZE_BY_DATE=true
UPLOAD_UNIQUE_FILENAME=true

# AI 配置（可选）
# OPENAI_API_KEY=""
# OPENAI_BASE_URL=""
# AI_MODEL="gpt-3.5-turbo"
EOF

# 7. 创建启动脚本
echo "🚀 创建启动脚本..."

cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash

# =============================================================================
# 生产环境启动脚本
# =============================================================================

echo "🚀 启动 Blog Platform..."

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请复制 .env.example 为 .env 并配置必要的环境变量"
    exit 1
fi

# 生成 Prisma Client
echo "🗄️  生成 Prisma Client..."
cd packages/database
pnpm exec prisma generate
cd ../..

# 数据库迁移
echo "📊 执行数据库迁移..."
cd packages/database
pnpm exec prisma migrate deploy
cd ../..

# 启动应用
echo "✅ 启动 Next.js 服务器..."
cd apps/web
pnpm start
EOF

chmod +x "$DEPLOY_DIR/start.sh"

# 8. 创建部署说明文档
echo "📖 创建部署说明..."

cat > "$DEPLOY_DIR/DEPLOY.md" << 'EOF'
# Blog Platform 部署指南

## 系统要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- SQLite 或 PostgreSQL

## 部署步骤

### 1. 解压部署包

```bash
tar -xzf blog-platform-*.tar.gz
cd blog-platform-*
```

### 2. 安装依赖

```bash
pnpm install --prod
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

**必须修改的配置：**
- `NEXTAUTH_SECRET`: 生成随机字符串 `openssl rand -base64 32`
- `NEXTAUTH_URL`: 你的网站域名
- `NEXT_PUBLIC_SITE_URL`: 你的网站域名

### 4. 初始化数据库

```bash
cd packages/database
pnpm exec prisma migrate deploy
pnpm exec prisma generate
cd ../..
```

### 5. 启动应用

```bash
# 使用启动脚本
bash start.sh

# 或直接启动
cd apps/web
pnpm start
```

### 6. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

## 目录结构

```
deploy/
├── apps/
│   └── web/              # Next.js 应用
│       ├── .next/        # 构建产物
│       ├── public/       # 静态资源
│       └── package.json
├── packages/
│   └── database/         # 数据库包
│       └── prisma/
│           └── schema.prisma
├── uploads/              # 上传文件目录
├── .env                  # 环境变量
├── start.sh              # 启动脚本
└── DEPLOY.md             # 部署说明
```

## 常见问题

### 1. 数据库连接失败

确保 `DATABASE_URL` 配置正确：
- SQLite: `file:./packages/database/prisma/blog.db`
- PostgreSQL: `postgresql://user:password@host:5432/dbname`

### 2. 端口被占用

修改 `apps/web/package.json` 中的启动命令：
```json
"start": "next start -p 3001"
```

### 3. 文件上传失败

确保 `uploads` 目录有写入权限：
```bash
chmod -R 755 uploads
```

## 性能优化

### 1. 启用 gzip 压缩

在 Nginx 配置中启用 gzip：
```nginx
gzip on;
gzip_types text/plain application/json text/css application/javascript;
```

### 2. 配置 CDN

将静态资源托管到 CDN，修改 `.env` 中的 CDN 配置。

### 3. 数据库优化

- 使用 PostgreSQL 替代 SQLite（生产环境推荐）
- 配置数据库连接池
- 定期备份数据库

## 安全建议

1. 使用 HTTPS
2. 定期更新依赖
3. 配置防火墙
4. 定期备份数据
5. 监控应用日志
EOF

# 9. 创建 PM2 配置文件
echo "📝 创建 PM2 配置..."

cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'blog-platform',
    cwd: './apps/web',
    script: 'pnpm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
  }],
};
EOF

# 10. 创建 .dockerignore（如果使用 Docker）
echo "🐳 创建 .dockerignore..."

cat > "$DEPLOY_DIR/.dockerignore" << 'EOF'
node_modules
.next
.git
.gitignore
*.md
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
coverage
.vscode
.idea
*.swp
*.swo
.DS_Store
uploads
logs
EOF

# 11. 压缩部署包
echo "📦 压缩部署包..."

cd "$BUILD_DIR"
tar -czf "$DEPLOY_PACKAGE" -C "$BUILD_DIR" deploy/

# 12. 显示构建结果
echo ""
echo "========================================="
echo "✅ 构建完成！"
echo "========================================="
echo ""
echo "📦 部署包位置: $DEPLOY_PACKAGE"
echo "📁 部署目录: $DEPLOY_DIR"
echo ""
echo "📊 部署包大小: $(du -sh "$DEPLOY_PACKAGE" | cut -f1)"
echo "📁 部署目录大小: $(du -sh "$DEPLOY_DIR" | cut -f1)"
echo ""
echo "🚀 部署命令:"
echo "  scp $DEPLOY_PACKAGE user@server:/path/to/deploy/"
echo "  ssh user@server"
echo "  cd /path/to/deploy/"
echo "  tar -xzf $(basename "$DEPLOY_PACKAGE")"
echo "  cd deploy"
echo "  pnpm install --prod"
echo "  bash start.sh"
echo ""
