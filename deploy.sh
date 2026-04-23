#!/bin/bash

# =============================================================================
# 博客平台 - 服务器部署脚本
# =============================================================================
# 使用方法:
#   ./deploy.sh              # 标准部署
#   ./deploy.sh --rebuild    # 重新构建
#   ./deploy.sh --clean      # 清理后部署
#   ./deploy.sh --help       # 显示帮助
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助
show_help() {
    echo "博客平台部署脚本"
    echo ""
    echo "用法：$0 [选项]"
    echo ""
    echo "选项:"
    echo "  --rebuild    重新构建项目（清理 .next 和 node_modules）"
    echo "  --clean      完全清理后部署（包括删除 node_modules）"
    echo "  --skip-build 跳过构建，只安装依赖和启动服务"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 标准部署"
    echo "  $0 --rebuild          # 重新构建"
    echo "  $0 --clean            # 完全清理后部署"
    echo "  $0 --skip-build       # 只安装依赖和启动"
}

# 检查 Node.js 版本
check_node_version() {
    log_info "检查 Node.js 版本..."
    NODE_VERSION=$(node -v 2>&1 || echo "not installed")
    
    if [ "$NODE_VERSION" = "not installed" ]; then
        log_error "Node.js 未安装，请先安装 Node.js >= 18.0.0"
        exit 1
    fi
    
    log_success "Node.js 版本：$NODE_VERSION"
}

# 检查 pnpm
check_pnpm() {
    log_info "检查 pnpm..."
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm 未安装，正在安装..."
        npm install -g pnpm
    fi
    
    PNPM_VERSION=$(pnpm -v)
    log_success "pnpm 版本：$PNPM_VERSION"
}

# 检查 PM2
check_pm2() {
    log_info "检查 PM2..."
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2 未安装，正在安装..."
        npm install -g pm2
    fi
    
    PM2_VERSION=$(pm2 -v)
    log_success "PM2 版本：$PM2_VERSION"
}

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."
    pnpm install --production=false
    
    # 生成 Prisma 客户端
    log_info "生成 Prisma 客户端..."
    cd packages/database
    pnpm exec prisma generate
    cd ../..
    
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 设置环境变量
    export NODE_ENV=production
    
    # 执行构建
    pnpm build
    
    log_success "项目构建完成"
}

# 初始化数据库
init_database() {
    log_info "检查数据库..."
    
    if [ ! -f "packages/database/prisma/blog.db" ]; then
        log_warning "数据库不存在，正在创建..."
        cd packages/database
        pnpm exec prisma migrate dev --name init
        cd ../..
        log_success "数据库创建完成"
    else
        log_success "数据库已存在"
    fi
}

# 启动服务
start_service() {
    log_info "启动服务..."
    
    # 停止旧的进程
    pm2 stop blog-platform 2>/dev/null || true
    pm2 delete blog-platform 2>/dev/null || true
    
    # 启动新进程
    pm2 start ecosystem.config.js
    
    # 保存 PM2 进程列表
    pm2 save
    
    log_success "服务已启动"
    log_info "查看日志：pm2 logs blog-platform"
    log_info "查看状态：pm2 status"
    log_info "重启服务：pm2 restart blog-platform"
    log_info "停止服务：pm2 stop blog-platform"
}

# 显示服务状态
show_status() {
    echo ""
    log_info "服务状态:"
    pm2 status blog-platform
    
    echo ""
    log_info "最近日志:"
    pm2 logs blog-platform --lines 10 --nostream
    
    echo ""
    log_info "访问地址：http://localhost:3000"
    log_info "管理后台：http://localhost:3000/zh/admin/dashboard"
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "  博客平台部署脚本"
    echo "========================================="
    echo ""
    
    # 解析参数
    REBUILD=false
    CLEAN=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rebuild)
                REBUILD=true
                shift
                ;;
            --clean)
                CLEAN=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项：$1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 执行清理
    if [ "$CLEAN" = true ]; then
        log_warning "清理模式：删除 node_modules 和 .next..."
        rm -rf node_modules
        rm -rf .next
        rm -rf apps/web/node_modules
        rm -rf apps/web/.next
    elif [ "$REBUILD" = true ]; then
        log_warning "重建模式：删除 .next..."
        rm -rf .next
        rm -rf apps/web/.next
    fi
    
    # 检查环境
    check_node_version
    check_pnpm
    check_pm2
    
    # 安装依赖
    install_dependencies
    
    # 构建项目
    if [ "$SKIP_BUILD" = false ]; then
        build_project
    else
        log_warning "跳过构建"
    fi
    
    # 初始化数据库
    init_database
    
    # 启动服务
    start_service
    
    # 显示状态
    show_status
    
    echo ""
    log_success "部署完成！"
    echo ""
}

# 执行主函数
main "$@"
