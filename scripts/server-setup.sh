#!/bin/bash
# Blog Platform - Server Setup Script (run on server after uploading)

export NODE_ENV=production

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform - Server Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not found${NC}"
    exit 1
fi
echo "Node.js: $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Installing pnpm...${NC}"
    npm install -g pnpm
fi
echo "pnpm: $(pnpm -v)"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma Client...${NC}"
cd packages/database
pnpm prisma generate
cd ../..

# Create .env if not exists
if [ ! -f "apps/web/.env.local" ]; then
    echo -e "\n${YELLOW}Creating .env.local...${NC}"
    cat > apps/web/.env.local << 'ENV'
NODE_ENV=production
DATABASE_URL=file:./data/blog.db
NEXTAUTH_SECRET=your-secret-change-me
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Blog Platform
ENV
fi

# Build
echo -e "\n${YELLOW}Building application...${NC}"
pnpm build

# Create data dirs
mkdir -p data uploads

# Create start script
cat > start.sh << 'START'
#!/bin/bash
export NODE_ENV=production
export PORT="${PORT:-3000}"
cd "$(dirname "${BASH_SOURCE[0]}")"
cd apps/web
mkdir -p data uploads
echo "========================================"
echo "   Blog Platform"
echo "========================================"
echo "  Access:   http://0.0.0.0:${PORT}"
echo "  Node.js:  $(node -v)"
echo "  Press Ctrl+C to stop"
echo "========================================"
cd .next/standalone
exec node server.js
START

chmod +x start.sh

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "To start: ${YELLOW}./start.sh${NC}"
echo -e "To run in background: ${YELLOW}nohup ./start.sh > blog.log 2>&1 &${NC}"
