#!/bin/bash
# Blog Platform - Source Package Builder
# Creates a clean source archive ready for distribution and development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 源码包构建脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_NAME="blog-platform"
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date +%Y%m%d_%H%M%S)
BUILD_DIR="dist"
PACKAGE_NAME="${APP_NAME}-source-v${VERSION}-${BUILD_DATE}"
OUTPUT_DIR="${BUILD_DIR}/${PACKAGE_NAME}"

# Create build directory
mkdir -p "${BUILD_DIR}"

# Step 1: Clean previous builds
echo -e "\n${BLUE}[1/4] 清理旧文件...${NC}"
rm -rf "${OUTPUT_DIR}"

# Step 2: Copy source files (excluding build artifacts and node_modules)
echo -e "\n${BLUE}[2/4] 复制源码文件...${NC}"

# Use rsync-like approach to copy necessary directories
mkdir -p "${OUTPUT_DIR}"

# Copy all source files with exclusions
rsync -a --exclude-from="${PROJECT_DIR}/scripts/.buildignore" . "${OUTPUT_DIR}/"

# If rsync not available, fallback to cp
if ! command -v rsync &> /dev/null; then
    echo "rsync not available, using cp fallback"
    # Use git archive if possible
    if git rev-parse --is-inside-work-tree 2>/dev/null; then
        git archive --format=tar HEAD | tar -x -C "${OUTPUT_DIR}"
    else
        echo "Warning: Using fallback copy (may include build artifacts)"
        mkdir -p "${OUTPUT_DIR}"
        for dir in apps packages scripts; do
            if [ -d "$dir" ]; then
                cp -r "$dir" "${OUTPUT_DIR}/"
            fi
        done
        for file in pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json README.md .env.example .dockerignore Dockerfile; do
            if [ -f "$file" ]; then
                cp "$file" "${OUTPUT_DIR}/"
            fi
        done
    fi
fi

# Step 3: Add setup script
echo -e "\n${BLUE}[3/4] 添加部署脚本...${NC}"

cat > "${OUTPUT_DIR}/quick-setup.sh" << 'SETUP_SCRIPT'
#!/bin/bash
# Blog Platform - Quick Setup Script
# Runs all necessary setup commands to get the project running

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 源码快速配置${NC}"
echo -e "${GREEN}========================================${NC}"

# Check prerequisites
echo -e "\n${YELLOW}检查环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 需要安装 Node.js 18+${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm 未安装，正在安装...${NC}"
    npm install -g pnpm
fi

echo "Node.js: $(node -v)"
echo "pnpm: $(pnpm -v)"

# Install dependencies
echo -e "\n${YELLOW}安装依赖...${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Generate Prisma client
echo -e "\n${YELLOW}生成 Prisma 客户端...${NC}"
cd packages/database
pnpm prisma generate
cd ../..

# Setup environment file
echo -e "\n${YELLOW}配置环境...${NC}"
if [ ! -f "apps/web/.env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example apps/web/.env.local
        echo -e "${GREEN}已创建 apps/web/.env.local，请编辑配置数据库等信息${NC}"
    fi
fi

# Build (optional)
echo -e "\n${YELLOW}是否立即构建项目? (y/N)${NC}"
read -r BUILD_CHOICE
if [[ "$BUILD_CHOICE" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}构建中...${NC}"
    pnpm build
    echo -e "${GREEN}构建完成!${NC}"
fi

# Run database migration
echo -e "\n${YELLOW}是否运行数据库迁移? (y/N)${NC}"
read -r MIGRATE_CHOICE
if [[ "$MIGRATE_CHOICE" =~ ^[Yy]$ ]]; then
    cd packages/database
    pnpm prisma migrate deploy
    cd ../..
    echo -e "${GREEN}数据库迁移完成!${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   配置完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}启动开发服务器: pnpm dev${NC}"
echo -e "${BLUE}构建生产版本: pnpm build${NC}"
SETUP_SCRIPT

chmod +x "${OUTPUT_DIR}/quick-setup.sh"

# Copy the standalone build script
if [ -f "scripts/build-standalone.sh" ]; then
    cp "scripts/build-standalone.sh" "${OUTPUT_DIR}/scripts/build-standalone.sh"
fi

# Step 4: Create compressed archive
echo -e "\n${BLUE}[4/4] 打包压缩...${NC}"

cd "${BUILD_DIR}"
tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}/"
cd ..

# Get file size
PACKAGE_SIZE=$(du -sh "${BUILD_DIR}/${PACKAGE_NAME}.tar.gz" | cut -f1)

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   源码包构建完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "包名称: ${YELLOW}${PACKAGE_NAME}${NC}"
echo -e "大小: ${YELLOW}${PACKAGE_SIZE}${NC}"
echo -e "位置: ${YELLOW}${BUILD_DIR}/${PACKAGE_NAME}.tar.gz${NC}"
echo -e ""
echo -e "${BLUE}使用方式:${NC}"
echo -e "1. 解压源码包"
echo -e "2. 运行 quick-setup.sh 一键配置"
echo -e "3. 或直接运行 build-standalone.sh 构建独立运行包"
