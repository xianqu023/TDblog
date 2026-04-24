# 多数据库连接使用指南

## 概述

优化后的数据库连接方案支持以下特性：

1. **单数据库模式**：保持向后兼容，使用默认的 `prisma` 导出
2. **多数据库模式**：支持同时连接多个数据库实例
3. **自动适配**：根据 URL 自动选择 SQLite (better-sqlite3) 或远程数据库 (libsql)
4. **连接管理**：统一的连接创建、复用和销毁

## 使用方式

### 方式一：单数据库模式（默认，向后兼容）

```typescript
import { prisma } from '@blog/database';

// 直接使用默认连接
const users = await prisma.user.findMany();
```

### 方式二：多数据库模式

#### 1. 初始化多数据库连接

```typescript
import { initializeMultiDatabase } from '@blog/database';

// 初始化多数据库连接管理器
initializeMultiDatabase({
  connections: {
    default: {
      url: process.env.DATABASE_URL || 'file:./prisma/blog.db',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    read: {
      url: process.env.DATABASE_READ_URL || 'file:./prisma/read.db',
    },
    write: {
      url: process.env.DATABASE_WRITE_URL || 'file:./prisma/write.db',
    },
    analytics: {
      url: process.env.DATABASE_ANALYTICS_URL || 'libsql://your-turso-url',
      authToken: process.env.DATABASE_ANALYTICS_AUTH_TOKEN,
    },
  },
  defaultConnection: 'default',
});
```

#### 2. 获取指定数据库连接

```typescript
import { getDatabase } from '@blog/database';

// 获取默认连接
const defaultDb = getDatabase();

// 获取读库连接
const readDb = getDatabase('read');

// 获取写库连接
const writeDb = getDatabase('write');

// 获取分析库连接
const analyticsDb = getDatabase('analytics');

// 使用连接
const users = await readDb.user.findMany();
const analytics = await analyticsDb.setting.findMany();
```

#### 3. 断开连接

```typescript
import { disconnectDatabase, disconnectAllDatabases } from '@blog/database';

// 断开特定连接
await disconnectDatabase('read');

// 断开所有连接（推荐在应用关闭时调用）
await disconnectAllDatabases();
```

## 环境变量配置

### 基础配置（单数据库）

```bash
# 数据库连接 URL
DATABASE_URL=file:./prisma/blog.db
# 或远程数据库
# DATABASE_URL=libsql://your-turso-url
# DATABASE_URL=postgresql://user:password@localhost:5432/blog

# 数据库认证 Token（远程数据库需要）
DATABASE_AUTH_TOKEN=your-auth-token

# 数据库类型
DATABASE_PROVIDER=sqlite
```

### 读写分离配置

```bash
# 主库（写操作）
DATABASE_URL=file:./prisma/write.db
DATABASE_WRITE_URL=file:./prisma/write.db

# 从库（读操作）
DATABASE_READ_URL=file:./prisma/read.db

# 分析库
DATABASE_ANALYTICS_URL=libsql://analytics-db-url
DATABASE_ANALYTICS_AUTH_TOKEN=analytics-token
```

### 自定义多数据库配置

```bash
# 使用 JSON 配置自定义连接
DATABASE_CUSTOM_CONNECTIONS='{
  "cache": {
    "url": "file:./prisma/cache.db",
    "log": ["error"]
  },
  "session": {
    "url": "file:./prisma/session.db",
    "log": ["error", "warn"]
  }
}'
```

## 使用场景

### 场景一：读写分离

```typescript
import { getDatabase } from '@blog/database';

async function getArticleWithStats(slug: string) {
  const readDb = getDatabase('read');
  const writeDb = getDatabase('write');
  
  // 从读库获取文章
  const article = await readDb.article.findUnique({
    where: { slug },
  });
  
  // 写入操作使用写库
  await writeDb.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });
  
  return article;
}
```

### 场景二：数据分析隔离

```typescript
import { getDatabase } from '@blog/database';

async function generateAnalyticsReport() {
  const analyticsDb = getDatabase('analytics');
  const mainDb = getDatabase('default');
  
  // 从主库获取基础数据
  const articles = await mainDb.article.findMany();
  
  // 在分析库中进行复杂查询
  const stats = await analyticsDb.$queryRaw`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM article_views
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY DATE(created_at)
  `;
  
  return { articles, stats };
}
```

### 场景三：多租户数据库

```typescript
import { getDatabase } from '@blog/database';

function getTenantDatabase(tenantId: string) {
  return getDatabase(`tenant_${tenantId}`);
}

async function getTenantData(tenantId: string) {
  const tenantDb = getTenantDatabase(tenantId);
  return await tenantDb.article.findMany({
    where: { tenantId },
  });
}
```

## 连接管理最佳实践

### 1. 应用启动时初始化

```typescript
// apps/web/src/lib/database/init.ts
import { initializeMultiDatabase, loadDatabaseConfig } from '@blog/database';

export function setupDatabase() {
  const config = loadDatabaseConfig();
  initializeMultiDatabase(config);
  console.log('✅ 数据库连接初始化完成');
}
```

### 2. 应用关闭时清理

```typescript
// apps/web/src/lib/database/cleanup.ts
import { disconnectAllDatabases } from '@blog/database';

export async function cleanupDatabase() {
  try {
    await disconnectAllDatabases();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
}

// 在 Next.js 中注册清理函数
process.on('beforeExit', cleanupDatabase);
process.on('SIGINT', async () => {
  await cleanupDatabase();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await cleanupDatabase();
  process.exit(0);
});
```

### 3. 在 Next.js 中间件中使用

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDatabase } from '@blog/database';

export async function middleware(request: NextRequest) {
  // 注意：中间件中不要使用数据库连接
  // 数据库连接应该在 API routes 或 Server Components 中使用
  return NextResponse.next();
}
```

### 4. 在 API Routes 中使用

```typescript
// apps/web/src/app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@blog/database';

export async function GET() {
  try {
    const db = getDatabase('read');
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
```

## 性能优化建议

1. **连接复用**：`getDatabase()` 会自动复用已有连接，无需担心重复创建
2. **按需连接**：只在需要时获取特定连接，避免不必要的连接
3. **日志级别**：生产环境设置 `log: ['error']` 减少日志开销
4. **连接池**：对于高并发场景，考虑使用连接池管理

## 故障排查

### 检查连接状态

```typescript
import { dbManager } from '@blog/database';

const connectionNames = dbManager.getConnectionNames();
console.log('活跃连接:', connectionNames);

const hasReadConnection = dbManager.hasConnection('read');
console.log('是否有读库连接:', hasReadConnection);
```

### 常见错误

1. **"未初始化"错误**：确保先调用 `initializeMultiDatabase()`
2. **连接失败**：检查 DATABASE_URL 格式是否正确
3. **超时**：远程数据库检查网络连接和认证 token

## 迁移现有代码

### 从单连接迁移到多连接

```typescript
// 之前
import { prisma } from '@blog/database';
const users = await prisma.user.findMany();

// 现在（向后兼容，原代码仍可工作）
import { prisma } from '@blog/database';
const users = await prisma.user.findMany();

// 或使用新 API
import { getDatabase } from '@blog/database';
const db = getDatabase('default');
const users = await db.user.findMany();
```

## 安全注意事项

1. **不要在客户端暴露连接信息**：数据库连接只在服务端使用
2. **使用环境变量**：敏感信息通过环境变量管理
3. **定期断开空闲连接**：避免连接泄漏
4. **监控连接数**：防止连接数过多导致资源耗尽
