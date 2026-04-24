#!/bin/bash

# 一键部署脚本
# 用法：./deploy.sh [项目路径]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 获取项目根目录
PROJECT_ROOT=${1:-$(pwd)}

print_info "开始部署博客系统..."
print_info "项目根目录：$PROJECT_ROOT"

# 检查是否在正确的目录
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    print_error "错误：当前目录不是项目根目录"
    exit 1
fi

# 步骤 1: 创建数据库目录
print_info "步骤 1/6: 创建数据库目录..."
mkdir -p "$PROJECT_ROOT/packages/database/prisma"
chmod 755 "$PROJECT_ROOT/packages/database/prisma"
print_info "数据库目录已创建：$PROJECT_ROOT/packages/database/prisma"

# 步骤 2: 设置环境变量
print_info "步骤 2/6: 设置环境变量..."
export PROJECT_ROOT="$PROJECT_ROOT"
export DATABASE_URL="file:$PROJECT_ROOT/packages/database/prisma/blog.db"
export NODE_ENV=production
print_info "环境变量已设置:"
print_info "  PROJECT_ROOT=$PROJECT_ROOT"
print_info "  DATABASE_URL=$DATABASE_URL"
print_info "  NODE_ENV=production"

# 步骤 3: 安装依赖
print_info "步骤 3/6: 安装依赖..."
if command -v pnpm &> /dev/null; then
    cd "$PROJECT_ROOT" && pnpm install --frozen-lockfile
    print_info "依赖安装完成"
else
    print_warning "pnpm 未安装，尝试安装..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    source ~/.bashrc
    cd "$PROJECT_ROOT" && pnpm install --frozen-lockfile
    print_info "依赖安装完成"
fi

# 步骤 4: 构建项目
print_info "步骤 4/6: 构建项目..."
cd "$PROJECT_ROOT/apps/web"
pnpm run build
print_info "项目构建完成"

# 步骤 5: 检查 PM2
print_info "步骤 5/6: 检查 PM2..."
if command -v pm2 &> /dev/null; then
    print_info "PM2 已安装"
else
    print_warning "PM2 未安装，正在安装..."
    pnpm install -g pm2
fi

# 步骤 6: 配置 PM2
print_info "步骤 6/6: 配置 PM2..."
PM2_CONFIG="$PROJECT_ROOT/ecosystem.config.js"

if [ -f "$PM2_CONFIG" ]; then
    print_info "检测到 PM2 配置文件"
    print_warning "是否重启现有应用？(y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        pm2 restart blog
        print_info "应用已重启"
    else
        print_info "跳过重启，您可以手动执行：pm2 restart blog"
    fi
else
    print_warning "未检测到 PM2 配置文件，正在创建..."
    cat > "$PM2_CONFIG" << 'EOF'
module.exports = {
  apps: [{
    name: 'blog',
    script: 'node',
    args: 'apps/web/.next/standalone/server.js',
    cwd: process.env.PROJECT_ROOT || process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PROJECT_ROOT: process.env.PROJECT_ROOT,
      DATABASE_URL: process.env.DATABASE_URL,
      PORT: 3000
    },
    error_file: '/var/log/blog/error.log',
    out_file: '/var/log/blog/out.log',
    log_file: '/var/log/blog/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF
    print_info "PM2 配置文件已创建：$PM2_CONFIG"
    print_warning "是否立即启动应用？(y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        pm2 start ecosystem.config.js
        pm2 save
        print_info "应用已启动"
    else
        print_info "您可以手动执行：pm2 start ecosystem.config.js"
    fi
fi

# 验证部署
print_info ""
print_info "======================================"
print_info "部署完成！"
print_info "======================================"
print_info ""
print_info "项目路径：$PROJECT_ROOT"
print_info "数据库路径：$DATABASE_URL"
print_info ""
print_info "常用命令："
print_info "  启动应用：pm2 start blog"
print_info "  停止应用：pm2 stop blog"
print_info "  重启应用：pm2 restart blog"
print_info "  查看日志：pm2 logs blog"
print_info "  查看状态：pm2 status"
print_info ""
print_info "测试访问："
print_info "  http://localhost:3000"
print_info ""
print_info "重要提示："
print_info "  1. 确保防火墙已开放 3000 端口"
print_info "  2. 建议配置 Nginx 反向代理"
print_info "  3. 建议配置 HTTPS 证书"
print_info ""

# 保存环境变量到 .bashrc（可选）
print_warning "是否将环境变量添加到 ~/.bashrc？(y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    cat >> ~/.bashrc << EOF

# Blog 应用环境变量（$(date +%Y-%m-%d)）
export PROJECT_ROOT="$PROJECT_ROOT"
export DATABASE_URL="file:$PROJECT_ROOT/packages/database/prisma/blog.db"
export NODE_ENV=production
EOF
    print_info "环境变量已添加到 ~/.bashrc"
    print_info "请执行 'source ~/.bashrc' 使其生效"
fi

print_info ""
print_info "祝您使用愉快！🎉"
