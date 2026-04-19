#!/bin/bash

# Blog Platform - 守护进程启动脚本
# 在后台运行服务并自动重启

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# 创建日志目录
mkdir -p logs/web
mkdir -p logs/pm2

PID_FILE="logs/web/server.pid"
LOG_FILE="logs/web/$(date +%Y-%m-%d).log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 守护进程启动${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}服务已在运行 (PID: $OLD_PID)${NC}"
        echo -e "${YELLOW}停止旧服务...${NC}"
        kill "$OLD_PID" 2>/dev/null || true
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

# 安装依赖
echo -e "${YELLOW}检查依赖...${NC}"
pnpm install --frozen-lockfile

# 生成 Prisma 客户端
echo -e "${YELLOW}生成 Prisma 客户端...${NC}"
cd packages/database
pnpm prisma generate
cd "$ROOT_DIR"

# 在后台启动服务
echo -e "${GREEN}启动服务...${NC}"

cd apps/web

nohup bash -c "
    while true; do
        echo '[$(date)] 启动 Next.js 开发服务器...' >> '$ROOT_DIR/$LOG_FILE'
        NODE_ENV=development pnpm next dev -p 3000 2>&1 | tee -a '$ROOT_DIR/$LOG_FILE'
        EXIT_CODE=\$?
        echo '[$(date)] 服务退出 (退出码: \$EXIT_CODE)' >> '$ROOT_DIR/$LOG_FILE'
        echo '[$(date)] 5秒后重启...' >> '$ROOT_DIR/$LOG_FILE'
        sleep 5
    done
" > /dev/null 2>&1 &

# 保存 PID
echo $! > "$ROOT_DIR/$PID_FILE"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   服务已启动!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "PID: ${GREEN}$(cat $ROOT_DIR/$PID_FILE)${NC}"
echo -e "日志: ${GREEN}$LOG_FILE${NC}"
echo -e ""
echo -e "${YELLOW}查看状态: pnpm status${NC}"
echo -e "${YELLOW}查看日志: pnpm logs${NC}"
echo -e "${YELLOW}停止服务: pnpm stop${NC}"
echo -e "${YELLOW}重启服务: pnpm restart${NC}"
