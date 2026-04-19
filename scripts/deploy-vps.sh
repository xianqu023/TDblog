#!/bin/bash

# Blog Platform - VPS Docker Deployment Script
# This script deploys the application using Docker Compose on VPS
# Supports MySQL, PostgreSQL, and SQLite

set -e

echo "🚀 Starting VPS deployment with Docker..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating environment file...${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cat > .env << 'EOF'
# Database Configuration
# Database provider: mysql, postgresql, or sqlite
DB_PROVIDER=mysql

# MySQL Configuration
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_DATABASE=blog
MYSQL_USER=bloguser
MYSQL_PASSWORD=your-secure-db-password
DATABASE_URL="mysql://bloguser:your-secure-db-password@mysql:3306/blog"

# PostgreSQL Configuration (uncomment if using PostgreSQL)
# POSTGRES_PASSWORD=your-secure-db-password
# DATABASE_URL="postgresql://bloguser:your-secure-db-password@postgresql:5432/blog"

# SQLite Configuration (uncomment if using SQLite)
# DATABASE_URL="file:./blog.db"

# NextAuth Configuration
NEXTAUTH_SECRET=generate-a-random-secret-key-here
NEXTAUTH_URL=http://your-domain.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://your-domain.com
NEXT_PUBLIC_SITE_NAME=My Blog

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (optional)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Alipay (optional)
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=alipay-public-key

# WeChat Pay (optional)
WECHAT_PAY_APP_ID=your-wechat-app-id
WECHAT_PAY_MCH_ID=your-merchant-id
WECHAT_PAY_API_KEY=your-api-key
EOF

    echo -e "${YELLOW}⚠️  Please edit the .env file with your actual configuration${NC}"
    echo -e "${YELLOW}   Set DB_PROVIDER to mysql, postgresql, or sqlite${NC}"
    exit 1
fi

# Load DB_PROVIDER from .env
DB_PROVIDER=$(grep '^DB_PROVIDER=' .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_PROVIDER=${DB_PROVIDER:-mysql}

echo -e "${BLUE}Database provider: ${DB_PROVIDER}${NC}"

# Set Docker Compose profile based on database type
if [ "$DB_PROVIDER" = "sqlite" ]; then
    COMPOSE_PROFILES=""
    echo -e "${YELLOW}⚠️  Using SQLite - no database container will be started${NC}"
elif [ "$DB_PROVIDER" = "postgresql" ]; then
    COMPOSE_PROFILES="--profile postgresql"
    echo -e "${BLUE}Using PostgreSQL database${NC}"
elif [ "$DB_PROVIDER" = "mysql" ]; then
    COMPOSE_PROFILES="--profile mysql"
    echo -e "${BLUE}Using MySQL database${NC}"
else
    echo -e "${RED}❌ Invalid DB_PROVIDER: ${DB_PROVIDER}${NC}"
    echo -e "${YELLOW}   Must be one of: mysql, postgresql, sqlite${NC}"
    exit 1
fi

echo -e "${BLUE}Step 2: Building Docker images...${NC}"
docker-compose ${COMPOSE_PROFILES} build

echo -e "${BLUE}Step 3: Starting services...${NC}"
docker-compose ${COMPOSE_PROFILES} up -d

if [ "$DB_PROVIDER" = "mysql" ]; then
    echo -e "${BLUE}Step 4: Waiting for MySQL to be ready...${NC}"
    sleep 10
elif [ "$DB_PROVIDER" = "postgresql" ]; then
    echo -e "${BLUE}Step 4: Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
else
    echo -e "${BLUE}Step 4: SQLite ready (file-based)${NC}"
fi

echo -e "${BLUE}Step 5: Running database migrations...${NC}"
docker-compose exec -T web sh -c "cd packages/database && npx prisma migrate deploy" || {
    echo -e "${YELLOW}⚠️  Migration failed. You may need to run it manually:${NC}"
    echo "docker-compose exec web sh -c 'cd packages/database && npx prisma migrate deploy'"
}

echo -e "${BLUE}Step 6: Seeding database (first time only)...${NC}"
docker-compose exec -T web sh -c "cd packages/database && npx prisma db seed" || {
    echo -e "${YELLOW}⚠️  Seeding failed or already seeded.${NC}"
}

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Your application is now running at:${NC}"
echo "  - Web: http://localhost:3000"

if [ "$DB_PROVIDER" = "mysql" ]; then
    echo "  - MySQL: localhost:3306"
elif [ "$DB_PROVIDER" = "postgresql" ]; then
    echo "  - PostgreSQL: localhost:5432"
else
    echo "  - SQLite: file:./blog.db"
fi

echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  - View logs: docker-compose ${COMPOSE_PROFILES} logs -f"
echo "  - Stop: docker-compose ${COMPOSE_PROFILES} down"
echo "  - Restart: docker-compose ${COMPOSE_PROFILES} restart"
echo "  - Update: docker-compose ${COMPOSE_PROFILES} pull && docker-compose ${COMPOSE_PROFILES} up -d"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "  1. Configure your domain in docker/nginx/conf.d/default.conf"
echo "  2. Set up SSL certificates"
echo "  3. Update NEXTAUTH_URL and NEXT_PUBLIC_SITE_URL in .env"
