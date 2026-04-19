#!/bin/bash

# Blog Platform - 生产环境启动脚本
# 使用 PM2 进程管理器

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/..

# 创建日志目录
mkdir -p logs/pm2
mkdir -p logs/web

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 生产环境启动脚本${NC}"
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

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 未安装，正在安装...${NC}"
    npm install -g pm2
fi

# 安装依赖
echo -e "${YELLOW}安装生产依赖...${NC}"
pnpm install --frozen-lockfile --prod

# 构建项目
echo -e "${YELLOW}构建项目...${NC}"
pnpm build

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

# 启动 PM2
echo -e "${GREEN}使用 PM2 启动服务...${NC}"
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 显示状态
pm2 status

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   服务已启动!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}查看日志: pm2 logs${NC}"
echo -e "${YELLOW}查看状态: pm2 status${NC}"
echo -e "${YELLOW}重启服务: pm2 restart blog-web${NC}"
echo -e "${YELLOW}停止服务: pm2 stop blog-web${NC}"
echo -e "${YELLOW}查看监控: pm2 monit${NC}"
