#!/bin/bash

# Blog Platform - 监控和自动重启脚本
# 可以配合 cron 使用，每分钟检查一次

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/..

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

LOG_FILE="logs/monitor.log"
HEALTH_URL="http://localhost:3000/api/health"

# 创建日志目录
mkdir -p logs

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查服务是否运行
check_service() {
    # 检查端口
    if lsof -i :3000 > /dev/null 2>&1; then
        return 0
    fi
    return 1
}

# 检查健康状态
check_health() {
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 5 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        return 0
    fi
    return 1
}

# 重启服务
restart_service() {
    log "${RED}服务异常，正在重启...${NC}"
    
    # 停止旧进程
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next start" 2>/dev/null || true
    
    sleep 2
    
    # 重启服务
    cd apps/web
    nohup pnpm next dev -p 3000 > ../../logs/web/restart.log 2>&1 &
    cd ..
    
    log "${GREEN}服务已重启${NC}"
}

# 主逻辑
log "开始健康检查..."

if check_service; then
    if check_health; then
        log "${GREEN}✓ 服务运行正常${NC}"
    else
        log "${YELLOW}⚠ 服务运行但健康检查失败${NC}"
        # 可以选择是否重启
        # restart_service
    fi
else
    log "${RED}✗ 服务未运行${NC}"
    restart_service
fi

# 检查磁盘空间
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log "${RED}⚠ 磁盘空间不足: ${DISK_USAGE}%${NC}"
fi

# 检查内存使用
MEMORY_USAGE=$(ps aux | grep -E "next|node" | grep -v grep | awk '{sum+=$6} END {printf "%.0f", sum/1024}')
if [ "$MEMORY_USAGE" -gt 1000 ]; then
    log "${YELLOW}⚠ 内存使用过高: ${MEMORY_USAGE}MB${NC}"
fi
