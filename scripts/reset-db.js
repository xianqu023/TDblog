#!/usr/bin/env node
/**
 * 数据库重置和种子脚本
 * 重置数据库并重新初始化所有数据
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 开始重置数据库...\n');

const projectRoot = process.cwd();
const dbDir = path.join(projectRoot, 'packages', 'database');

try {
  // 1. 删除数据库文件
  console.log('📊 步骤 1/4: 删除旧数据库...');
  const dbPath = path.join(dbDir, 'prisma', 'blog.db');
  const dbJournalPath = path.join(dbDir, 'prisma', 'migration_lock.toml');
  
  try {
    require('fs').unlinkSync(dbPath);
    console.log('  ✓ 删除 blog.db');
  } catch (e) {
    console.log('  - blog.db 不存在');
  }
  
  try {
    require('fs').unlinkSync(dbJournalPath);
    console.log('  ✓ 删除 migration_lock.toml');
  } catch (e) {
    console.log('  - migration_lock.toml 不存在');
  }

  // 2. 重新执行迁移
  console.log('\n📊 步骤 2/4: 执行数据库迁移...');
  execSync('pnpm exec prisma migrate deploy', {
    cwd: dbDir,
    stdio: 'inherit'
  });
  console.log('  ✓ 数据库迁移完成');

  // 3. 生成 Prisma Client
  console.log('\n📊 步骤 3/4: 生成 Prisma Client...');
  execSync('pnpm exec prisma generate', {
    cwd: dbDir,
    stdio: 'inherit'
  });
  console.log('  ✓ Prisma Client 生成完成');

  // 4. 运行种子脚本
  console.log('\n📊 步骤 4/4: 初始化种子数据...');
  execSync('pnpm exec prisma db seed', {
    cwd: dbDir,
    stdio: 'inherit'
  });
  console.log('  ✓ 种子数据初始化完成');

  console.log('\n✅ 数据库重置完成！\n');
  console.log('📋 下一步:');
  console.log('  1. 访问 http://localhost:3000/zh 查看网站');
  console.log('  2. 检查主题是否正常显示');
  console.log('  3. 如有问题，请查看控制台日志');

} catch (error) {
  console.error('\n❌ 数据库重置失败:', error.message);
  process.exit(1);
}
