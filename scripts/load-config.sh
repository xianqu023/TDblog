#!/bin/bash

# =============================================================================
# 从 conf.ini 读取配置并导出为环境变量
# 用法: source scripts/load-config.sh
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../conf.ini"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    return 1 2>/dev/null || exit 1
fi

# 读取配置文件的函数
get_config() {
    local section="$1"
    local key="$2"
    local default="${3:-}"
    
    local value=$(awk -F'= ' -v section="$section" -v key="$key" '
        /^\[/ { current_section = $0; gsub(/[\[\]]/, "", current_section) }
        current_section == section && $1 == key { print $2; exit }
    ' "$CONFIG_FILE")
    
    echo "${value:-$default}"
}

# 导出数据库配置
export DB_PROVIDER=$(get_config "database" "provider" "postgresql")
export DATABASE_URL=$(get_config "database" "url")

# 导出服务器配置
export PORT=$(get_config "server" "port" "3000")
export HOST=$(get_config "server" "host" "0.0.0.0")
export NODE_ENV=$(get_config "server" "node_env" "production")

# 导出认证配置
export AUTH_SECRET=$(get_config "auth" "secret")
export NEXTAUTH_URL=$(get_config "auth" "url")

# 导出网站配置
export NEXT_PUBLIC_SITE_NAME=$(get_config "site" "name")
export NEXT_PUBLIC_SITE_URL=$(get_config "site" "url")

# 导出存储配置
export STORAGE_DRIVER=$(get_config "storage" "driver" "local")
export STORAGE_LOCAL_PATH=$(get_config "storage" "local_path" "./uploads")
export STORAGE_LOCAL_URL=$(get_config "storage" "local_url" "/uploads")

echo "✅ 配置加载完成"
echo "   数据库: $DB_PROVIDER"
echo "   存储驱动: $STORAGE_DRIVER"
echo "   网站: $NEXT_PUBLIC_SITE_NAME"
