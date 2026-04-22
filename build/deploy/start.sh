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
