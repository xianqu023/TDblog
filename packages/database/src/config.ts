import type { MultiDatabaseConfig } from './multi-db';
import { getDatabasePath } from './db-path';

function getDatabaseConfig(): MultiDatabaseConfig {
  const config: MultiDatabaseConfig = {
    connections: {},
    defaultConnection: 'default',
  };

  const defaultDbUrl = process.env.DATABASE_URL;
  
  if (defaultDbUrl) {
    config.connections.default = {
      url: defaultDbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
      provider: (process.env.DATABASE_PROVIDER as any) || 'sqlite',
    };
  } else {
    const dbPath = getDatabasePath();
    config.connections.default = {
      url: dbPath,
      provider: 'sqlite',
    };
  }

  const readDbUrl = process.env.DATABASE_READ_URL;
  if (readDbUrl) {
    config.connections.read = {
      url: readDbUrl,
      authToken: process.env.DATABASE_READ_AUTH_TOKEN,
      provider: (process.env.DATABASE_READ_PROVIDER as any) || 'sqlite',
    };
  }

  const writeDbUrl = process.env.DATABASE_WRITE_URL;
  if (writeDbUrl) {
    config.connections.write = {
      url: writeDbUrl,
      authToken: process.env.DATABASE_WRITE_AUTH_TOKEN,
      provider: (process.env.DATABASE_WRITE_PROVIDER as any) || 'sqlite',
    };
  }

  const analyticsDbUrl = process.env.DATABASE_ANALYTICS_URL;
  if (analyticsDbUrl) {
    config.connections.analytics = {
      url: analyticsDbUrl,
      authToken: process.env.DATABASE_ANALYTICS_AUTH_TOKEN,
      provider: (process.env.DATABASE_ANALYTICS_PROVIDER as any) || 'sqlite',
    };
  }

  const customConnections = process.env.DATABASE_CUSTOM_CONNECTIONS;
  if (customConnections) {
    try {
      const parsed = JSON.parse(customConnections);
      Object.assign(config.connections, parsed);
    } catch (error) {
      console.error('[Database Config] 解析自定义数据库连接配置失败:', error);
    }
  }

  return config;
}

export function loadDatabaseConfig(): MultiDatabaseConfig {
  return getDatabaseConfig();
}

export function getSingleDatabaseConfig(): { url: string; authToken?: string } {
  const config = getDatabaseConfig();
  const defaultConfig = config.connections.default;
  
  return {
    url: defaultConfig.url,
    authToken: defaultConfig.authToken,
  };
}
