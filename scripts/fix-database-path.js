#!/usr/bin/env node
/**
 * 数据库路径修复脚本
 * 
 * 用于在部署时自动修复数据库路径问题
 * - 确保数据库目录存在
 * - 验证数据库连接
 * - 执行数据库迁移
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

console.log(`${colors.blue}${colors.bold}`);
console.log('┌─────────────────────────────────────────────────────────┐');
console.log('       🔧 数据库路径修复工具                              │');
console.log('└─────────────────────────────────────────────────────────┘');
console.log(`${colors.reset}`);

// 获取项目根目录
const projectRoot = process.env.PROJECT_ROOT || process.cwd();
console.log(`${colors.cyan}项目根目录:${colors.reset} ${projectRoot}`);

// 解析 INI 配置
function parseIni(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const config = {};
  let currentSection = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      config[currentSection] = {};
      continue;
    }
    if (currentSection && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      config[currentSection][key.trim()] = valueParts.join('=').trim();
    }
  }
  return config;
}

// 转换为绝对路径
function toAbsolutePath(pathValue) {
  if (!pathValue) return pathValue;
  
  if (path.isAbsolute(pathValue) || 
      pathValue.startsWith('http://') || 
      pathValue.startsWith('https://') ||
      pathValue.startsWith('libsql://') ||
      pathValue.startsWith('postgresql://') ||
      pathValue.startsWith('postgres://') ||
      pathValue.startsWith('mysql://')) {
    return pathValue;
  }
  
  const isFileProtocol = pathValue.startsWith('file:');
  const cleanPath = isFileProtocol ? pathValue.substring(5) : pathValue;
  
  if (!path.isAbsolute(cleanPath)) {
    const absolutePath = path.resolve(projectRoot, cleanPath);
    return isFileProtocol ? `file:${absolutePath}` : absolutePath;
  }
  
  return pathValue;
}

// 加载配置
const configPath = path.join(projectRoot, 'conf.ini');
let dbUrl = 'file:./packages/database/prisma/blog.db';

if (fs.existsSync(configPath)) {
  console.log(`${colors.green}✓${colors.reset} 读取配置文件：${configPath}`);
  const config = parseIni(configPath);
  dbUrl = config.database?.url || dbUrl;
} else if (process.env.DATABASE_URL) {
  dbUrl = process.env.DATABASE_URL;
  console.log(`${colors.green}✓${colors.reset} 使用环境变量 DATABASE_URL`);
} else {
  console.log(`${colors.yellow}⚠️  未找到配置文件，使用默认路径${colors.reset}`);
}

// 转换为绝对路径
dbUrl = toAbsolutePath(dbUrl);
console.log(`${colors.cyan}数据库 URL:${colors.reset} ${dbUrl}`);

// 检查是否为本地 SQLite 数据库
const isLocalSqlite = dbUrl.startsWith('file:') && 
                      !dbUrl.startsWith('file:http://') &&
                      !dbUrl.startsWith('file:https://');

if (isLocalSqlite) {
  const dbPath = dbUrl.replace('file:', '');
  const dbDir = path.dirname(dbPath);
  
  console.log(`\n${colors.cyan}📂 检查数据库目录...${colors.reset}`);
  console.log(`  数据库文件：${dbPath}`);
  console.log(`  数据库目录：${dbDir}`);
  
  // 确保目录存在
  if (!fs.existsSync(dbDir)) {
    console.log(`  ${colors.yellow}⚠️  目录不存在，创建中...${colors.reset}`);
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`  ${colors.green}✓${colors.reset} 目录创建成功`);
    } catch (error) {
      console.error(`  ${colors.red}✗${colors.reset} 目录创建失败：${error.message}`);
      process.exit(1);
    }
  } else {
    console.log(`  ${colors.green}✓${colors.reset} 目录已存在`);
  }
  
  // 检查目录写权限
  try {
    fs.accessSync(dbDir, fs.constants.W_OK);
    console.log(`  ${colors.green}✓${colors.reset} 目录可写`);
  } catch (error) {
    console.log(`  ${colors.yellow}⚠️  目录不可写，尝试修复权限...${colors.reset}`);
    try {
      fs.chmodSync(dbDir, 0o755);
      console.log(`  ${colors.green}✓${colors.reset} 权限已修复`);
    } catch (chmodError) {
      console.error(`  ${colors.red}✗${colors.reset} 权限修复失败：${chmodError.message}`);
      console.error(`  ${colors.red}请手动执行：chmod 755 ${dbDir}${colors.reset}`);
    }
  }
} else {
  console.log(`\n${colors.cyan}🌐 检测到远程数据库，跳过目录检查${colors.reset}`);
}

// 初始化数据库
console.log(`\n${colors.cyan}📊 初始化数据库...${colors.reset}`);

const dbDir = path.join(projectRoot, 'packages', 'database');

try {
  // 生成 Prisma Client
  console.log(`  ${colors.cyan}步骤 1/3${colors.reset} 生成 Prisma Client...`);
  execSync('pnpm exec prisma generate', {
    cwd: dbDir,
    stdio: 'inherit'
  });
  console.log(`  ${colors.green}✓${colors.reset} Prisma Client 生成成功`);
  
  // 执行数据库迁移
  console.log(`  ${colors.cyan}步骤 2/3${colors.reset} 执行数据库迁移...`);
  execSync('pnpm exec prisma migrate deploy', {
    cwd: dbDir,
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'inherit'
  });
  console.log(`  ${colors.green}✓${colors.reset} 数据库迁移完成`);
  
  // 验证连接
  console.log(`  ${colors.cyan}步骤 3/3${colors.reset} 验证数据库连接...`);
  execSync('node -e "const {prisma} = require(\'./src/index.ts\'); prisma.$queryRaw`SELECT 1`.then(() => { console.log(\'OK\'); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); })"', {
    cwd: dbDir,
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'pipe'
  });
  console.log(`  ${colors.green}✓${colors.reset} 数据库连接验证成功`);
  
  console.log(`\n${colors.green}${colors.bold}✅ 数据库路径修复完成！${colors.reset}`);
  console.log(`\n${colors.cyan}下一步:${colors.reset}`);
  console.log(`  1. 启动服务：pnpm start 或 pm2 start ecosystem.config.js`);
  console.log(`  2. 访问：http://localhost:3000`);
  console.log(`  3. 注册管理员账号`);
  
} catch (error) {
  console.error(`\n${colors.red}${colors.bold}❌ 数据库初始化失败${colors.reset}`);
  console.error(`错误信息：${error.message}`);
  console.error(`\n${colors.cyan}建议:${colors.reset}`);
  console.error(`  1. 检查 DATABASE_URL 配置是否正确`);
  console.error(`  2. 确保数据库目录有写权限`);
  console.error(`  3. 检查数据库服务是否运行（如使用 PostgreSQL/MySQL）`);
  process.exit(1);
}
