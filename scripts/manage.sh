#!/bin/bash

# Blog Platform - 服务管理脚本
# 用于查看状态、重启、停止服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/..

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   Blog Platform 服务管理脚本${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "用法: $0 {命令}"
    echo ""
    echo -e "${BLUE}可用命令:${NC}"
    echo -e "  ${GREEN}status${NC}      - 查看服务状态"
    echo -e "  ${GREEN}start${NC}       - 启动服务"
    echo -e "  ${GREEN}stop${NC}        - 停止服务"
    echo -e "  ${GREEN}restart${NC}     - 重启服务"
    echo -e "  ${GREEN}logs${NC}       - 查看日志 (最近 100 行)"
    echo -e "  ${GREEN}logs-full${NC}  - 查看完整日志"
    echo -e "  ${GREEN}logs-error${NC} - 查看错误日志"
    echo -e "  ${GREEN}monit${NC}      - 实时监控"
    echo -e "  ${GREEN}clear-logs${NC} - 清理 7 天前的日志"
    echo -e "  ${GREEN}help${NC}        - 显示帮助"
    echo ""
}

case "${1:-status}" in
    status)
        echo -e "${YELLOW}服务状态:${NC}"
        if command -v pm2 &> /dev/null; then
            pm2 status
        else
            # 检查进程
            if pgrep -f "next dev" > /dev/null; then
                echo -e "${GREEN}✓ 开发服务器运行中${NC}"
                pgrep -af "next dev"
            else
                echo -e "${RED}✗ 服务未运行${NC}"
            fi
        fi
        ;;
    start)
        echo -e "${YELLOW}启动服务...${NC}"
        bash scripts/daemon.sh
        ;;
    stop)
        echo -e "${YELLOW}停止服务...${NC}"
        PID_FILE="logs/web/server.pid"
        if [ -f "$PID_FILE" ]; then
            kill $(cat "$PID_FILE") 2>/dev/null || true
            rm -f "$PID_FILE"
            echo -e "${GREEN}服务已停止${NC}"
        else
            # 尝试查找并停止进程
            pkill -f "next dev" 2>/dev/null || true
            echo -e "${GREEN}服务已停止${NC}"
        fi
        ;;
    restart)
        echo -e "${YELLOW}重启服务...${NC}"
        $0 stop
        sleep 2
        $0 start
        ;;
    logs)
        echo -e "${YELLOW}最近日志 (100 行):${NC}"
        if command -v pm2 &> /dev/null; then
            pm2 logs blog-web --lines 100 --nostream
        else
            tail -n 100 logs/web/*.log 2>/dev/null || echo "无日志文件"
        fi
        ;;
    logs-full)
        echo -e "${YELLOW}完整日志:${NC}"
        if command -v pm2 &> /dev/null; then
            pm2 logs blog-web
        else
            tail -f logs/web/*.log 2>/dev/null || echo "无日志文件"
        fi
        ;;
    logs-error)
        echo -e "${RED}错误日志:${NC}"
        if command -v pm2 &> /dev/null; then
            pm2 logs blog-web --err --lines 100
        else
            find logs -name "*error*" -type f -exec tail -n 100 {} + 2>/dev/null || echo "无错误日志"
        fi
        ;;
    monit)
        if command -v pm2 &> /dev/null; then
            pm2 monit
        else
            echo -e "${RED}需要安装 PM2: npm install -g pm2${NC}"
        fi
        ;;
    clear-logs)
        echo -e "${YELLOW}清理 7 天前的日志...${NC}"
        find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
        echo -e "${GREEN}清理完成${NC}"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
