#!/bin/bash

# =============================================================================
# 配置生成脚本 - 从 conf.ini 生成 .env 和 Prisma 配置
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONF_FILE="$PROJECT_ROOT/conf.ini"

echo "🔧 开始生成配置文件..."

# 检查 conf.ini 是否存在
if [ ! -f "$CONF_FILE" ]; then
    echo "❌ 错误: conf.ini 文件不存在"
    echo "请复制 conf.ini.example 为 conf.ini 并配置"
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
SERVER_HOST=$(read_ini_value "server" "host" "$CONF_FILE")
NODE_ENV=$(read_ini_value "server" "node_env" "$CONF_FILE")

# 读取认证配置
AUTH_SECRET=$(read_ini_value "auth" "secret" "$CONF_FILE")
AUTH_URL=$(read_ini_value "auth" "url" "$CONF_FILE")

# 读取网站配置
SITE_NAME=$(read_ini_value "site" "name" "$CONF_FILE")
SITE_URL=$(read_ini_value "site" "url" "$CONF_FILE")

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
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/uploads"

# 如果数据库是 SQLite，创建数据库目录
if [[ "$DB_PROVIDER" == "sqlite" ]]; then
    DB_DIR=$(dirname "${DB_URL#file:}")
    mkdir -p "$DB_DIR"
fi

# 生成 .env 文件
echo "📝 生成 .env 文件..."
cat > "$PROJECT_ROOT/.env" << EOF
# =============================================================================
# 自动生成的环境配置文件
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 请勿手动编辑此文件，使用 conf.ini 配置
# =============================================================================

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
HOST=$SERVER_HOST
NODE_ENV=$NODE_ENV
EOF

echo "✅ .env 文件已生成: $PROJECT_ROOT/.env"

# 生成 Prisma 配置文件
echo "📝 生成 Prisma 配置..."

# 根据数据库类型生成不同的配置
case "$DB_PROVIDER" in
    sqlite)
        cat > "$PROJECT_ROOT/packages/database/prisma.config.ts" << EOF
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: '$DB_URL',
  },
});
EOF
        # 更新 schema.prisma
        cat > "$PROJECT_ROOT/packages/database/prisma/schema.prisma.db" << 'EOF'
datasource db {
  provider = "sqlite"
}
EOF
        ;;
    postgresql|postgres)
        cat > "$PROJECT_ROOT/packages/database/prisma.config.ts" << EOF
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: '$DB_URL',
  },
});
EOF
        ;;
    mysql)
        cat > "$PROJECT_ROOT/packages/database/prisma.config.ts" << EOF
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: '$DB_URL',
  },
});
EOF
        ;;
    *)
        echo "❌ 错误: 不支持的数据库类型 '$DB_PROVIDER'"
        echo "支持的数据库类型: sqlite, postgresql, mysql"
        exit 1
        ;;
esac

echo "✅ Prisma 配置已生成: $PROJECT_ROOT/packages/database/prisma.config.ts"

# 显示配置摘要
echo ""
echo "========================================="
echo "✅ 配置生成完成！"
echo "========================================="
echo ""
echo "📊 配置摘要:"
echo "  数据库类型: $DB_PROVIDER"
echo "  数据库 URL: $DB_URL"
echo "  服务器端口: $SERVER_PORT"
echo "  网站 URL: $SITE_URL"
echo "  存储驱动: $STORAGE_DRIVER"
echo ""
