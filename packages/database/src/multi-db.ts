import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { resolve } from 'node:path';

export type DatabaseConnectionType = 'default' | 'read' | 'write' | 'analytics' | string;

export interface DatabaseConfig {
  url: string;
  authToken?: string;
  provider?: 'sqlite' | 'postgresql' | 'mysql';
  log?: ('query' | 'error' | 'warn' | 'info')[];
}

export interface MultiDatabaseConfig {
  connections: Record<DatabaseConnectionType, DatabaseConfig>;
  defaultConnection?: DatabaseConnectionType;
}

class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private connections: Map<DatabaseConnectionType, PrismaClient> = new Map();
  private config: MultiDatabaseConfig | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  initialize(config: MultiDatabaseConfig): void {
    this.config = config;
    console.log('[Multi-DB] 初始化多数据库连接管理器');
    console.log(`[Multi-DB] 配置了 ${Object.keys(config.connections).length} 个数据库连接`);
  }

  private createPrismaClient(dbConfig: DatabaseConfig, connectionName: string): PrismaClient {
    const isProd = process.env.NODE_ENV === 'production';
    
    console.log(`[Multi-DB] 创建连接 '${connectionName}': ${dbConfig.url}`);

    const isLibsqlUrl = dbConfig.url.startsWith('libsql://') || 
                        dbConfig.url.startsWith('http://') || 
                        dbConfig.url.startsWith('https://');
    
    let adapter;
    
    if (isLibsqlUrl) {
      console.log(`[Multi-DB] 连接 '${connectionName}' 使用 libsql adapter (远程数据库)`);
      adapter = new PrismaLibSql({
        url: dbConfig.url,
        authToken: dbConfig.authToken || process.env.DATABASE_AUTH_TOKEN,
      });
    } else {
      console.log(`[Multi-DB] 连接 '${connectionName}' 使用 better-sqlite3 adapter (本地数据库)`);
      
      let dbUrl = dbConfig.url;
      if (dbUrl.startsWith('file:') && !dbUrl.includes('/')) {
        const dbPath = resolve(process.cwd(), 'prisma', dbUrl.replace('file:', ''));
        dbUrl = `file:${dbPath}`;
      }
      
      adapter = new PrismaBetterSqlite3({
        url: dbUrl,
      });
    }

    return new PrismaClient({
      adapter,
      log: dbConfig.log || (isProd ? ['error'] : ['error', 'warn']),
    });
  }

  getConnection(connectionName?: DatabaseConnectionType): PrismaClient {
    if (!this.config) {
      throw new Error('[Multi-DB] 数据库管理器未初始化，请先调用 initialize()');
    }

    const name = connectionName || this.config.defaultConnection || 'default';
    
    if (this.connections.has(name)) {
      const conn = this.connections.get(name)!;
      console.log(`[Multi-DB] 复用已有连接 '${name}'`);
      return conn;
    }

    const dbConfig = this.config.connections[name];
    if (!dbConfig) {
      throw new Error(`[Multi-DB] 未找到数据库连接配置 '${name}'`);
    }

    const client = this.createPrismaClient(dbConfig, name);
    this.connections.set(name, client);
    
    return client;
  }

  async disconnect(connectionName?: DatabaseConnectionType): Promise<void> {
    if (connectionName) {
      const client = this.connections.get(connectionName);
      if (client) {
        console.log(`[Multi-DB] 断开连接 '${connectionName}'`);
        await client.$disconnect();
        this.connections.delete(connectionName);
      }
    } else {
      console.log('[Multi-DB] 断开所有数据库连接');
      for (const [name, client] of this.connections.entries()) {
        await client.$disconnect();
        console.log(`[Multi-DB] 已断开连接 '${name}'`);
      }
      this.connections.clear();
    }
  }

  async disconnectAll(): Promise<void> {
    await this.disconnect();
  }

  getConnectionNames(): DatabaseConnectionType[] {
    return Array.from(this.connections.keys());
  }

  hasConnection(connectionName: DatabaseConnectionType): boolean {
    return this.connections.has(connectionName);
  }
}

const dbManager = DatabaseConnectionManager.getInstance();

export function initializeMultiDatabase(config: MultiDatabaseConfig): void {
  dbManager.initialize(config);
}

export function getDatabase(connectionName?: DatabaseConnectionType): PrismaClient {
  return dbManager.getConnection(connectionName);
}

export async function disconnectDatabase(connectionName?: DatabaseConnectionType): Promise<void> {
  await dbManager.disconnect(connectionName);
}

export async function disconnectAllDatabases(): Promise<void> {
  await dbManager.disconnectAll();
}

export { dbManager };
