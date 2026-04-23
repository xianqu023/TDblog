# Blog Platform

A comprehensive personal blog platform with multi-language support, e-commerce, and payment integration.

## Features

- **Multi-language**: Chinese, English, Japanese
- **Dual-column layout**: Hero slider, article lists, sidebar widgets
- **Sidebar widgets**: Colorful tag cloud, popular articles, blogger card, ad card, countdown, weather
- **Admin panel**: User management, membership, paid downloads, paid reading
- **RBAC permissions**: Role-based access control (admin-only configuration)
- **Article editor**: Rich text editing and publishing
- **File upload/storage**: Attachment management
- **Website settings**: Comprehensive configuration
- **Advanced SEO**: Sitemap, meta tags, structured data (JSON-LD)
- **Shop**: Simple e-commerce functionality
- **Payment**: Stripe, PayPal, Alipay, WeChat Pay

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MySQL / PostgreSQL / SQLite, Prisma ORM
- **i18n**: next-intl
- **Editor**: TipTap
- **Payments**: Stripe, PayPal, Alipay, WeChat Pay
- **Deployment**: Docker, Next.js Standalone

## Project Structure

```
blog/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── (public)/   # Public routes
│       │   │   ├── (admin)/    # Admin routes
│       │   │   └── [locale]/   # Locale-based routes
│       │   ├── components/     # React components
│       │   ├── lib/            # Utilities
│       │   └── middleware.ts   # Next.js middleware
│       └── public/             # Static assets
├── packages/
│   └── database/               # Prisma database package
│       ├── prisma/
│       │   └── schema.prisma   # Database schema
│       └── src/
├── docker/                     # Docker configuration
├── scripts/                    # Deployment scripts
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Docker Compose
└── package.json                # Root monorepo config
```

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Edit `conf.ini` file:

```bash
vim conf.ini
```

**Minimal configuration:**
```ini
[database]
provider = sqlite
url = file:./packages/database/prisma/blog.db

[auth]
secret = your-secret-key  # Generate with: openssl rand -base64 32

[site]
name = My Blog
url = http://localhost:3000
```

### 3. Initialize

```bash
pnpm init
```

This will:
- ✅ Load configuration from `conf.ini`
- ✅ Auto-detect database type
- ✅ Initialize database (migrations + Prisma Client)
- ✅ Generate `.env` file

### 4. Start application

**Development:**
```bash
pnpm dev
```

**Production:**
```bash
# Direct start
pnpm start:prod

# Or with PM2 (recommended)
pnpm start:pm2
```

Visit: http://localhost:3000

---

## 📚 Documentation

- 🚀 **Quick Deploy** → [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
- ⚙️ **Simplified Config** → [SIMPLIFIED_CONFIG.md](SIMPLIFIED_CONFIG.md)
- 📦 **Full Deploy Guide** → [DEPLOY.md](DEPLOY.md)
- 📋 **Config Template** → [conf.ini.full-example](conf.ini.full-example)

## Deployment

### Option 1: VPS with Docker

1. Configure your `.env` file with your database provider (mysql, postgresql, or sqlite)
2. Run the deployment script:
```bash
./scripts/deploy-vps.sh
```

Or manually:
```bash
# MySQL (default)
docker-compose --profile mysql up -d

# PostgreSQL
docker-compose --profile postgresql up -d

# SQLite (no database container)
docker-compose up -d
```

### Option 2: Shared Hosting

1. Build the application:
```bash
pnpm build
```

2. Run the packaging script:
```bash
./scripts/deploy-shared.sh
```

3. Upload the `dist/blog-platform` folder to your hosting

4. Start the application:
```bash
# Using PM2
pm2 start ecosystem.config.js

# Or directly
node apps/web/server.js
```

### Option 3: Next.js Standalone

The build output is configured to `standalone` mode. After building:

```bash
cd apps/web
node .next/standalone/server.js
```

## Default Admin Account

After seeding the database:
- **Email**: admin@example.com
- **Password**: admin123

**Important**: Change the default password immediately after first login.

## Environment Variables

See `.env.example` for all available environment variables.

### Multi-Database Support

The platform supports three database backends. The schema uses Prisma generic types (no `@db.*` annotations) for cross-database compatibility.

**To switch databases:**

1. Edit `packages/database/prisma/schema.prisma` and change the `provider` value:
   ```prisma
   datasource db {
     provider = "mysql"  // Change to "postgresql" or "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` in your `.env` file:

| Database | Example DATABASE_URL |
|----------|----------------------|
| MySQL | `mysql://user:pass@localhost:3306/blog` |
| PostgreSQL | `postgresql://user:pass@localhost:5432/blog` |
| SQLite | `file:./blog.db` |

3. Regenerate Prisma client and push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Run migrations
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Prisma Studio

## License

MIT
