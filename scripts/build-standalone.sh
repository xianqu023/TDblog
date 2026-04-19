#!/bin/bash
# Blog Platform - Standalone Build Script
# Creates a self-contained package with Node.js runtime for one-click deployment

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
echo -e "${GREEN}   Blog Platform 独立环境构建脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_NAME="blog-platform"
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date +%Y%m%d_%H%M%S)
BUILD_DIR="dist"
PACKAGE_NAME="${APP_NAME}-v${VERSION}-${BUILD_DATE}"
OUTPUT_DIR="${BUILD_DIR}/${PACKAGE_NAME}"

# Step 1: Check prerequisites
echo -e "\n${BLUE}[1/8] 检查构建环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: pnpm 未安装${NC}"
    exit 1
fi
echo "Node.js: $(node -v)"
echo "pnpm: $(pnpm -v)"

# Step 2: Install dependencies
echo -e "\n${BLUE}[2/8] 安装依赖...${NC}"
pnpm install --frozen-lockfile

# Step 3: Generate Prisma client
echo -e "\n${BLUE}[3/8] 生成 Prisma 客户端...${NC}"
cd packages/database
pnpm prisma generate
cd ../..

# Step 4: Build application
echo -e "\n${BLUE}[4/8] 构建应用 (Standalone)...${NC}"
cd apps/web
pnpm build
cd ../..

# Step 5: Create standalone package directory
echo -e "\n${BLUE}[5/8] 创建独立运行包...${NC}"
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Copy standalone Next.js output
cp -r apps/web/.next/standalone/* "${OUTPUT_DIR}/"

# Copy static files
mkdir -p "${OUTPUT_DIR}/.next/static"
cp -r apps/web/.next/static/* "${OUTPUT_DIR}/.next/static/"

# Copy public directory
cp -r apps/web/public "${OUTPUT_DIR}/public"

# Copy uploads directory (create if not exists)
mkdir -p "${OUTPUT_DIR}/uploads"

# Copy Prisma schema and generated client for migrations
mkdir -p "${OUTPUT_DIR}/prisma"
cp packages/database/prisma/schema.prisma "${OUTPUT_DIR}/prisma/"

# If Prisma client was generated, copy it
if [ -d "packages/database/node_modules/.prisma" ]; then
    mkdir -p "${OUTPUT_DIR}/node_modules/.prisma"
    cp -r packages/database/node_modules/.prisma/* "${OUTPUT_DIR}/node_modules/.prisma/"
fi

# Copy environment template
cp conf.ini.example "${OUTPUT_DIR}/conf.ini"

# Step 6: Create startup script
echo -e "\n${BLUE}[6/8] 创建启动脚本...${NC}"

cat > "${OUTPUT_DIR}/start.sh" << 'STARTUP_SCRIPT'
#!/bin/bash
# Blog Platform - 一键启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform${NC}"
echo -e "${GREEN}========================================${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 需要安装 Node.js 18+${NC}"
    exit 1
fi

# Check conf.ini file
if [ ! -f "conf.ini" ]; then
    echo -e "${YELLOW}警告: conf.ini 文件不存在，正在创建...${NC}"
    if [ -f "conf.ini.example" ]; then
        cp conf.ini.example conf.ini
    else
        echo -e "${RED}错误: 找不到 conf.ini.example${NC}"
        exit 1
    fi
fi

# Load environment variables from conf.ini
source scripts/load-config.sh 2>/dev/null || true

# Run database migrations if needed
if command -v npx &> /dev/null; then
    echo -e "${YELLOW}检查数据库迁移...${NC}"
    if [ -f "prisma/schema.prisma" ]; then
        DATABASE_URL=$(grep DATABASE_URL .env | head -1 | cut -d= -f2-)
        if [ -n "$DATABASE_URL" ]; then
            npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null || echo -e "${YELLOW}数据库迁移跳过 (使用内置 SQLite)${NC}"
        fi
    fi
fi

# Set default port if not configured
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Start the application
echo -e "${GREEN}启动服务...${NC}"
echo -e "${GREEN}访问地址: http://localhost:${PORT}${NC}"
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo -e "${GREEN}========================================${NC}"

# Run the standalone server
exec node server.js
STARTUP_SCRIPT

chmod +x "${OUTPUT_DIR}/start.sh"

# Create stop script
cat > "${OUTPUT_DIR}/stop.sh" << 'STOP_SCRIPT'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Find and kill the node process running server.js
PID=$(pgrep -f "node server.js" 2>/dev/null || true)
if [ -n "$PID" ]; then
    echo "Stopping Blog Platform (PID: $PID)..."
    kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null
    echo "Service stopped."
else
    echo "No running service found."
fi
STOP_SCRIPT

chmod +x "${OUTPUT_DIR}/stop.sh"

# Step 7: Create README
echo -e "\n${BLUE}[7/8] 创建部署文档...${NC}"

cat > "${OUTPUT_DIR}/README.md" << README
# Blog Platform v${VERSION}

## 快速开始

### 1. 配置环境
编辑 \`conf.ini\` 文件，配置数据库等参数：

\`\`\`ini
[database]
provider = postgresql
url = postgresql://user:password@localhost:5432/blog

[server]
port = 3000
host = 0.0.0.0
node_env = production

[auth]
secret = your-secret-key-change-in-production
url = http://localhost:3000

[site]
name = My Blog
url = http://localhost:3000
\`\`\`

### 2. 启动服务

\`\`\`bash
# Linux/macOS
chmod +x start.sh
./start.sh

# Windows (使用 Git Bash 或 WSL)
bash start.sh
\`\`\`

### 3. 停止服务

\`\`\`bash
./stop.sh
\`\`\`

## 目录结构

\`\`\`
├── server.js          # 主服务文件
├── start.sh           # 启动脚本
├── stop.sh            # 停止脚本
├── conf.ini           # 配置文件
├── .next/             # 构建产物
├── public/            # 静态资源
├── uploads/           # 上传文件
└── prisma/            # 数据库配置
\`\`\`

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 3000 |
| HOSTNAME | 监听地址 | 0.0.0.0 |
| DATABASE_URL | 数据库连接字符串 | file:./data/blog.db |
| NEXTAUTH_SECRET | NextAuth 密钥 | - |
| NEXTAUTH_URL | 认证回调 URL | http://localhost:3000 |

## 系统要求

- Node.js 18+
- Linux / macOS / Windows (WSL)

## 版本信息

- 构建日期: ${BUILD_DATE}
- 版本: v${VERSION}
README

# Step 8: Create compressed archive
echo -e "\n${BLUE}[8/8] 打包压缩...${NC}"

cd "${BUILD_DIR}"
tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}/"
cd ..

# Get file size
PACKAGE_SIZE=$(du -sh "${BUILD_DIR}/${PACKAGE_NAME}.tar.gz" | cut -f1)

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   构建完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "包名称: ${YELLOW}${PACKAGE_NAME}${NC}"
echo -e "大小: ${YELLOW}${PACKAGE_SIZE}${NC}"
echo -e "位置: ${YELLOW}${BUILD_DIR}/${PACKAGE_NAME}.tar.gz${NC}"
echo -e ""
echo -e "${BLUE}部署步骤:${NC}"
echo -e "1. 将压缩包上传到服务器"
echo -e "2. 解压: tar -xzf ${PACKAGE_NAME}.tar.gz"
echo -e "3. 进入目录: cd ${PACKAGE_NAME}"
echo -e "4. 编辑 .env 文件配置数据库"
echo -e "5. 运行: chmod +x start.sh && ./start.sh"
