import { resolve, join } from 'node:path';
import * as fs from 'node:fs';

/**
 * 数据库路径管理工具
 * 解决构建和部署时数据库路径不一致的问题
 */

export interface DatabasePathOptions {
  /** 项目根目录 */
  projectRoot?: string;
  /** 数据库目录 */
  databaseDir?: string;
  /** 数据库文件名 */
  databaseFile?: string;
  /** 是否使用绝对路径 */
  useAbsolutePath?: boolean;
}

/**
 * 查找项目根目录
 * 通过查找 package.json 或特定目录来确定项目根目录
 */
function findProjectRoot(): string {
  // 1. 优先使用环境变量
  if (process.env.PROJECT_ROOT) {
    console.log('[DB Path] 使用环境变量 PROJECT_ROOT:', process.env.PROJECT_ROOT);
    return process.env.PROJECT_ROOT;
  }

  // 2. 使用 process.execPath 或 module 信息推断
  try {
    // 在 Next.js 构建环境中，使用 process.cwd() 的父目录
    const cwd = process.cwd();
    
    // 如果在 apps/web 目录，返回其父目录
    if (cwd.endsWith('apps/web') || cwd.includes('apps/web')) {
      const parts = cwd.split('/');
      const appsIndex = parts.findIndex(p => p === 'apps');
      if (appsIndex > 0) {
        const projectRoot = parts.slice(0, appsIndex).join('/');
        if (projectRoot) {
          console.log('[DB Path] 从当前工作目录推断项目根目录:', projectRoot);
          return projectRoot;
        }
      }
    }
  } catch {
    // 忽略错误
  }

  // 3. 从 __dirname 向上查找（适用于打包后的环境）
  const currentDir = __dirname;
  let current = currentDir;
  
  // 记录已检查的路径，避免死循环
  const checkedPaths = new Set<string>();
  
  // 向上查找，直到找到包含 packages/database 的目录或找到 package.json
  while (current !== resolve(current, '..') && !checkedPaths.has(current)) {
    checkedPaths.add(current);
    
    // 跳过系统目录
    if (current === '/' || current === '/ROOT' || current === '/root' || current.length <= 4) {
      break;
    }
    
    // 检查是否在 .next/standalone 目录
    if (current.includes('.next/standalone')) {
      const parts = current.split('/');
      const standaloneIndex = parts.findIndex(p => p === '.next');
      if (standaloneIndex > 0) {
        const projectRoot = parts.slice(0, standaloneIndex).join('/');
        if (projectRoot && projectRoot !== '/') {
          console.log('[DB Path] 检测到 standalone 模式:', projectRoot);
          return projectRoot;
        }
      }
    }
    
    // 检查是否包含 packages/database
    if (current.includes('packages/database')) {
      const parts = current.split('/');
      const packagesIndex = parts.findIndex(p => p === 'packages');
      if (packagesIndex > 0) {
        const projectRoot = parts.slice(0, packagesIndex).join('/');
        if (projectRoot && projectRoot !== '/') {
          console.log('[DB Path] 从 packages/database 推断项目根目录:', projectRoot);
          return projectRoot;
        }
      }
    }
    
    // 检查是否有 package.json
    try {
      const packagePath = join(current, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        // 检查是否是项目根目录的 package.json
        if (pkg.name === 'blog' || (pkg.private === true && pkg.workspaces)) {
          console.log('[DB Path] 从 package.json 找到项目根目录:', current);
          return current;
        }
      }
    } catch {
      // 忽略错误，继续向上查找
    }
    
    current = resolve(current, '..');
  }

  // 4. 回退到当前工作目录
  console.log('[DB Path] 回退到当前工作目录:', process.cwd());
  return process.cwd();
}

/**
 * 获取数据库文件路径
 * 
 * @param options - 配置选项
 * @returns 数据库文件路径（带 file: 前缀）
 * 
 * @example
 * // 开发环境
 * getDatabasePath() // => "file:/absolute/path/to/packages/database/prisma/blog.db"
 * 
 * @example
 * // 生产环境（使用环境变量）
 * process.env.DATABASE_URL = "file:/data/blog.db"
 * getDatabasePath() // => "file:/data/blog.db"
 */
export function getDatabasePath(options: DatabasePathOptions = {}): string {
  // 1. 优先使用环境变量（生产环境）
  if (process.env.DATABASE_URL) {
    console.log('[DB Path] 使用环境变量 DATABASE_URL');
    return process.env.DATABASE_URL;
  }

  const {
    databaseDir = 'packages/database/prisma',
    databaseFile = 'blog.db',
    useAbsolutePath = true,
  } = options;

  // 查找项目根目录
  const projectRoot = findProjectRoot();
  console.log('[DB Path] 项目根目录:', projectRoot);

  let dbPath: string;

  // 2. 检查是否在 standalone 输出目录
  const standalonePath = process.cwd();
  if (standalonePath.includes('.next/standalone')) {
    // 生产环境 standalone 模式
    dbPath = resolve(standalonePath, '..', 'database', 'prisma', databaseFile);
    console.log('[DB Path] 检测到 standalone 模式:', dbPath);
  } 
  // 3. 检查是否在 dist-binary 目录
  else if (standalonePath.includes('dist-binary')) {
    dbPath = resolve(standalonePath, 'packages', 'database', 'prisma', databaseFile);
    console.log('[DB Path] 检测到 dist-binary 模式:', dbPath);
  }
  // 4. 开发环境或常规部署
  else {
    if (useAbsolutePath) {
      dbPath = resolve(projectRoot, databaseDir, databaseFile);
    } else {
      dbPath = join(databaseDir, databaseFile);
    }
    console.log('[DB Path] 使用默认路径:', dbPath);
  }

  // 确保路径以 file: 开头（SQLite 需要）
  if (!dbPath.startsWith('file:') && !dbPath.startsWith('http:') && !dbPath.startsWith('https:') && !dbPath.startsWith('libsql:')) {
    dbPath = `file:${dbPath}`;
  }

  return dbPath;
}

/**
 * 获取数据库目录路径
 */
export function getDatabaseDirectory(options: DatabasePathOptions = {}): string {
  const {
    projectRoot = process.env.PROJECT_ROOT || process.cwd(),
    databaseDir = 'packages/database/prisma',
    useAbsolutePath = true,
  } = options;

  if (useAbsolutePath) {
    return resolve(projectRoot, databaseDir);
  }
  return join(databaseDir);
}

/**
 * 确保数据库目录存在
 * 构建时跳过，运行时必须创建
 */
export async function ensureDatabaseDirectory(dbPath: string): Promise<void> {
  // 构建时跳过目录创建
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('[DB Path] 构建阶段，跳过目录创建');
    return;
  }

  // 检查是否是系统目录，避免权限错误
  const cleanPath = dbPath.replace('file:', '');
  const { dirname } = require('node:path');
  const dbDir = dirname(cleanPath);
  
  // 禁止在系统目录创建
  const systemDirs = ['/', '/ROOT', '/root', '/System', '/usr', '/bin', '/sbin'];
  if (systemDirs.some(dir => dbDir === dir || dbDir.startsWith(dir + '/'))) {
    console.error('[DB Path] 错误：检测到系统目录，无法创建数据库:', dbDir);
    console.error('[DB Path] 请设置正确的 PROJECT_ROOT 环境变量');
    console.error('[DB Path] 例如：export PROJECT_ROOT=/var/www/blog');
    throw new Error(`无法在系统目录创建数据库：${dbDir}`);
  }

  const fs = require('node:fs').promises;
  
  try {
    await fs.mkdir(dbDir, { recursive: true });
    console.log('[DB Path] ✅ 数据库目录已确保存在:', dbDir);
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('[DB Path] ❌ 创建数据库目录失败:', error.message);
      console.error('[DB Path] 请手动执行以下命令:');
      console.error(`[DB Path]   mkdir -p ${dbDir}`);
      console.error(`[DB Path]   chmod 755 ${dbDir}`);
      throw error;
    }
  }
}

/**
 * 检测当前运行环境
 */
export function detectEnvironment(): 'development' | 'production-standalone' | 'production-binary' | 'production' {
  const cwd = process.cwd();
  
  if (cwd.includes('.next/standalone')) {
    return 'production-standalone';
  }
  
  if (cwd.includes('dist-binary')) {
    return 'production-binary';
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  return 'development';
}

/**
 * 获取数据库路径信息（用于调试）
 */
export function getDatabasePathInfo(): {
  environment: string;
  cwd: string;
  databaseUrl: string;
  hasEnvVar: boolean;
} {
  const env = detectEnvironment();
  const dbUrl = getDatabasePath();
  
  return {
    environment: env,
    cwd: process.cwd(),
    databaseUrl: dbUrl,
    hasEnvVar: !!process.env.DATABASE_URL,
  };
}

// 导出兼容旧版的函数
export function getDatabaseUrl(): string {
  return getDatabasePath();
}
