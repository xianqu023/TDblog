#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   生产环境构建脚本${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${GREEN}[1/6] 清理旧的构建产物...${NC}"

# 删除旧的构建产物
rm -rf .next
rm -rf apps/web/.next
rm -rf apps/web/dist
rm -rf apps/web/build
rm -rf packages/database/.next
rm -rf packages/database/dist
rm -rf packages/database/build
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf apps/web/.turbo
rm -rf packages/database/.turbo

echo -e "${GREEN}   ✓ 清理完成${NC}"
echo ""

echo -e "${GREEN}[2/6] 检查构建工具...${NC}"

# 检查 turbo 是否可用
if ! command -v turbo &> /dev/null && [ ! -d "node_modules/.bin/turbo" ]; then
  echo -e "${RED}   错误：turbo 未安装，请先运行：pnpm install${NC}"
  exit 1
fi

echo -e "${GREEN}   ✓ 构建工具就绪${NC}"
echo ""

echo -e "${GREEN}[3/6] 生成 Prisma 客户端...${NC}"

# 生成 Prisma 客户端
if [ -d "packages/database" ]; then
  cd packages/database
  DATABASE_URL="file:./prisma/blog.db" npx prisma generate
  cd ../..
fi

echo -e "${GREEN}   ✓ Prisma 客户端生成完成${NC}"
echo ""

echo -e "${GREEN}[4/6] 开始构建应用...${NC}"

# 设置环境变量，禁用 source map
export GENERATE_SOURCEMAP=false
export SOURCE_MAP=false

# 构建应用
turbo build

echo -e "${GREEN}   ✓ 构建完成${NC}"
echo ""

echo -e "${GREEN}[5/6] 复制必要文件到 standalone 目录...${NC}"

# 复制 static 目录到 standalone（生产环境必需）
if [ -d "apps/web/.next/static" ] && [ -d "apps/web/.next/standalone/apps/web/.next" ]; then
  cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/
  echo -e "${GREEN}   ✓ static 目录已复制${NC}"
fi

# 复制 public 目录到 standalone（生产环境必需）
if [ -d "apps/web/public" ] && [ -d "apps/web/.next/standalone/apps/web" ]; then
  cp -r apps/web/public apps/web/.next/standalone/apps/web/
  echo -e "${GREEN}   ✓ public 目录已复制${NC}"
fi

# 复制 prisma 数据库目录（如果存在）
if [ -d "packages/database/prisma" ] && [ -d "apps/web/.next/standalone/packages/database" ]; then
  mkdir -p apps/web/.next/standalone/packages/database/prisma
  cp packages/database/prisma/*.db apps/web/.next/standalone/packages/database/prisma/ 2>/dev/null || true
  echo -e "${GREEN}   ✓ prisma 数据库已复制${NC}"
fi

echo ""

echo -e "${GREEN}[6/6] 清理构建产物中的无用文件...${NC}"

# 删除 .map 文件（source maps）
find . -type f -name "*.map" -delete 2>/dev/null || true

# 删除日志文件
find . -type f -name "*.log" -delete 2>/dev/null || true
rm -rf logs/*

# 删除测试文件
find . -type f -name "*.test.*" -delete 2>/dev/null || true
find . -type f -name "*.spec.*" -delete 2>/dev/null || true
find . -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "__mocks__" -exec rm -rf {} + 2>/dev/null || true

# 删除文档文件
find . -type f -name "*.md" ! -name "README.md" -delete 2>/dev/null || true
rm -rf docs/*

# 删除缓存
find . -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "node_modules" -path "*/.cache/*" -exec rm -rf {} + 2>/dev/null || true

# 删除 .env 示例文件
find . -type f -name "*.env.example" -delete 2>/dev/null || true
find . -type f -name "*.env.local" -delete 2>/dev/null || true

# 删除 TypeScript 声明文件（生产环境不需要）
# find . -type f -name "*.d.ts" -delete 2>/dev/null || true

echo -e "${GREEN}   ✓ 清理完成${NC}"
echo ""

echo -e "${GREEN}[6/6] 统计构建产物大小...${NC}"

# 统计大小
if [ -d "apps/web/.next/standalone" ]; then
  STANDALONE_SIZE=$(du -sh apps/web/.next/standalone 2>/dev/null | cut -f1)
  echo -e "${BLUE}   独立构建包大小：${YELLOW}${STANDALONE_SIZE}${NC}"
fi

if [ -d "apps/web/.next/static" ]; then
  STATIC_SIZE=$(du -sh apps/web/.next/static 2>/dev/null | cut -f1)
  echo -e "${BLUE}   静态资源大小：${YELLOW}${STATIC_SIZE}${NC}"
fi

TOTAL_SIZE=$(du -sh apps/web/.next 2>/dev/null | cut -f1)
echo -e "${BLUE}   总构建产物大小：${YELLOW}${TOTAL_SIZE}${NC}"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}   ✅ 构建成功完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo -e "${BLUE}下一步操作：${NC}"
echo "  1. 测试应用：${YELLOW}pnpm start${NC}"
echo "  2. 使用 PM2 启动：${YELLOW}pnpm start:pm2${NC}"
echo "  3. 查看日志：${YELLOW}pnpm logs${NC}"
echo ""
