#!/bin/bash
# Create minimal deployable standalone package from Next.js build

set -e
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}创建最小化部署包...${NC}"

STANDALONE="apps/web/.next/standalone"
if [ ! -d "$STANDALONE" ]; then
    echo "ERROR: Standalone build not found. Run: pnpm build"
    exit 1
fi

# Create deploy directory
DEPLOY="dist/deploy"
rm -rf "$DEPLOY"
mkdir -p "$DEPLOY"

# Copy standalone (contains server.js, node_modules, etc)
cp -R "$STANDALONE"/* "$DEPLOY/"

# Copy static files
mkdir -p "$DEPLOY/.next/static"
cp -R apps/web/.next/static/* "$DEPLOY/.next/static/"

# Copy public
cp -R apps/web/public "$DEPLOY/" 2>/dev/null || mkdir -p "$DEPLOY/public"

# Create data/uploads
mkdir -p "$DEPLOY/data" "$DEPLOY/uploads"

# Create startup script
cat > "$DEPLOY/start.sh" << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
cd "$(dirname "${BASH_SOURCE[0]}")"

mkdir -p data uploads

if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/blog.db
NEXTAUTH_SECRET=changeme-secret-key-12345
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Blog Platform
ENVEOF
fi

set -a
. .env 2>/dev/null
set +a

echo "========================================"
echo "   Blog Platform"
echo "========================================"
echo "  Port:     ${PORT}"
echo "  Database: ${DATABASE_URL}"
echo "  Access:   http://0.0.0.0:${PORT}"
echo "  Press Ctrl+C to stop"
echo "========================================"

exec node server.js
EOF

chmod +x "$DEPLOY/start.sh"

# Package
cd dist
tar czf deploy-blog-platform.tar.gz deploy/
SIZE=$(du -sh deploy-blog-platform.tar.gz | cut -f1)

echo -e "\n${GREEN}部署包创建完成!${NC}"
echo -e "  文件: ${YELLOW}dist/deploy-blog-platform.tar.gz${NC}"
echo -e "  大小: ${YELLOW}${SIZE}${NC}"
