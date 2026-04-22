import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 安全地获取 __dirname
const getDirname = (): string => {
  if (typeof import.meta.url === 'string') {
    return dirname(fileURLToPath(import.meta.url));
  }
  // 回退到当前文件所在目录
  return resolve(process.cwd());
};

const __dirname = getDirname();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 环境检测
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.VERCEL === '1' || 
         process.env.RENDER === 'true' ||
         process.env.DEPLOY_TARGET === 'production';
}

function isServerEnvironment(): boolean {
  // 检测是否在服务器环境（有 DATABASE_URL 环境变量）
  return !!process.env.DATABASE_URL;
}

function getDatabaseUrl(): string {
  // 1. 优先使用环境变量（服务器环境）
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // 2. 本地开发环境使用包目录下的数据库
  const dbPath = resolve(__dirname, '..', 'prisma', 'blog.db');
  return `file:${dbPath}`;
}

function createPrismaClient() {
  const dbUrl = getDatabaseUrl();
  const isProd = isProduction();
  const isServer = isServerEnvironment();
  
  console.log(`[Database] Environment: ${isProd ? 'production' : 'development'}`);
  console.log(`[Database] Server environment: ${isServer ? 'yes' : 'no'}`);
  console.log(`[Database] Connecting to: ${dbUrl}`);

  // 根据 URL 类型选择 adapter
  const isLibsqlUrl = dbUrl.startsWith('libsql://') || dbUrl.startsWith('http://') || dbUrl.startsWith('https://');
  
  let adapter;
  
  if (isLibsqlUrl) {
    // 服务器环境使用 libsql adapter（支持 Turso 等远程数据库）
    console.log('[Database] Using libsql adapter for remote database');
    adapter = new PrismaLibSql({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  } else {
    // 本地环境使用 better-sqlite3 adapter（性能更好）
    console.log('[Database] Using better-sqlite3 adapter for local database');
    adapter = new PrismaBetterSqlite3({
      url: dbUrl,
    });
  }

  return new PrismaClient({
    adapter,
    log: isProd ? ['error'] : ['query', 'error', 'warn'],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (!isProduction()) {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
