import {
  initializeMultiDatabase,
  loadDatabaseConfig,
  disconnectAllDatabases,
  getDatabase,
} from '@blog/database';

let initialized = false;

export function setupDatabase(): void {
  if (initialized) {
    console.log('[Database] 数据库已初始化，跳过');
    return;
  }

  try {
    const config = loadDatabaseConfig();
    initializeMultiDatabase(config);
    initialized = true;
    console.log('✅ 数据库连接管理器初始化成功');
    console.log(`   可用连接：${config.defaultConnection || 'default'}`);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

export async function cleanupDatabase(): Promise<void> {
  if (!initialized) {
    return;
  }

  try {
    await disconnectAllDatabases();
    initialized = false;
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
}

export { getDatabase };
