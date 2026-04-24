#!/bin/bash

# 生产环境构建脚本 - 快速参考
# 使用方法：bash scripts/quick-build.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   生产环境构建 - 快速脚本         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# 1. 清理
echo -e "${YELLOW}[1/4] 清理旧构建产物...${NC}"
rm -rf .next apps/web/.next packages/database/.next
rm -rf node_modules/.cache .turbo apps/web/.turbo
echo -e "${GREEN}   ✓ 清理完成${NC}"

# 2. 安装生产依赖
echo -e "${YELLOW}[2/4] 安装生产环境依赖...${NC}"
pnpm install --prod --frozen-lockfile
echo -e "${GREEN}   ✓ 依赖安装完成${NC}"

# 3. 构建
echo -e "${YELLOW}[3/4] 构建应用...${NC}"
export GENERATE_SOURCEMAP=false
turbo build
echo -e "${GREEN}   ✓ 构建完成${NC}"

# 4. 清理
echo -e "${YELLOW}[4/4] 清理无用文件...${NC}"
find . -type f -name "*.map" -delete 2>/dev/null || true
find . -type f -name "*.log" -delete 2>/dev/null || true
find . -type f -name "*.test.*" -delete 2>/dev/null || true
find . -type f -name "*.spec.*" -delete 2>/dev/null || true
echo -e "${GREEN}   ✓ 清理完成${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ 构建成功！                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
echo ""

# 显示大小
if [ -d "apps/web/.next/standalone" ]; then
  SIZE=$(du -sh apps/web/.next/standalone 2>/dev/null | cut -f1)
  echo -e "${GREEN}构建产物大小：${YELLOW}${SIZE}${NC}"
fi

echo ""
echo -e "${YELLOW}启动应用：${NC}pnpm start"
echo ""
