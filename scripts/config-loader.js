#!/usr/bin/env node
/**
 * 配置加载器 - 从 conf.ini 自动加载所有环境变量
 * 自动识别数据库类型并初始化
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色定义
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
console.log('       🔧 配置加载器 - 自动识别和初始化环境配置            │');
console.log('└─────────────────────────────────────────────────────────┘');
console.log(`${colors.reset}`);

/**
 * 解析 INI 配置文件
 */
function parseIni(filePath) {
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

/**
 * 生成随机字符串
 */
function generateRandomString(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
}

/**
 * 检测数据库类型
 */
function detectDatabaseType(dbConfig) {
  const provider = dbConfig.provider || 'sqlite';
  const url = dbConfig.url || '';

  // 从 URL 推断数据库类型
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql';
  } else if (url.startsWith('mysql://')) {
    return 'mysql';
  } else if (url.startsWith('file:') || url.endsWith('.db') || url.endsWith('.sqlite')) {
    return 'sqlite';
  }

  return provider;
}

/**
 * 初始化数据库
 */
function initializeDatabase(dbType, projectRoot) {
  console.log(`\n${colors.cyan}📊 初始化数据库...${colors.reset}`);
  
  const dbDir = path.join(projectRoot, 'packages', 'database');
  
  try {
    // 生成 Prisma Client
    console.log(`  ${colors.green}✓${colors.reset} 生成 Prisma Client...`);
    execSync('pnpm exec prisma generate', {
      cwd: dbDir,
      stdio: 'pipe'
    });
    
    // 执行数据库迁移
    console.log(`  ${colors.green}✓${colors.reset} 执行数据库迁移...`);
    execSync('pnpm exec prisma migrate deploy', {
      cwd: dbDir,
      stdio: 'pipe'
    });
    
    // 如果是 SQLite，确保目录存在
    if (dbType === 'sqlite') {
      const dbPath = path.join(dbDir, 'prisma', 'blog.db');
      const dbDirPath = path.dirname(dbPath);
      if (!fs.existsSync(dbDirPath)) {
        fs.mkdirSync(dbDirPath, { recursive: true });
      }
    }
    
    console.log(`  ${colors.green}✓${colors.reset} 数据库初始化完成`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} 数据库初始化失败: ${error.message}`);
    throw error;
  }
}

/**
 * 加载配置并设置环境变量
 */
function loadAndApplyConfig() {
  const projectRoot = process.env.PROJECT_ROOT || process.cwd();
  const configPath = path.join(projectRoot, 'conf.ini');
  
  // 检查配置文件是否存在
  if (!fs.existsSync(configPath)) {
    console.log(`${colors.yellow}⚠️  警告：conf.ini 文件不存在，使用默认配置${colors.reset}`);
    return {};
  }
  
  console.log(`${colors.green}✓${colors.reset} 读取配置文件：${configPath}`);
  
  // 解析配置
  const config = parseIni(configPath);
  
  // 提取各部分配置
  const dbConfig = config.database || {};
  const serverConfig = config.server || {};
  const authConfig = config.auth || {};
  const siteConfig = config.site || {};
  const storageConfig = config.storage || {};
  const aiConfig = config.ai || {};
  const cdnConfig = config.cdn || {};
  const uploadConfig = config.upload || {};
  
  // 检测数据库类型
  const dbType = detectDatabaseType(dbConfig);
  console.log(`${colors.green}✓${colors.reset} 数据库类型：${colors.cyan}${dbType}${colors.reset}`);
  
  // 构建环境变量对象
  const envVars = {};
  
  // 数据库配置
  envVars.DATABASE_URL = dbConfig.url || (dbType === 'sqlite' ? 'file:./packages/database/prisma/blog.db' : '');
  
  // 认证配置
  envVars.AUTH_SECRET = authConfig.secret || generateRandomString();
  envVars.NEXTAUTH_SECRET = authConfig.secret || envVars.AUTH_SECRET;
  envVars.NEXTAUTH_URL = authConfig.url || `http://localhost:${serverConfig.port || '3000'}`;
  
  // 网站配置
  envVars.NEXT_PUBLIC_SITE_URL = siteConfig.url || `http://localhost:${serverConfig.port || '3000'}`;
  envVars.NEXT_PUBLIC_SITE_NAME = siteConfig.name || 'My Blog';
  
  // 服务器配置
  envVars.PORT = serverConfig.port || '3000';
  envVars.HOST = serverConfig.host || '0.0.0.0';
  envVars.NODE_ENV = serverConfig.node_env || 'production';
  
  // 存储配置
  envVars.STORAGE_DRIVER = storageConfig.driver || 'local';
  envVars.STORAGE_LOCAL_PATH = storageConfig.local_path || './uploads';
  envVars.STORAGE_LOCAL_URL = storageConfig.local_url || '/uploads';
  envVars.STORAGE_LOCAL_SERVE_STATIC = storageConfig.serve_static || 'true';
  
  // AI 配置
  if (aiConfig.api_key) envVars.OPENAI_API_KEY = aiConfig.api_key;
  if (aiConfig.base_url) envVars.OPENAI_BASE_URL = aiConfig.base_url;
  if (aiConfig.model) envVars.AI_MODEL = aiConfig.model;
  
  // CDN 配置
  if (cdnConfig.enabled) envVars.NEXT_PUBLIC_CDN_ENABLED = cdnConfig.enabled;
  if (cdnConfig.provider) envVars.NEXT_PUBLIC_CDN_PROVIDER = cdnConfig.provider;
  if (cdnConfig.base_url) envVars.NEXT_PUBLIC_CDN_BASE_URL = cdnConfig.base_url;
  
  // 上传配置
  if (uploadConfig.max_size) envVars.UPLOAD_MAX_FILE_SIZE = uploadConfig.max_size;
  if (uploadConfig.organize_by_date) envVars.UPLOAD_ORGANIZE_BY_DATE = uploadConfig.organize_by_date;
  if (uploadConfig.unique_filename) envVars.UPLOAD_UNIQUE_FILENAME = uploadConfig.unique_filename;
  
  // 支付配置（如果存在）
  if (config.stripe) {
    if (config.stripe.secret_key) envVars.STRIPE_SECRET_KEY = config.stripe.secret_key;
    if (config.stripe.webhook_secret) envVars.STRIPE_WEBHOOK_SECRET = config.stripe.webhook_secret;
    if (config.stripe.publishable_key) envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = config.stripe.publishable_key;
  }
  
  if (config.paypal) {
    if (config.paypal.client_id) envVars.PAYPAL_CLIENT_ID = config.paypal.client_id;
    if (config.paypal.client_secret) envVars.PAYPAL_CLIENT_SECRET = config.paypal.client_secret;
  }
  
  if (config.alipay) {
    if (config.alipay.app_id) envVars.ALIPAY_APP_ID = config.alipay.app_id;
    if (config.alipay.private_key) envVars.ALIPAY_PRIVATE_KEY = config.alipay.private_key;
    if (config.alipay.public_key) envVars.ALIPAY_PUBLIC_KEY = config.alipay.public_key;
  }
  
  if (config.wechat_pay) {
    if (config.wechat_pay.app_id) envVars.WECHAT_PAY_APP_ID = config.wechat_pay.app_id;
    if (config.wechat_pay.mch_id) envVars.WECHAT_PAY_MCH_ID = config.wechat_pay.mch_id;
    if (config.wechat_pay.api_key) envVars.WECHAT_PAY_API_KEY = config.wechat_pay.api_key;
  }
  
  // 应用环境变量
  Object.keys(envVars).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = envVars[key];
    }
  });
  
  // 显示加载的配置
  console.log(`${colors.green}✓${colors.reset} 已加载配置项：`);
  console.log(`  ${colors.cyan}数据库:${colors.reset} ${dbType}`);
  console.log(`  ${colors.cyan}服务器端口:${colors.reset} ${envVars.PORT}`);
  console.log(`  ${colors.cyan}网站名称:${colors.reset} ${envVars.NEXT_PUBLIC_SITE_NAME}`);
  console.log(`  ${colors.cyan}存储驱动:${colors.reset} ${envVars.STORAGE_DRIVER}`);
  
  if (aiConfig.api_key) {
    console.log(`  ${colors.cyan}AI 服务:${colors.reset} 已配置`);
  }
  
  return { config, envVars, dbType };
}

/**
 * 创建 .env 文件
 */
function createEnvFile(envVars, projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent);
  console.log(`${colors.green}✓${colors.reset} 已生成 .env 文件`);
}

// 主函数
function main() {
  try {
    const projectRoot = process.cwd();
    
    // 加载配置
    const { config, envVars, dbType } = loadAndApplyConfig();
    
    // 初始化数据库
    initializeDatabase(dbType, projectRoot);
    
    // 创建 .env 文件
    createEnvFile(envVars, projectRoot);
    
    console.log(`\n${colors.green}${colors.bold}✅ 配置加载和初始化完成！${colors.reset}`);
    console.log(`\n${colors.cyan}下一步:${colors.reset}`);
    console.log(`  1. 检查 .env 文件，确认配置正确`);
    console.log(`  2. 运行：pnpm dev (开发环境) 或 pnpm start (生产环境)`);
    console.log(`  3. 访问：http://localhost:${envVars.PORT || '3000'}`);
    
    return { success: true, config, envVars, dbType };
  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}❌ 配置加载失败:${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
module.exports = {
  parseIni,
  detectDatabaseType,
  loadAndApplyConfig,
  initializeDatabase,
  createEnvFile,
  main,
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}
