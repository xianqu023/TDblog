#!/usr/bin/env node
/**
 * 生产环境启动脚本
 * 自动加载 conf.ini 配置并启动服务
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

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

console.log(`${colors.green}${colors.bold}`);
console.log('┌─────────────────────────────────────────────────────────┐');
console.log('       🚀 Blog Platform - 生产环境启动                     │');
console.log('└─────────────────────────────────────────────────────────┘');
console.log(`${colors.reset}`);

const projectRoot = process.cwd();

/**
 * 检查并安装依赖
 */
function checkDependencies() {
  console.log(`${colors.cyan}📦 检查依赖...${colors.reset}`);
  
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`  ${colors.yellow}⚠️  依赖未安装，开始安装...${colors.reset}`);
    execSync('pnpm install --prod', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } else {
    console.log(`  ${colors.green}✓${colors.reset} 依赖已安装`);
  }
}

/**
 * 加载配置
 */
function loadConfig() {
  console.log(`\n${colors.cyan}⚙️  加载配置...${colors.reset}`);
  
  const configLoaderPath = path.join(projectRoot, 'scripts', 'config-loader.js');
  if (fs.existsSync(configLoaderPath)) {
    const loader = require(configLoaderPath);
    return loader.loadAndApplyConfig();
  } else {
    console.log(`  ${colors.yellow}⚠️  配置加载器不存在，使用环境变量${colors.reset}`);
    return null;
  }
}

/**
 * 初始化数据库
 */
function initDatabase(dbType) {
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
    
    console.log(`  ${colors.green}✓${colors.reset} 数据库就绪 (${dbType})`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} 数据库初始化失败`);
    throw error;
  }
}

/**
 * 构建应用（如果需要）
 */
function buildApp() {
  console.log(`\n${colors.cyan}🔨 检查构建...${colors.reset}`);
  
  const nextDir = path.join(projectRoot, 'apps', 'web', '.next');
  if (!fs.existsSync(nextDir)) {
    console.log(`  ${colors.yellow}⚠️  应用未构建，开始构建...${colors.reset}`);
    execSync('pnpm build', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } else {
    console.log(`  ${colors.green}✓${colors.reset} 应用已构建`);
  }
}

/**
 * 启动应用
 */
function startApp(config) {
  console.log(`\n${colors.cyan}🚀 启动应用...${colors.reset}`);
  
  const port = process.env.PORT || (config?.server?.port) || '3000';
  const host = process.env.HOST || (config?.server?.host) || '0.0.0.0';
  
  console.log(`  ${colors.green}✓${colors.reset} 监听地址：http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  console.log(`  ${colors.green}✓${colors.reset} 环境：${process.env.NODE_ENV || 'production'}`);
  
  const webDir = path.join(projectRoot, 'apps', 'web');
  
  // 启动 Next.js 服务器
  const server = spawn('pnpm', ['start'], {
    cwd: webDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
      HOST: host,
    }
  });
  
  server.on('error', (error) => {
    console.error(`${colors.red}❌ 服务器启动失败:${colors.reset} ${error.message}`);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${colors.red}❌ 服务器异常退出:${colors.reset} ${code}`);
      process.exit(code);
    }
  });
}

/**
 * 主函数
 */
function main() {
  try {
    // 检查依赖
    checkDependencies();
    
    // 加载配置
    const { config, dbType } = loadConfig() || { config: null, dbType: 'sqlite' };
    
    // 初始化数据库
    initDatabase(dbType);
    
    // 构建应用
    buildApp();
    
    // 启动应用
    startApp(config);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}❌ 启动失败:${colors.reset} ${error.message}`);
    console.error(`\n${colors.yellow}请检查:${colors.reset}`);
    console.error(`  1. conf.ini 配置文件是否正确`);
    console.error(`  2. 数据库连接是否正常`);
    console.error(`  3. 端口是否被占用`);
    process.exit(1);
  }
}

// 运行主函数
main();
