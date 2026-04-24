#!/usr/bin/env node

/**
 * 生产环境启动脚本
 * 直接启动构建后的 Next.js standalone server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const PORT = process.env.PORT || '3000';
const NODE_ENV = process.env.NODE_ENV || 'production';
const MAX_WORKERS = process.env.MAX_WORKERS || '1';

// 设置环境变量
process.env.NODE_ENV = NODE_ENV;
process.env.PORT = PORT;

// 性能优化
if (!process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = '--max-old-space-size=4096 --optimize-for-size';
}

console.log('🚀 启动博客平台...');
console.log('   端口:', PORT);
console.log('   环境:', NODE_ENV);
console.log('   工作进程:', MAX_WORKERS);
console.log('');

// 启动 standalone server
const serverPath = path.join(__dirname, '..', 'apps', 'web', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('❌ 错误：找不到 server.js');
  console.error('   请先运行：npm run build');
  console.error('   路径:', serverPath);
  process.exit(1);
}

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ 服务器启动失败:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log('服务器已退出，代码:', code);
  process.exit(code || 0);
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务器...');
  server.kill('SIGTERM');
});
