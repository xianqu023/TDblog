#!/usr/bin/env node

/**
 * Blog CLI - 交互式博客管理工具
 * 类似宝塔面板的终端管理体验
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 颜色配置
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

// ASCII Logo
const logo = `
${colors.cyan}${colors.bright}
 ██████╗ ███████╗████████╗██████╗  ██████╗ 
██╔════╝ ██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗
██║  ███╗█████╗     ██║   ██████╔╝██║   ██║
██║   ██║██╔══╝     ██║   ██╔══██╗██║   ██║
╚██████╔╝███████╗   ██║   ██║  ██║╚██████╔╝
 ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ 
                                            
${colors.reset}`;

// 项目根目录
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local');

// 工具函数
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: 'inherit',
      cwd: PROJECT_ROOT,
      ...options,
    });
  } catch (error) {
    if (!options.silent) {
      logError(`执行失败：${command}`);
    }
    throw error;
  }
}

function checkProcessRunning(processName) {
  try {
    const result = execSync(`pgrep -f ${processName}`, { encoding: 'utf-8' });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function getPM2Status(appName) {
  try {
    const result = execSync(`pm2 list | grep ${appName}`, { encoding: 'utf-8' });
    return result.includes('online');
  } catch {
    return false;
  }
}

// 功能模块
const commands = {
  // 环境检查
  async check() {
    log('\n🔍 环境检查...\n', 'cyan');
    
    const checks = [
      {
        name: 'Node.js',
        check: () => {
          const version = execSync('node -v', { encoding: 'utf-8' }).trim();
          return version.startsWith('v');
        },
      },
      {
        name: 'pnpm',
        check: () => {
          execSync('pnpm -v', { encoding: 'utf-8' });
          return true;
        },
      },
      {
        name: '数据库目录',
        check: () => {
          const dbPath = path.join(PROJECT_ROOT, 'packages/database/prisma');
          return fs.existsSync(dbPath);
        },
      },
      {
        name: '环境变量',
        check: () => {
          return fs.existsSync(ENV_FILE);
        },
      },
      {
        name: '依赖安装',
        check: () => {
          const nodeModules = path.join(PROJECT_ROOT, 'node_modules');
          return fs.existsSync(nodeModules);
        },
      },
    ];

    let allPassed = true;
    for (const item of checks) {
      try {
        const passed = item.check();
        if (passed) {
          logSuccess(`${item.name} ✓`);
        } else {
          logError(`${item.name} ✗`);
          allPassed = false;
        }
      } catch {
        logError(`${item.name} ✗`);
        allPassed = false;
      }
    }

    if (allPassed) {
      logSuccess('\n✅ 环境检查通过！\n', 'green');
    } else {
      logWarning('\n⚠ 部分检查未通过，请修复后重试\n', 'yellow');
    }
  },

  // 初始化数据库
  async init() {
    log('\n🗄️ 初始化数据库...\n', 'cyan');
    
    try {
      // 创建数据库目录
      const dbDir = path.join(PROJECT_ROOT, 'packages/database/prisma');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logSuccess('创建数据库目录');
      }

      // 生成 Prisma Client（设置环境变量）
      log('生成 Prisma Client...', 'dim');
      exec('cd packages/database && DATABASE_URL=file:./prisma/blog.db npx prisma generate');
      logSuccess('Prisma Client 生成完成');

      // 数据库迁移（如果有 migrations 目录）
      const migrationsDir = path.join(PROJECT_ROOT, 'packages/database/prisma/migrations');
      if (fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).length > 0) {
        log('执行数据库迁移...', 'dim');
        exec('cd packages/database && DATABASE_URL=file:./prisma/blog.db npx prisma migrate deploy');
        logSuccess('数据库迁移完成');
      } else {
        // 没有 migrations，使用 db push 直接推送 schema
        log('推送数据库 Schema...', 'dim');
        exec('cd packages/database && DATABASE_URL=file:./prisma/blog.db npx prisma db push');
        logSuccess('数据库 Schema 已推送');
      }

      // 创建初始数据（如果有 seed 脚本）
      const seedScript = path.join(PROJECT_ROOT, 'packages/database/prisma/seed.js');
      if (fs.existsSync(seedScript)) {
        log('初始化种子数据...', 'dim');
        exec('cd packages/database && DATABASE_URL=file:./prisma/blog.db npx prisma db seed');
        logSuccess('种子数据初始化完成');
      }

      logSuccess('\n✅ 数据库初始化完成！\n', 'green');
    } catch (error) {
      logError('数据库初始化失败');
      logError('提示：请确保已安装依赖：pnpm install');
      process.exit(1);
    }
  },

  // 部署
  async deploy() {
    log('\n🚀 开始部署...\n', 'cyan');
    
    try {
      // 1. 环境检查
      await commands.check();

      // 2. 安装依赖
      log('\n📦 安装依赖...', 'cyan');
      exec('pnpm install --frozen-lockfile');
      logSuccess('依赖安装完成');

      // 3. 初始化数据库
      await commands.init();

      // 4. 构建项目
      log('\n🏗️ 构建项目...', 'cyan');
      exec('cd apps/web && pnpm run build');
      logSuccess('构建完成');

      // 5. 启动服务
      log('\n▶️ 启动服务...', 'cyan');
      exec('pm2 start ecosystem.config.js');
      exec('pm2 save');
      logSuccess('服务已启动');

      logSuccess('\n✅ 部署完成！\n', 'green');
      logInfo('访问地址：http://localhost:3000\n', 'blue');
    } catch (error) {
      logError('部署失败');
      process.exit(1);
    }
  },

  // 启动服务
  async start() {
    log('\n▶️ 启动服务...\n', 'cyan');
    
    try {
      // 先停止现有的进程
      log('停止现有进程...', 'dim');
      exec('pm2 stop blog-platform 2>/dev/null || true');
      exec('pm2 delete blog-platform 2>/dev/null || true');
      
      // 启动 PM2
      log('启动 PM2 进程...', 'dim');
      exec('pm2 start ecosystem.config.js');
      logSuccess('服务已启动');
      logInfo('访问地址：http://localhost:3000\n', 'blue');
    } catch (error) {
      logError('启动失败，请检查日志');
      process.exit(1);
    }
  },

  // 停止服务
  async stop() {
    log('\n⏹️ 停止服务...\n', 'cyan');
    
    if (!getPM2Status('blog-platform')) {
      logWarning('服务未运行');
      return;
    }

    try {
      exec('pm2 stop blog-platform');
      logSuccess('服务已停止');
    } catch (error) {
      logError('停止失败');
      process.exit(1);
    }
  },

  // 重启服务
  async restart() {
    log('\n🔄 重启服务...\n', 'cyan');
    
    try {
      if (getPM2Status('blog-platform')) {
        exec('pm2 restart blog-platform');
      } else {
        exec('pm2 start ecosystem.config.js');
      }
      logSuccess('服务已重启');
    } catch (error) {
      logError('重启失败');
      process.exit(1);
    }
  },

  // 查看日志
  async logs(options = { follow: false, lines: 50 }) {
    const cmd = options.follow
      ? `pm2 logs blog-platform --lines ${options.lines}`
      : `pm2 logs blog-platform --lines ${options.lines} --nostream`;
    
    try {
      exec(cmd);
    } catch (error) {
      logError('查看日志失败');
    }
  },

  // 实时监控 API 请求（带颜色高亮，支持 PM2 和非 PM2 模式）
  async monitor() {
    log('\n📊 实时监控 API 请求...\n', 'cyan');
    
    // 检测是否使用 PM2
    const pm2Status = getPM2Status('blog-platform');
    
    if (pm2Status) {
      // PM2 模式
      logInfo('检测到 PM2 进程，使用 PM2 日志模式\n', 'green');
      await this.monitorPM2();
    } else {
      // 非 PM2 模式 - 直接监控日志文件
      logInfo('未检测到 PM2 进程，使用日志文件监控模式\n', 'yellow');
      await this.monitorLogFile();
    }
  },

  // PM2 模式监控
  async monitorPM2() {
    // 清屏并显示美化边框
    console.clear();
    
    const border = '═';
    const cornerTL = '╔';
    const cornerTR = '╗';
    const cornerBL = '╚';
    const cornerBR = '╝';
    const vertical = '║';
    const width = 70;
    
    // 顶部边框
    console.log(`\n${colors.cyan}${cornerTL}${border.repeat(width)}${cornerTR}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${' '.repeat(width)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.bright}${colors.yellow}  📊 实时监控 API 请求系统${colors.reset}${' '.repeat(42)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${' '.repeat(width)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.dim}  模式：${colors.green}PM2 日志模式${colors.reset}${' '.repeat(48)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.dim}  文件：${colors.blue}logs/pm2-out.log${colors.reset}${' '.repeat(45)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.yellow}  提示：${colors.reset}${colors.dim}刷新前端页面查看实时请求日志${colors.reset}${' '.repeat(33)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.red}  退出：${colors.reset}${colors.dim}按 Ctrl+C${colors.reset}${' '.repeat(54)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${' '.repeat(width)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${cornerBL}${border.repeat(width)}${cornerBR}${colors.reset}\n`);
    
    // 分隔线
    console.log(`${colors.dim}${'─'.repeat(width)}${colors.reset}\n`);

    // 直接使用 PM2 输出日志文件
    const pm2OutLog = path.join(PROJECT_ROOT, 'logs', 'pm2-out.log');
    
    if (!fs.existsSync(pm2OutLog)) {
      logError('PM2 日志文件不存在：logs/pm2-out.log');
      return;
    }

    // 保持进程运行
    process.stdin.resume();

    // 使用 tail -f 监控 PM2 日志文件
    const tailProcess = spawn('tail', ['-f', '-n', '0', pm2OutLog], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let buffer = '';

    tailProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const trimmedLine = rawLine.trim();
        if (!trimmedLine) continue;

        // PM2 日志格式：0|blog-pla | YYYY-MM-DD HH:MM:SS: message
        const pm2Match = trimmedLine.match(/^\d+\|[^|]+\s*\|\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}):\s*(.*)$/);
        
        let timestamp = '';
        let message = '';

        if (pm2Match) {
          const fullTimestamp = pm2Match[1];
          const timePart = fullTimestamp.split(' ')[1];
          timestamp = timePart;
          message = pm2Match[2];
        } else {
          // 尝试其他格式
          const timestampMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}):\s*(.*)$/);
          if (timestampMatch) {
            const fullTimestamp = timestampMatch[1];
            const timePart = fullTimestamp.split(' ')[1];
            timestamp = timePart;
            message = timestampMatch[2];
          } else {
            timestamp = new Date().toTimeString().split(' ')[0];
            message = trimmedLine;
          }
        }

        if (!message) continue;

        this.highlightLogLine(timestamp, message);
      }
    });

    tailProcess.stderr.on('data', (data) => {
      const timestamp = new Date().toTimeString().split(' ')[0];
      process.stdout.write(`${colors.red}[${timestamp}] ❌ ${data}${colors.reset}`);
    });

    tailProcess.on('error', (error) => {
      logError(`tail 进程错误：${error.message}`);
    });

    tailProcess.on('close', (code) => {
      logWarning(`tail 进程退出，代码：${code}`);
    });

    process.on('SIGINT', () => {
      tailProcess.kill();
      console.log(`\n${colors.cyan}${'─'.repeat(width)}${colors.reset}`);
      console.log(`${colors.green}  ✅ 监控已安全退出${colors.reset}`);
      console.log(`${colors.cyan}${'─'.repeat(width)}${colors.reset}\n`);
      process.exit(0);
    });
  },

  // 日志文件模式监控（非 PM2）
  async monitorLogFile() {
    // 清屏并显示美化边框
    console.clear();
    
    const border = '═';
    const cornerTL = '╔';
    const cornerTR = '╗';
    const cornerBL = '╚';
    const cornerBR = '╝';
    const vertical = '║';
    const width = 70;
    
    // 优先监控 PM2 输出日志（如果有）
    const pm2OutLog = path.join(PROJECT_ROOT, 'logs', 'pm2-out.log');
    const pm2ErrorLog = path.join(PROJECT_ROOT, 'logs', 'pm2-error.log');
    const combinedLog = path.join(PROJECT_ROOT, 'logs', 'combined.log');
    
    // 选择一个存在的日志文件
    let logFile = null;
    let logType = '';
    
    if (fs.existsSync(pm2OutLog)) {
      logFile = pm2OutLog;
      logType = 'PM2 输出日志';
    } else if (fs.existsSync(combinedLog)) {
      logFile = combinedLog;
      logType = '合并日志';
    } else {
      // 创建 combined.log
      const logDir = path.dirname(combinedLog);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.writeFileSync(combinedLog, '');
      logFile = combinedLog;
      logType = '合并日志（新建）';
    }
    
    // 顶部边框
    console.log(`\n${colors.cyan}${cornerTL}${border.repeat(width)}${cornerTR}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${' '.repeat(width)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.bright}${colors.yellow}  📊 实时监控 API 请求系统${colors.reset}${' '.repeat(42)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${' '.repeat(width)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.dim}  模式：${colors.yellow}日志文件模式${colors.reset}${' '.repeat(47)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.dim}  类型：${colors.blue}${logType}${colors.reset}${' '.repeat(56 - logType.length)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.dim}  文件：${colors.blue}${logFile}${colors.reset}${' '.repeat(55 - logFile.length)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.yellow}  提示：${colors.reset}${colors.dim}刷新前端页面查看实时请求日志${colors.reset}${' '.repeat(33)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${colors.red}  退出：${colors.reset}${colors.dim}按 Ctrl+C${colors.reset}${' '.repeat(54)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${vertical}${colors.reset}${' '.repeat(width)}${colors.cyan}${vertical}${colors.reset}`);
    console.log(`${colors.cyan}${cornerBL}${border.repeat(width)}${cornerBR}${colors.reset}\n`);
    
    // 分隔线
    console.log(`${colors.dim}${'─'.repeat(width)}${colors.reset}\n`);

    // 使用 tail -f 监控日志文件
    const tail = spawn('tail', ['-F', '-n', '0', logFile], {
      cwd: PROJECT_ROOT,
    });

    let buffer = '';

    tail.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const trimmedLine = rawLine.trim();
        if (!trimmedLine) continue;

        // 跳过 PM2 的进程信息行
        if (trimmedLine.startsWith('>') || 
            trimmedLine.startsWith('▲') || 
            trimmedLine.startsWith('✓') ||
            trimmedLine.startsWith('-') ||
            trimmedLine.includes('Ready in') ||
            trimmedLine.includes('Local:') ||
            trimmedLine.includes('Network:')) {
          continue;
        }

        // 解析日志格式：YYYY-MM-DD HH:MM:SS message
        const timestampMatch = trimmedLine.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*(.*)$/);
        
        let timestamp = '';
        let message = trimmedLine;

        if (timestampMatch) {
          const fullTimestamp = timestampMatch[1];
          const timePart = fullTimestamp.split(' ')[1];
          timestamp = timePart;
          message = timestampMatch[2];
        } else {
          timestamp = new Date().toTimeString().split(' ')[0];
        }

        if (!message) continue;

        this.highlightLogLine(timestamp, message);
      }
    });

    tail.stderr.on('data', (data) => {
      const timestamp = new Date().toTimeString().split(' ')[0];
      process.stdout.write(`${colors.red}[${timestamp}] ❌ ${data}${colors.reset}`);
    });

    // 监听文件变化
    tail.on('error', (error) => {
      logError(`tail 进程错误：${error.message}`);
    });

    process.on('SIGINT', () => {
      tail.kill();
      console.log(`\n${colors.cyan}${'─'.repeat(width)}${colors.reset}`);
      console.log(`${colors.green}  ✅ 监控已安全退出${colors.reset}`);
      console.log(`${colors.cyan}${'─'.repeat(width)}${colors.reset}\n`);
      process.exit(0);
    });
  },

  // 高亮显示日志行
  highlightLogLine(timestamp, message) {
    // 错误代码高亮（404, 500, 403, 401 等）
    if (message.match(/\b(404|500|403|401|400|502|503)\b/)) {
      const status = message.match(/\b(404|500|403|401|400|502|503)\b/)[1];
      let color = colors.red;
      if (status === '404') color = colors.yellow;
      if (status === '403' || status === '401') color = colors.magenta;
      if (status === '400') color = colors.cyan;
      process.stdout.write(`${color}[${timestamp}] ❌ ${status} ${message}${colors.reset}\n`);
    }
    // API 请求高亮（成功）
    else if (message.includes('/api/') && (message.includes(' 200 ') || message.includes(' 201 ') || message.includes('200') || message.includes('201'))) {
      const method = message.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/)?.[0] || 'API';
      let methodColor = colors.green;
      if (method === 'POST') methodColor = colors.blue;
      if (method === 'PUT' || method === 'PATCH') methodColor = colors.yellow;
      if (method === 'DELETE') methodColor = colors.red;
      process.stdout.write(`${methodColor}[${timestamp}] ✅ ${method} ${message}${colors.reset}\n`);
    }
    // Next.js 请求日志格式：GET / 200 in 45ms
    else if (message.match(/\b(GET|POST|PUT|DELETE|PATCH)\s+\/[^\s]*\s+\d{3}/)) {
      const method = message.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/)?.[0] || 'GET';
      const path = message.match(/\/[^\s]*/)?.[0] || '/';
      const status = message.match(/\b(\d{3})\b/)?.[0] || '200';
      
      let methodColor = colors.green;
      if (method === 'POST') methodColor = colors.blue;
      if (method === 'PUT' || method === 'PATCH') methodColor = colors.yellow;
      if (method === 'DELETE') methodColor = colors.red;
      
      // 根据状态码判断颜色
      if (status.startsWith('4')) {
        process.stdout.write(`${colors.yellow}[${timestamp}] ${method} ${path} ${status}${colors.reset}\n`);
      } else if (status.startsWith('5')) {
        process.stdout.write(`${colors.red}[${timestamp}] ${method} ${path} ${status}${colors.reset}\n`);
      } else {
        process.stdout.write(`${methodColor}[${timestamp}] ${method} ${path} ${status}${colors.reset}\n`);
      }
    }
    // 页面访问高亮
    else if (message.match(/\b(GET)\s+\/(?!api\/)/) && !message.includes('ERROR') && !message.includes('Error')) {
      const page = message.match(/GET\s+\/[^\s]*/)?.[0] || '';
      if (page) {
        process.stdout.write(`${colors.blue}[${timestamp}] 📄 ${page}${colors.reset}\n`);
      } else {
        process.stdout.write(`${colors.dim}[${timestamp}] ${message}${colors.reset}\n`);
      }
    }
    // 错误高亮
    else if (message.includes('ERROR') || message.includes('Error') || message.includes('⨯') || message.includes('Failed to')) {
      process.stdout.write(`${colors.red}[${timestamp}] 🔥 ${message}${colors.reset}\n`);
    }
    // 数据库操作高亮
    else if (message.includes('Database') || message.includes('prisma') || message.includes('SQL') || message.includes('[DB')) {
      process.stdout.write(`${colors.magenta}[${timestamp}] 🗄️  ${message}${colors.reset}\n`);
    }
    // 认证相关高亮
    else if (message.includes('Auth') || message.includes('auth') || message.includes('login') || message.includes('register') || message.includes('session')) {
      process.stdout.write(`${colors.yellow}[${timestamp}] 🔐 ${message}${colors.reset}\n`);
    }
    // 文件上传高亮
    else if (message.includes('upload') || message.includes('Upload') || message.includes('file') || message.includes('storage')) {
      process.stdout.write(`${colors.cyan}[${timestamp}] 📁 ${message}${colors.reset}\n`);
    }
    // Webhook 高亮
    else if (message.includes('webhook') || message.includes('Webhook') || message.includes('stripe') || message.includes('Stripe') || message.includes('paypal') || message.includes('PayPal') || message.includes('wechat') || message.includes('WeChat') || message.includes('alipay') || message.includes('Alipay')) {
      process.stdout.write(`${colors.yellow}[${timestamp}] 💰 ${message}${colors.reset}\n`);
    }
    // AI 相关高亮
    else if (message.includes('AI') || message.includes('OpenAI') || message.includes('translate') || message.includes('Translate') || message.includes('summary') || message.includes('Summary')) {
      process.stdout.write(`${colors.magenta}[${timestamp}] 🤖 ${message}${colors.reset}\n`);
    }
    // 普通日志
    else {
      process.stdout.write(`${colors.dim}[${timestamp}] ${message}${colors.reset}\n`);
    }
  },

  // 查看状态
  async status() {
    log('\n📊 服务状态\n', 'cyan');
    
    try {
      exec('pm2 list blog-platform');
      log('\n');
      
      // 显示数据库信息
      const dbPath = path.join(PROJECT_ROOT, 'packages/database/prisma/blog.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const size = (stats.size / 1024).toFixed(2);
        logInfo(`数据库大小：${size} KB`, 'magenta');
      }
      
      log('\n');
    } catch (error) {
      logWarning('PM2 未安装或服务未配置');
    }
  },

  // 清理缓存
  async clean() {
    log('\n🧹 清理缓存...\n', 'cyan');
    
    const dirs = [
      '.next',
      'node_modules/.cache',
      'apps/web/.next',
      'apps/web/node_modules/.cache',
    ];

    for (const dir of dirs) {
      const fullPath = path.join(PROJECT_ROOT, dir);
      if (fs.existsSync(fullPath)) {
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          logSuccess(`清理：${dir}`);
        } catch {
          logWarning(`无法清理：${dir}`);
        }
      }
    }

    logSuccess('\n✅ 清理完成！\n', 'green');
  },

  // 开发模式
  async dev() {
    log('\n👨‍💻 启动开发模式...\n', 'cyan');
    
    const dev = spawn('pnpm', ['dev'], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });

    dev.on('close', (code) => {
      process.exit(code);
    });

    process.on('SIGINT', () => {
      dev.kill();
      process.exit(0);
    });
  },

  // 帮助信息
  help() {
    console.log(`
${logo}
${colors.bright}用法:${colors.reset}
  blog [命令] [选项]

${colors.bright}命令列表:${colors.reset}
  ${colors.cyan}blog${colors.reset}              交互式菜单
  ${colors.cyan}blog check${colors.reset}        环境检查
  ${colors.cyan}blog init${colors.reset}         初始化数据库
  ${colors.cyan}blog deploy${colors.reset}       一键部署（检查 + 安装 + 构建 + 启动）
  ${colors.cyan}blog start${colors.reset}        启动服务
  ${colors.cyan}blog stop${colors.reset}         停止服务
  ${colors.cyan}blog restart${colors.reset}      重启服务
  ${colors.cyan}blog status${colors.reset}       查看状态
  ${colors.cyan}blog logs${colors.reset}         查看日志（最近 50 行）
  ${colors.cyan}blog logs -f${colors.reset}      实时跟踪日志
  ${colors.cyan}blog monitor${colors.reset}      实时监控 API 请求（带颜色高亮）
  ${colors.cyan}blog dev${colors.reset}          开发模式
  ${colors.cyan}blog clean${colors.reset}        清理缓存
  ${colors.cyan}blog help${colors.reset}         显示帮助

${colors.bright}选项:${colors.reset}
  ${colors.yellow}-f, --follow${colors.reset}    实时跟踪日志
  ${colors.yellow}-n, --lines${colors.reset}     显示日志行数（默认：50）
  ${colors.yellow}-h, --help${colors.reset}      显示帮助

${colors.bright}示例:${colors.reset}
  ${colors.dim}# 交互式菜单${colors.reset}
  blog

  ${colors.dim}# 一键部署${colors.reset}
  blog deploy

  ${colors.dim}# 实时查看日志${colors.reset}
  blog logs -f

  ${colors.dim}# 监控 API 请求（带颜色高亮）${colors.reset}
  blog monitor

  ${colors.dim}# 查看最近 100 行日志${colors.reset}
  blog logs -n 100

  ${colors.dim}# 清理缓存${colors.reset}
  blog clean

${colors.bright}快捷操作:${colors.reset}
  ${colors.green}blog d${colors.reset}   部署 (deploy)
  ${colors.green}blog s${colors.reset}   启动 (start)
  ${colors.green}blog x${colors.reset}   停止 (stop)
  ${colors.green}blog r${colors.reset}   重启 (restart)
  ${colors.green}blog l${colors.reset}   日志 (logs)
  ${colors.green}blog m${colors.reset}   监控 (monitor)
  ${colors.green}blog c${colors.reset}   检查 (check)
  ${colors.green}blog v${colors.reset}   开发 (dev)

${colors.dim}更多帮助请查看文档：${colors.reset}
  https://github.com/your-repo/blog-cli

${colors.dim}版本：${colors.reset}v1.0.0
${colors.dim}作者：Blog Team${colors.reset}
    `);
  },
};

// 交互式菜单
async function interactiveMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(logo);
  logInfo('博客管理系统 - 交互式菜单\n', 'cyan');

  const menu = `
${colors.bright}请选择操作 (输入数字即可):${colors.reset}
  ${colors.cyan}[1]${colors.reset} 环境检查
  ${colors.cyan}[2]${colors.reset} 初始化数据库
  ${colors.cyan}[3]${colors.reset} 一键部署
  ${colors.cyan}[4]${colors.reset} 启动服务
  ${colors.cyan}[5]${colors.reset} 停止服务
  ${colors.cyan}[6]${colors.reset} 重启服务
  ${colors.cyan}[7]${colors.reset} 查看状态
  ${colors.cyan}[8]${colors.reset} 查看日志
  ${colors.cyan}[9]${colors.reset} 实时监控 API (带颜色高亮)
  ${colors.cyan}[10]${colors.reset} 开发模式
  ${colors.cyan}[11]${colors.reset} 清理缓存
  ${colors.cyan}[0]${colors.reset} 退出

  ${colors.dim}提示：直接输入数字，按回车确认${colors.reset}
`;

  function showMenu() {
    console.log(menu);
    rl.question(`${colors.yellow}请输入数字 (0-11): ${colors.reset}`, handleInput);
  }

  async function handleInput(input) {
    const cmd = input.trim().toLowerCase();
    
    // 数字快捷键映射
    const numberMap = {
      '0': 'exit',
      '1': 'check',
      '2': 'init',
      '3': 'deploy',
      '4': 'start',
      '5': 'stop',
      '6': 'restart',
      '7': 'status',
      '8': 'logs',
      '9': 'monitor',
      '10': 'dev',
      '11': 'clean',
    };

    // 命令别名
    const aliases = {
      'd': 'deploy',
      's': 'start',
      'x': 'stop',
      'r': 'restart',
      'l': 'logs',
      'm': 'monitor',
      'c': 'check',
      'v': 'dev',
      'q': 'exit',
      'quit': 'exit',
      'exit': 'exit',
      'help': 'help',
    };

    // 优先匹配数字，然后匹配别名，最后作为命令
    let command = numberMap[cmd] || aliases[cmd] || cmd;

    try {
      switch (command) {
        case 'check':
          await commands.check();
          break;
        case 'init':
          await commands.init();
          break;
        case 'deploy':
          await commands.deploy();
          break;
        case 'start':
          await commands.start();
          break;
        case 'stop':
          await commands.stop();
          break;
        case 'restart':
          await commands.restart();
          break;
        case 'status':
          await commands.status();
          break;
        case 'logs':
          await commands.logs({ follow: false, lines: 50 });
          break;
        case 'monitor':
          log('\n📊 启动实时监控...\n', 'cyan');
          logInfo('按 Ctrl+C 退出监控\n', 'yellow');
          await commands.monitor();
          return; // monitor 会接管终端
        case 'dev':
          log('\n👨‍💻 启动开发模式...\n', 'cyan');
          logInfo('按 Ctrl+C 退出开发模式\n', 'yellow');
          await commands.dev();
          return; // dev 会接管终端
        case 'clean':
          await commands.clean();
          break;
        case 'help':
          commands.help();
          break;
        case 'exit':
          log('\n👋 再见！\n', 'cyan');
          rl.close();
          process.exit(0);
          return;
        default:
          logWarning('未知命令，请输入 0-11 的数字');
      }
    } catch (error) {
      logError('执行失败：' + error.message);
    }

    console.log();
    showMenu();
  }

  showMenu();
}

// 主程序
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // 没有参数，直接进入交互式菜单
  if (!command) {
    await interactiveMenu();
    return;
  }

  // 显示帮助
  if (command === 'help' || command === '-h' || command === '--help') {
    commands.help();
    return;
  }

  // 交互式菜单
  if (command === 'menu' || command === 'i' || command === 'interactive') {
    await interactiveMenu();
    return;
  }

  // 执行命令
  const cmd = commands[command];
  if (cmd) {
    try {
      // 处理选项
      const options = {
        follow: args.includes('-f') || args.includes('--follow'),
        lines: parseInt(args.find(a => a.startsWith('-n'))?.split('=')[1] || '50', 10),
      };

      if (command === 'logs') {
        await cmd(options);
      } else {
        await cmd();
      }
    } catch (error) {
      process.exit(1);
    }
  } else {
    // 未知命令，进入交互式菜单
    logWarning(`未知命令：${command}`);
    logInfo('进入交互式菜单...\n', 'cyan');
    await interactiveMenu();
  }
}

// 运行
main().catch((error) => {
  logError(error.message);
  process.exit(1);
});
