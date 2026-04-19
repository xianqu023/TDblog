#!/bin/bash

# Blog Platform - Shared Hosting Deployment Script
# This script builds and packages the application for shared hosting

set -e

echo "🚀 Starting deployment for shared hosting..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="blog-platform"
BUILD_DIR="dist"
OUTPUT_DIR="${BUILD_DIR}/${APP_NAME}"

echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
pnpm install

echo -e "${BLUE}Step 2: Generating Prisma client...${NC}"
pnpm db:generate

echo -e "${BLUE}Step 3: Building application...${NC}"
pnpm build

echo -e "${BLUE}Step 4: Creating deployment package...${NC}"
rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Copy standalone output
cp -r apps/web/.next/standalone "${OUTPUT_DIR}/"
cp -r apps/web/.next/static "${OUTPUT_DIR}/apps/web/.next/static"
cp -r apps/web/public "${OUTPUT_DIR}/apps/web/public"

# Create .env file template
cat > "${OUTPUT_DIR}/.env.example" << 'EOF'
# Database
DATABASE_URL=mysql://user:password@localhost:3306/blog

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=My Blog

# Payment (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
WECHAT_PAY_APP_ID=
WECHAT_PAY_MCH_ID=
WECHAT_PAY_API_KEY=
EOF

# Create startup script
cat > "${OUTPUT_DIR}/start.sh" << 'EOF'
#!/bin/bash
# Start the application
cd "$(dirname "$0")"
export NODE_ENV=production
node apps/web/server.js
EOF

chmod +x "${OUTPUT_DIR}/start.sh"

# Create PM2 ecosystem file
cat > "${OUTPUT_DIR}/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'blog-platform',
    script: 'apps/web/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Create .htaccess for Apache shared hosting
cat > "${OUTPUT_DIR}/.htaccess" << 'EOF'
# Enable rewrite engine
RewriteEngine On

# Redirect all traffic to the Node.js app
RewriteRule ^$ http://localhost:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Set proxy headers
RequestHeader set X-Forwarded-Proto "http"
RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"

# Increase upload limit
LimitRequestBody 52428800

# Enable compression
AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
EOF

echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${BLUE}Deployment package created: ${OUTPUT_DIR}${NC}"
echo ""
echo -e "${BLUE}Next steps for shared hosting:${NC}"
echo "1. Upload the '${OUTPUT_DIR}' folder to your hosting"
echo "2. Copy .env.example to .env and configure your settings"
echo "3. Run database migrations: npx prisma migrate deploy"
echo "4. Start the application:"
echo "   - Using PM2: pm2 start ecosystem.config.js"
echo "   - Using npm: node apps/web/server.js"
echo "   - Using start.sh: ./start.sh"
echo ""
echo -e "${BLUE}For Apache shared hosting:${NC}"
echo "1. Configure reverse proxy in your hosting panel"
echo "2. Point the proxy to localhost:3000"
echo "3. The included .htaccess file handles proxy configuration"
