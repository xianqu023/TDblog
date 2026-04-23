#!/bin/bash

# =============================================================================
# 博客平台 - 快速启动脚本
# =============================================================================
# 使用方法:
#   ./start.sh              # 启动服务
#   ./start.sh --restart    # 重启服务
#   ./start.sh --stop       # 停止服务
#   ./start.sh --status     # 查看状态
#   ./start.sh --logs       # 查看日志
#   ./start.sh --help       # 显示帮助
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助
show_help() {
    echo "博客平台快速启动脚本"
    echo ""
    echo "用法：$0 [选项]"
    echo ""
    echo "选项:"
    echo "  --restart    重启服务"
    echo "  --stop       停止服务"
    echo "  --status     查看服务状态"
    echo "  --logs       查看服务日志"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 启动服务"
    echo "  $0 --restart    # 重启服务"
    echo "  $0 --stop       # 停止服务"
    echo "  $0 --status     # 查看状态"
}

# 检查 PM2
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 未安装，请先运行：npm install -g pm2"
        exit 1
    fi
}

# 启动服务
start_service() {
    log_info "启动博客平台..."
    
    # 加载环境变量
    if [ -f ".env" ]; then
        log_info "加载环境变量..."
        export $(cat .env | grep -v "^#" | xargs)
    fi
    
    # 检查是否已经运行
    if pm2 status blog-platform | grep -q "online"; then
        log_info "服务已经在运行"
        pm2 status blog-platform
        return
    fi
    
    # 启动服务
    pm2 start ecosystem.config.js
    pm2 save
    
    log_success "服务已启动"
    show_status
}

# 重启服务
restart_service() {
    log_info "重启博客平台..."
    
    # 加载环境变量
    if [ -f ".env" ]; then
        log_info "加载环境变量..."
        export $(cat .env | grep -v "^#" | xargs)
    fi
    
    pm2 restart blog-platform
    log_success "服务已重启"
    show_status
}

# 停止服务
stop_service() {
    log_info "停止博客平台..."
    pm2 stop blog-platform
    log_success "服务已停止"
}

# 查看状态
show_status() {
    echo ""
    log_info "服务状态:"
    pm2 status blog-platform
    
    echo ""
    log_info "最近日志:"
    pm2 logs blog-platform --lines 10 --nostream
    
    echo ""
    log_info "访问地址："
    echo "  主页：http://localhost:3000"
    echo "  管理后台：http://localhost:3000/zh/admin/dashboard"
    echo "  主题设置：http://localhost:3000/zh/admin/theme-settings"
    echo ""
}

# 查看日志
show_logs() {
    log_info "查看日志（实时）..."
    pm2 logs blog-platform
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "  博客平台快速启动"
    echo "========================================="
    echo ""
    
    # 检查 PM2
    check_pm2
    
    # 解析参数
    case ${1:-} in
        --restart)
            restart_service
            ;;
        --stop)
            stop_service
            ;;
        --status)
            show_status
            ;;
        --logs)
            show_logs
            ;;
        --help)
            show_help
            exit 0
            ;;
        "")
            start_service
            ;;
        *)
            log_error "未知选项：$1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
