#!/bin/bash

# =============================================================================
# 创建生产环境部署包（使用 conf.ini 配置）
# =============================================================================

set -e

PROJECT_ROOT="/Volumes/文档/blog"
BUILD_DIR="$PROJECT_ROOT/build"
DEPLOY_DIR="$BUILD_DIR/deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 开始创建部署包..."

# 清理旧的构建目录
rm -rf "$BUILD_DIR"
mkdir -p "$DEPLOY_DIR"

# 1. 复制 standalone 构建产物
echo "📦 复制构建产物..."
cd "$PROJECT_ROOT"

# 创建目录结构
mkdir -p "$DEPLOY_DIR/apps/web/.next"
mkdir -p "$DEPLOY_DIR/packages/database/prisma"
mkdir -p "$DEPLOY_DIR/uploads"
mkdir -p "$DEPLOY_DIR/logs"

# 复制 .next 构建产物
cp -r apps/web/.next/standalone "$DEPLOY_DIR/apps/web/.next/standalone" 2>/dev/null || true
cp -r apps/web/.next/static "$DEPLOY_DIR/apps/web/.next/static" 2>/dev/null || true
cp apps/web/.next/BUILD_ID "$DEPLOY_DIR/apps/web/.next/" 2>/dev/null || true
cp apps/web/.next/*.json "$DEPLOY_DIR/apps/web/.next/" 2>/dev/null || true

# 复制 public 目录
cp -r apps/web/public "$DEPLOY_DIR/apps/web/public"

# 复制数据库文件
cp packages/database/prisma/schema.prisma "$DEPLOY_DIR/packages/database/prisma/"
cp packages/database/prisma.config.ts "$DEPLOY_DIR/packages/database/"
cp packages/database/package.json "$DEPLOY_DIR/packages/database/"

# 2. 创建 conf.ini 配置文件
echo "📝 创建 conf.ini..."
cat > "$DEPLOY_DIR/conf.ini.example" << 'EOF'
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
EOF

# 3. 创建启动脚本
echo "🚀 创建启动脚本..."
cat > "$DEPLOY_DIR/start.sh" << 'STARTEOF'
#!/bin/bash

# =============================================================================
# 生产环境启动脚本（使用 conf.ini 配置）
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
CONF_FILE="$PROJECT_ROOT/conf.ini"

echo "🚀 启动 Blog Platform..."

# 检查 conf.ini 是否存在
if [ ! -f "$CONF_FILE" ]; then
    echo "❌ 错误: conf.ini 文件不存在"
    echo "请复制 conf.ini.example 为 conf.ini 并配置必要的环境变量"
    exit 1
fi

# 读取配置文件
read_ini_value() {
    local section=$1
    local key=$2
    local file=$3
    sed -n "/\[$section\]/,/\[/p" "$file" | grep "^$key" | head -1 | sed 's/^[^=]*=\s*//' | sed 's/\s*$//'
}

# 读取数据库配置
DB_PROVIDER=$(read_ini_value "database" "provider" "$CONF_FILE")
DB_URL=$(read_ini_value "database" "url" "$CONF_FILE")

# 读取服务器配置
SERVER_PORT=$(read_ini_value "server" "port" "$CONF_FILE")
NODE_ENV=$(read_ini_value "server" "node_env" "$CONF_FILE")

# 读取认证配置
AUTH_SECRET=$(read_ini_value "auth" "secret" "$CONF_FILE")
AUTH_URL=$(read_ini_value "auth" "url" "$CONF_FILE")

# 读取网站配置
SITE_URL=$(read_ini_value "site" "url" "$CONF_FILE")
SITE_NAME=$(read_ini_value "site" "name" "$CONF_FILE")

# 读取存储配置
STORAGE_DRIVER=$(read_ini_value "storage" "driver" "$CONF_FILE")
STORAGE_LOCAL_PATH=$(read_ini_value "storage" "local_path" "$CONF_FILE")
STORAGE_LOCAL_URL=$(read_ini_value "storage" "local_url" "$CONF_FILE")

# 自动识别路径（将相对路径转换为绝对路径）
resolve_path() {
    local path=$1
    if [[ "$path" == ./* || "$path" == ../* ]]; then
        # 相对路径，转换为绝对路径
        echo "$(cd "$PROJECT_ROOT" && eval echo "$path")"
    else
        echo "$path"
    fi
}

# 处理数据库 URL
if [[ "$DB_PROVIDER" == "sqlite" ]]; then
    # SQLite 使用相对路径，需要转换为绝对路径
    if [[ "$DB_URL" == file:* ]]; then
        DB_FILE_PATH="${DB_URL#file:}"
        if [[ "$DB_FILE_PATH" == ./* || "$DB_FILE_PATH" == ../* ]]; then
            ABSOLUTE_PATH=$(resolve_path "$DB_FILE_PATH")
            DB_URL="file:$ABSOLUTE_PATH"
        fi
    fi
fi

# 处理存储路径
STORAGE_LOCAL_PATH=$(resolve_path "$STORAGE_LOCAL_PATH")

# 创建必要目录
mkdir -p "$PROJECT_ROOT/uploads"
mkdir -p "$PROJECT_ROOT/logs"

# 如果数据库是 SQLite，创建数据库目录
if [[ "$DB_PROVIDER" == "sqlite" ]]; then
    DB_DIR=$(dirname "${DB_URL#file:}")
    mkdir -p "$DB_DIR"
fi

# 生成 .env 文件
echo "📝 生成环境配置..."
cat > "$PROJECT_ROOT/.env" << EOF
# 数据库配置
DATABASE_URL="$DB_URL"

# NextAuth 配置
NEXTAUTH_SECRET="$AUTH_SECRET"
NEXTAUTH_URL="$AUTH_URL"

# 网站配置
NEXT_PUBLIC_SITE_URL="$SITE_URL"
NEXT_PUBLIC_SITE_NAME="$SITE_NAME"

# 文件存储配置
STORAGE_DRIVER=$STORAGE_DRIVER
STORAGE_LOCAL_PATH=$STORAGE_LOCAL_PATH
STORAGE_LOCAL_URL=$STORAGE_LOCAL_URL
STORAGE_LOCAL_SERVE_STATIC=true

# 上传配置
UPLOAD_MAX_FILE_SIZE=104857600
UPLOAD_ORGANIZE_BY_DATE=true
UPLOAD_UNIQUE_FILENAME=true

# 服务器配置
PORT=$SERVER_PORT
NODE_ENV=$NODE_ENV
EOF

echo "✅ 环境配置已生成"

# 生成 Prisma 配置文件
echo "🗄️  生成 Prisma 配置..."
cat > "$PROJECT_ROOT/packages/database/prisma.config.ts" << EOF
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: '$DB_URL',
  },
});
EOF

# 初始化数据库
echo "🗄️  初始化数据库..."
cd "$PROJECT_ROOT/packages/database"
npx prisma generate
npx prisma migrate deploy
cd "$PROJECT_ROOT"

# 启动应用
echo "✅ 启动 Next.js 服务器..."
node apps/web/.next/standalone/apps/web/server.js
STARTEOF

chmod +x "$DEPLOY_DIR/start.sh"

# 4. 创建 PM2 配置文件
echo "📝 创建 PM2 配置..."
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'blog-platform',
    script: 'node',
    args: 'apps/web/.next/standalone/apps/web/server.js',
    cwd: './',
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

# 5. 创建部署说明
echo "📖 创建部署说明..."
cat > "$DEPLOY_DIR/DEPLOY.md" << 'EOF'
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
EOF

# 6. 创建 .gitignore
echo "📝 创建 .gitignore..."
cat > "$DEPLOY_DIR/.gitignore" << 'EOF'
node_modules
.env
.env.local
*.log
logs/*
uploads/*
data/
.DS_Store
EOF

# 7. 压缩部署包
echo "📦 压缩部署包..."
cd "$BUILD_DIR"
tar -czf "$BUILD_DIR/blog-platform-$TIMESTAMP.tar.gz" deploy/

# 显示结果
echo ""
echo "========================================="
echo "✅ 部署包创建完成！"
echo "========================================="
echo ""
echo "📦 部署包: $BUILD_DIR/blog-platform-$TIMESTAMP.tar.gz"
echo "📁 部署目录: $DEPLOY_DIR"
echo ""
echo "📊 大小: $(du -sh "$BUILD_DIR/blog-platform-$TIMESTAMP.tar.gz" | cut -f1)"
echo ""
echo "🚀 部署命令:"
echo "  scp $BUILD_DIR/blog-platform-$TIMESTAMP.tar.gz user@server:/path/to/deploy/"
echo "  ssh user@server"
echo "  cd /path/to/deploy/"
echo "  tar -xzf blog-platform-$TIMESTAMP.tar.gz"
echo "  cd deploy"
echo "  cp conf.ini.example conf.ini"
echo "  # 编辑 conf.ini 配置"
echo "  bash start.sh"
echo ""
