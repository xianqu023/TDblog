#!/bin/bash

# Blog Platform - 快速测试脚本
# 测试守护进程、日志和健康检查

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/..

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 系统测试${NC}"
echo -e "${GREEN}========================================${NC}"

# 测试 1: 检查脚本权限
echo -e "\n${YELLOW}1. 检查脚本权限...${NC}"
for script in scripts/*.sh; do
    if [ -x "$script" ]; then
        echo -e "  ${GREEN}✓ $script${NC}"
    else
        echo -e "  ${RED}✗ $script (缺少执行权限)${NC}"
        chmod +x "$script"
        echo -e "  ${GREEN}  已添加执行权限${NC}"
    fi
done

# 测试 2: 检查目录结构
echo -e "\n${YELLOW}2. 检查目录结构...${NC}"
for dir in logs logs/web logs/pm2; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓ $dir${NC}"
    else
        echo -e "  ${YELLOW}! 创建 $dir${NC}"
        mkdir -p "$dir"
    fi
done

# 测试 3: 检查 Node.js 和 pnpm
echo -e "\n${YELLOW}3. 检查运行环境...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓ Node.js: $NODE_VERSION${NC}"
else
    echo -e "  ${RED}✗ Node.js 未安装${NC}"
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "  ${GREEN}✓ pnpm: $PNPM_VERSION${NC}"
else
    echo -e "  ${RED}✗ pnpm 未安装${NC}"
fi

# 测试 4: 检查依赖
echo -e "\n${YELLOW}4. 检查依赖...${NC}"
if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓ node_modules 存在${NC}"
else
    echo -e "  ${YELLOW}! 需要运行 pnpm install${NC}"
fi

# 测试 5: 服务状态
echo -e "\n${YELLOW}5. 检查服务状态...${NC}"
PID_FILE="logs/web/server.pid"
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ 服务运行中 (PID: $PID)${NC}"
        
        # 测试健康检查
        echo -e "\n${YELLOW}6. 健康检查...${NC}"
        HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "")
        if [ -n "$HEALTH" ]; then
            STATUS=$(echo "$HEALTH" | grep -o '"status":"[^"]*"' | head -1)
            echo -e "  ${GREEN}✓ $STATUS${NC}"
        else
            echo -e "  ${YELLOW}! 健康检查无响应 (服务可能刚启动)${NC}"
        fi
    else
        echo -e "  ${RED}✗ 服务未运行 (PID 文件存在但进程不存在)${NC}"
        rm -f "$PID_FILE"
    fi
else
    echo -e "  ${YELLOW}! 服务未运行${NC}"
fi

# 总结
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   测试完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}快速启动命令:${NC}"
echo -e "  启动服务: ${GREEN}pnpm start${NC}"
echo -e "  查看状态: ${GREEN}pnpm status${NC}"
echo -e "  查看日志: ${GREEN}pnpm logs${NC}"
echo -e "  重启服务: ${GREEN}pnpm restart${NC}"
echo -e "  停止服务: ${GREEN}pnpm stop${NC}"
