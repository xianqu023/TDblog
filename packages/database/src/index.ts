import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { getDatabasePath, ensureDatabaseDirectory } from './db-path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || 
         process.env.VERCEL === '1' || 
         process.env.RENDER === 'true' ||
         process.env.DEPLOY_TARGET === 'production';
}

async function createPrismaClient() {
  const dbUrl = getDatabasePath();
  const isProd = isProduction();
  
  console.log(`[Database] Environment: ${isProd ? 'production' : 'development'}`);
  console.log(`[Database] DATABASE_URL env: ${!!process.env.DATABASE_URL}`);
  console.log(`[Database] Connecting to: ${dbUrl}`);

  const isLibsqlUrl = dbUrl.startsWith('libsql://') || 
                      dbUrl.startsWith('http://') || 
                      dbUrl.startsWith('https://');
  
  let adapter;
  
  if (isLibsqlUrl) {
    console.log('[Database] Using libsql adapter for remote database');
    adapter = new PrismaLibSql({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  } else {
    console.log('[Database] Using better-sqlite3 adapter for local database');
    
    // 确保数据库目录存在（SQLite）
    try {
      await ensureDatabaseDirectory(dbUrl);
    } catch (error) {
      console.error('[Database] 无法创建数据库目录:', error);
    }
    
    adapter = new PrismaBetterSqlite3({
      url: dbUrl,
    });
  }

  return new PrismaClient({
    adapter,
    log: isProd ? ['error'] : ['query', 'error', 'warn'],
  });
}

let prismaInstance: PrismaClient | null = null;

export const prisma: PrismaClient = globalForPrisma.prisma ?? await createPrismaClient();

if (!isProduction()) {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';

export {
  initializeMultiDatabase,
  getDatabase,
  disconnectDatabase,
  disconnectAllDatabases,
  dbManager,
  type DatabaseConnectionType,
  type DatabaseConfig,
  type MultiDatabaseConfig,
} from './multi-db';

export { loadDatabaseConfig, getSingleDatabaseConfig } from './config';
