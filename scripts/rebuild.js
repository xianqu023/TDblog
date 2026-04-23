#!/usr/bin/env node
/**
 * 清理所有构建文件并重新构建服务器运行包
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

console.log(`${colors.red}${colors.bold}`);
console.log('┌─────────────────────────────────────────────────────────┐');
console.log('       🧹 清理构建文件并重新构建服务器运行包               │');
console.log('└─────────────────────────────────────────────────────────┘');
console.log(`${colors.reset}`);

const projectRoot = process.cwd();

/**
 * 清理目录
 */
function cleanDirectory(dirPath, pattern) {
  const fullPath = path.join(projectRoot, dirPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ${colors.yellow}⚠️  清理：${dirPath}${colors.reset}`);
    execSync(`rm -rf "${fullPath}"`, { stdio: 'pipe' });
  }
}

/**
 * 清理所有构建产物
 */
function cleanAll() {
  console.log(`${colors.cyan}📦 步骤 1/6: 清理所有构建产物${colors.reset}`);
  
  // 清理构建目录
  cleanDirectory('build', '');
  cleanDirectory('.next', '');
  cleanDirectory('dist', '');
  cleanDirectory('out', '');
  
  // 清理 node_modules
  cleanDirectory('node_modules', '');
  cleanDirectory('apps/web/node_modules', '');
  cleanDirectory('packages/database/node_modules', '');
  
  // 清理缓存
  cleanDirectory('.turbo', '');
  cleanDirectory('.cache', '');
  
  // 清理日志
  cleanDirectory('logs', '');
  
  // 清理临时文件
  cleanDirectory('.env', '');
  cleanDirectory('uploads', '');
  
  console.log(`  ${colors.green}✓${colors.reset} 清理完成`);
}

/**
 * 清理数据库
 */
function cleanDatabase() {
  console.log(`\n${colors.cyan}📊 步骤 2/6: 清理数据库${colors.reset}`);
  
  const dbPath = path.join(projectRoot, 'packages', 'database', 'prisma', 'blog.db');
  const dbJournalPath = path.join(projectRoot, 'packages', 'database', 'prisma', 'migration_lock.toml');
  
  if (fs.existsSync(dbPath)) {
    console.log(`  ${colors.yellow}⚠️  删除数据库文件：blog.db${colors.reset}`);
    fs.unlinkSync(dbPath);
  }
  
  if (fs.existsSync(dbJournalPath)) {
    console.log(`  ${colors.yellow}⚠️  删除迁移锁文件${colors.reset}`);
    fs.unlinkSync(dbJournalPath);
  }
  
  console.log(`  ${colors.green}✓${colors.reset} 数据库清理完成`);
}

/**
 * 安装依赖
 */
function installDependencies() {
  console.log(`\n${colors.cyan}📦 步骤 3/6: 安装依赖${colors.reset}`);
  
  try {
    execSync('pnpm install', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log(`  ${colors.green}✓${colors.reset} 依赖安装完成`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} 依赖安装失败`);
    throw error;
  }
}

/**
 * 生成 Prisma Client
 */
function generatePrismaClient() {
  console.log(`\n${colors.cyan}🗄️  步骤 4/6: 生成 Prisma Client${colors.reset}`);
  
  const dbDir = path.join(projectRoot, 'packages', 'database');
  
  try {
    execSync('pnpm exec prisma generate', {
      cwd: dbDir,
      stdio: 'inherit'
    });
    console.log(`  ${colors.green}✓${colors.reset} Prisma Client 生成完成`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} Prisma Client 生成失败`);
    throw error;
  }
}

/**
 * 初始化数据库
 */
function initDatabase() {
  console.log(`\n${colors.cyan}📊 步骤 5/6: 初始化数据库${colors.reset}`);
  
  const dbDir = path.join(projectRoot, 'packages', 'database');
  
  try {
    // 执行迁移
    execSync('pnpm exec prisma migrate deploy', {
      cwd: dbDir,
      stdio: 'inherit'
    });
    console.log(`  ${colors.green}✓${colors.reset} 数据库迁移完成`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} 数据库迁移失败`);
    throw error;
  }
}

/**
 * 构建应用
 */
function buildApp() {
  console.log(`\n${colors.cyan}🔨 步骤 6/6: 构建应用${colors.reset}`);
  
  try {
    execSync('pnpm build', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log(`  ${colors.green}✓${colors.reset} 应用构建完成`);
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} 应用构建失败`);
    throw error;
  }
}

/**
 * 创建部署包
 */
function createDeployPackage() {
  console.log(`\n${colors.cyan}📦 创建部署包${colors.reset}`);
  
  const buildDir = path.join(projectRoot, 'build');
  const deployDir = path.join(buildDir, 'deploy');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const deployPackage = path.join(buildDir, `blog-platform-${timestamp}.tar.gz`);
  
  // 创建部署目录
  fs.mkdirSync(deployDir, { recursive: true });
  
  // 复制必要文件
  const filesToCopy = [
    { src: 'apps/web/.next', dest: 'apps/web/.next' },
    { src: 'apps/web/public', dest: 'apps/web/public' },
    { src: 'apps/web/package.json', dest: 'apps/web/package.json' },
    { src: 'apps/web/next.config.ts', dest: 'apps/web/next.config.ts' },
    { src: 'packages/database/package.json', dest: 'packages/database/package.json' },
    { src: 'packages/database/prisma/schema.prisma', dest: 'packages/database/prisma/schema.prisma' },
    { src: 'package.json', dest: 'package.json' },
    { src: 'pnpm-lock.yaml', dest: 'pnpm-lock.yaml' },
    { src: 'pnpm-workspace.yaml', dest: 'pnpm-workspace.yaml' },
    { src: 'turbo.json', dest: 'turbo.json' },
    { src: 'conf.ini', dest: 'conf.ini' },
    { src: 'scripts/config-loader.js', dest: 'scripts/config-loader.js' },
    { src: 'scripts/start-prod.js', dest: 'scripts/start-prod.js' },
    { src: 'ecosystem.config.js', dest: 'ecosystem.config.js' },
  ];
  
  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = path.join(projectRoot, src);
    const destPath = path.join(deployDir, dest);
    
    if (fs.existsSync(srcPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.cpSync(srcPath, destPath, { recursive: true });
      console.log(`  ${colors.green}✓${colors.reset} 复制：${dest}`);
    }
  });
  
  // 创建 uploads 目录
  fs.mkdirSync(path.join(deployDir, 'uploads'), { recursive: true });
  fs.mkdirSync(path.join(deployDir, 'logs'), { recursive: true });
  
  // 压缩部署包
  console.log(`  ${colors.cyan}📦 压缩部署包...${colors.reset}`);
  execSync(`tar -czf "${deployPackage}" -C "${buildDir}" deploy/`, {
    cwd: projectRoot,
    stdio: 'pipe'
  });
  
  // 显示结果
  const packageSize = execSync(`du -sh "${deployPackage}"`, { encoding: 'utf-8' }).split('\t')[0];
  
  console.log(`\n${colors.green}${colors.bold}✅ 部署包创建成功！${colors.reset}`);
  console.log(`  📦 部署包位置：${deployPackage}`);
  console.log(`  📊 部署包大小：${packageSize}`);
  console.log(`  📁 部署目录：${deployDir}`);
}

/**
 * 主函数
 */
function main() {
  try {
    const startTime = Date.now();
    
    // 清理
    cleanAll();
    cleanDatabase();
    
    // 重新构建
    installDependencies();
    generatePrismaClient();
    initDatabase();
    buildApp();
    
    // 创建部署包
    createDeployPackage();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
    
    console.log(`\n${colors.green}${colors.bold}`);
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log(`       ✅ 构建完成！总耗时：${duration.padStart(6, ' ')} 分钟          │`);
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log(`${colors.reset}`);
    
    console.log(`\n${colors.cyan}📋 下一步:${colors.reset}`);
    console.log(`  1. 检查部署包：ls -lh build/*.tar.gz`);
    console.log(`  2. 测试部署包：tar -tzf build/blog-platform-*.tar.gz`);
    console.log(`  3. 部署到服务器：scp build/blog-platform-*.tar.gz user@server:/path/`);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bold}❌ 构建失败:${colors.reset} ${error.message}`);
    console.error(`\n${colors.yellow}请检查:${colors.reset}`);
    console.error(`  1. Node.js 版本 >= 18.0.0`);
    console.error(`  2. pnpm 是否正确安装`);
    console.error(`  3. 网络连接是否正常`);
    console.error(`  4. 磁盘空间是否充足`);
    process.exit(1);
  }
}

// 运行主函数
main();
