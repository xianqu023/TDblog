#!/usr/bin/env node
/**
 * Blog Platform - 开发服务器启动脚本
 * 动态加载美化 + Emoji表情 + API状态监控
 */

const { spawn } = require('child_process');
const path = require('path');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// 清屏
process.stdout.write('\x1Bc');

// 打印启动横幅
console.log(`${colors.green}${colors.bold}`);
console.log('┌─────────────────────────────────────────────────────────┐');
console.log('       🚀 您的blog开始启动啦- 🚀 开发服务器🚀                 │');
console.log('└─────────────────────────────────────────────────────────┘');
console.log(`${colors.reset}`);

// 动态加载动画
const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

function showSpinner(text) {
  const spinner = spinners[spinnerIndex % spinners.length];
  spinnerIndex++;
  process.stdout.write(`\r${colors.cyan}${spinner}${colors.reset} ${text}`);
}

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

// 模块加载状态
const modules = [
  { name: '🗄️  数据库连接', status: 'checking', emoji: '🔍' },
  { name: '📦 Prisma Client', status: 'checking', emoji: '⚙️' },
  { name: '🌍 国际化 (i18n)', status: 'checking', emoji: '📝' },
  { name: '🔐 认证系统', status: 'checking', emoji: '🛡️' },
  { name: '🤖 AI 服务', status: 'checking', emoji: '🧠' },
  { name: '💳 支付系统', status: 'checking', emoji: '💰' },
  { name: '📁 存储系统', status: 'checking', emoji: '💾' },
  { name: '⚡ CDN 加速', status: 'checking', emoji: '🌐' },
];

console.log(`${colors.blue}${colors.bold}\n📦 正在初始化模块...${colors.reset}\n`);

// 显示模块列表
modules.forEach((mod, i) => {
  const isLast = i === modules.length - 1;
  const connector = isLast ? '└' : '├';
  console.log(`  ${colors.gray}${connector}─${colors.reset} ${mod.name} ${colors.dim}${mod.emoji}${colors.reset}`);
});

console.log(`\n${colors.gray}⏳ 等待服务器启动...${colors.reset}\n`);

// 启动 Next.js dev 服务器
const nextDev = spawn('pnpm', ['next', 'dev', '--turbo'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    PRISMA_QUERY_ENGINE_LOGGING: 'false',
  },
});

let serverReady = false;
let requestCount = 0;
let errorCount = 0;
let successCount = 0;

// API 状态跟踪
const apiStatus = {
  total: 0,
  success: 0,
  error: 0,
  lastError: null,
};

// 处理标准输出
nextDev.stdout.on('data', (data) => {
  const text = data.toString();
  
  // 服务器就绪
  if (text.includes('Ready') || text.includes('ready') || text.includes('Local:')) {
    if (!serverReady) {
      serverReady = true;
      clearLine();
      console.log(`\n${colors.green}${colors.bold}┌─────────────────────────────────────────────────────────┐${colors.reset}`);
      console.log(`${colors.green}${colors.bold}│${colors.reset}  ${colors.green}✅ 服务器启动成功！${colors.reset}                          ${colors.green}${colors.bold}│${colors.reset}`);
      console.log(`${colors.green}${colors.bold}│${colors.reset}                                                 ${colors.green}${colors.bold}│${colors.reset}`);
      console.log(`${colors.green}${colors.bold}│${colors.reset}  ${colors.cyan}🌐 本地地址:${colors.reset} http://localhost:3000              ${colors.green}${colors.bold}│${colors.reset}`);
      console.log(`${colors.green}${colors.bold}│${colors.reset}  ${colors.cyan}🖥️  管理后台:${colors.reset} http://localhost:3000/zh/admin     ${colors.green}${colors.bold}│${colors.reset}`);
      console.log(`${colors.green}${colors.bold}└─────────────────────────────────────────────────────────┘${colors.reset}`);
      console.log(`\n${colors.gray}💡 提示: 按 Ctrl+C 停止服务器${colors.reset}\n`);
      console.log(`${colors.dim}──────────────── 请求监控 ────────────────${colors.reset}\n`);
    }
    return;
  }

  // 编译状态
  if (text.includes('Compiling')) {
    showSpinner(`${colors.yellow}🔨 正在编译...${colors.reset}`);
    return;
  }

  if (text.includes('Compiled successfully')) {
    clearLine();
    console.log(`${colors.green}✅ 编译完成${colors.reset}`);
    return;
  }

  if (text.includes('Compiled with warnings')) {
    clearLine();
    console.log(`${colors.yellow}⚠️  编译完成（有警告）${colors.reset}`);
    return;
  }

  if (text.includes('Failed to compile')) {
    clearLine();
    console.log(`${colors.red}❌ 编译失败${colors.reset}`);
    return;
  }

  // 页面/API 请求 - 美化显示
  const requestMatch = text.match(/(GET|POST|PUT|DELETE|PATCH)\s+(\/[^\s]+)\s+(\d{3})\s+in\s+(\d+)/);
  if (requestMatch) {
    const [_, method, urlPath, status, time] = requestMatch;
    requestCount++;
    apiStatus.total++;
    
    const statusCode = parseInt(status);
    if (statusCode >= 200 && statusCode < 400) {
      apiStatus.success++;
      successCount++;
    } else {
      apiStatus.error++;
    }
    
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' :
                        statusCode >= 300 && statusCode < 400 ? '🔄' :
                        statusCode >= 400 && statusCode < 500 ? '⚠️' : '❌';
    
    const statusColor = statusCode >= 200 && statusCode < 300 ? colors.green :
                        statusCode >= 300 && statusCode < 400 ? colors.blue :
                        statusCode >= 400 && statusCode < 500 ? colors.yellow : colors.red;
    
    const methodEmoji = method === 'GET' ? '📥' :
                        method === 'POST' ? '📤' :
                        method === 'PUT' ? '✏️' :
                        method === 'DELETE' ? '🗑️' : '📋';
    
    // 过滤内部请求
    if (!urlPath.includes('/_next/static') && !urlPath.includes('?_rsc=')) {
      const isApi = urlPath.startsWith('/api/');
      const typeLabel = isApi ? `${colors.cyan}[API]${colors.reset}` : `${colors.blue}[页面]${colors.reset}`;
      
      console.log(`  ${statusEmoji} ${methodEmoji} ${typeLabel} ${urlPath} ${statusColor}${status}${colors.reset} ${colors.dim}(${time}ms)${colors.reset}`);
    }
    return;
  }

  // Prisma 查询 - 静默
  if (text.includes('prisma:query')) {
    return;
  }

  // 错误信息 - 高亮显示
  if (text.includes('Error') || text.includes('error') || text.includes('⨯')) {
    errorCount++;
    apiStatus.error++;
    apiStatus.lastError = text.trim().substring(0, 100);
    
    clearLine();
    console.log(`\n${colors.red}${colors.bold}┌─ ❌ 错误 #${errorCount}${colors.reset}`);
    console.log(`${colors.red}│${colors.reset} ${text.trim().split('\n')[0]}${colors.reset}`);
    console.log(`${colors.red}└─────────────────────────────────────────${colors.reset}\n`);
    return;
  }

  // 警告信息
  if (text.includes('Warning') || text.includes('warn')) {
    clearLine();
    console.log(`${colors.yellow}⚠️  警告: ${text.trim().substring(0, 80)}...${colors.reset}`);
    return;
  }
});

// 处理标准错误
nextDev.stderr.on('data', (data) => {
  const text = data.toString();
  
  if (text.includes('Error') || text.includes('error') || text.includes('⨯')) {
    errorCount++;
    apiStatus.error++;
    apiStatus.lastError = text.trim().substring(0, 100);
    
    console.log(`\n${colors.red}${colors.bold}┌─ ❌ 错误 #${errorCount}${colors.reset}`);
    console.log(`${colors.red}│${colors.reset} ${text.trim().split('\n')[0]}${colors.reset}`);
    console.log(`${colors.red}└─────────────────────────────────────────${colors.reset}\n`);
  }
});

// 处理进程退出
nextDev.on('exit', (code) => {
  console.log(`\n${colors.yellow}👋 服务器已停止 (退出码: ${code})${colors.reset}\n`);
  process.exit(code || 0);
});

// 处理信号
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}🛑 正在停止服务器...${colors.reset}`);
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});
