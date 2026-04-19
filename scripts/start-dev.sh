#!/bin/bash

# Blog Platform - 启动脚本
# 用于启动开发服务器并自动重启

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载 conf.ini 配置
if [ -f "conf.ini" ]; then
    source scripts/load-config.sh
else
    echo -e "${YELLOW}⚠️ 配置文件 conf.ini 不存在，使用默认配置${NC}"
fi

# 创建日志目录
mkdir -p logs
mkdir -p logs/web

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 开发服务器启动脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: pnpm 未安装${NC}"
    exit 1
fi

# 安装依赖
echo -e "${YELLOW}检查依赖...${NC}"
pnpm install --frozen-lockfile

# 生成 Prisma 客户端
echo -e "${YELLOW}生成 Prisma 客户端...${NC}"
cd packages/database
pnpm prisma generate
cd ../..

# 运行数据库迁移
echo -e "${YELLOW}运行数据库迁移...${NC}"
cd packages/database
pnpm prisma migrate deploy
cd ../..

# 启动服务器带自动重启
echo -e "${GREEN}启动开发服务器...${NC}"
echo -e "${YELLOW}日志将保存到 logs/ 目录${NC}"

# 使用 while 循环实现自动重启
while true; do
    cd apps/web
    
    # 启动 Next.js 开发服务器
    NODE_ENV=development \
    pnpm next dev -p 3000 2>&1 | tee -a ../../logs/web/$(date +%Y-%m-%d).log
    
    EXIT_CODE=$?
    
    cd ../..
    
    echo -e "${RED}服务器退出 (退出码: $EXIT_CODE)${NC}"
    echo -e "${YELLOW}5秒后自动重启...${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止${NC}"
    
    sleep 5
done
