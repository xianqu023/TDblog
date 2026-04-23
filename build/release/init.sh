#!/bin/bash

# =============================================================================
# 博客平台 - 初始化脚本
# =============================================================================
# 自动配置环境变量和数据库连接
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 检查配置文件
if [ ! -f "conf.ini" ]; then
    log_info "创建配置文件..."
    cp conf.ini.example conf.ini
    log_success "配置文件已创建，请编辑 conf.ini 修改配置"
fi

# 读取配置文件中的数据库路径
if [ -f "conf.ini" ]; then
    DATABASE_URL=$(grep "^url" conf.ini | head -1 | cut -d'=' -f2- | tr -d ' ')
    if [ -n "$DATABASE_URL" ]; then
        export DATABASE_URL
        log_info "数据库 URL: $DATABASE_URL"
    fi
fi

# 检查数据库文件
if [ -f "packages/database/prisma/blog.db" ]; then
    log_success "数据库文件存在"
else
    log_error "数据库文件不存在！"
    exit 1
fi

# 生成 NextAuth Secret
if [ ! -f ".env" ]; then
    log_info "生成环境变量配置..."
    
    # 生成随机密钥
    if command -v openssl &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
    else
        NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    fi
    
    cat > .env << ENVEOF
# 数据库配置
DATABASE_URL="$DATABASE_URL"

# NextAuth 配置
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# 网站配置
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="My Blog"

# 存储配置
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_URL=/uploads
STORAGE_LOCAL_SERVE_STATIC=true
ENVEOF
    
    log_success "环境变量配置已生成 (.env)"
fi

log_success "初始化完成！"
echo ""
log_info "下一步："
echo "  1. 编辑 conf.ini 修改配置（可选）"
echo "  2. 运行 ./deploy.sh 部署服务"
echo "  3. 运行 ./start.sh 启动服务"
echo ""
