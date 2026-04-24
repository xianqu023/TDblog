const fs = require('fs');
const path = require('path');

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

// 加载配置
const configPath = path.resolve(__dirname, 'conf.ini');
const defaultConfig = {
  app: {
    port: '3000',
    maxWorkers: '1'
  }
};

let appConfig = defaultConfig;

if (fs.existsSync(configPath)) {
  try {
    const parsed = parseIni(configPath);
    if (parsed.app) {
      appConfig = { ...defaultConfig, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse conf.ini, using defaults:', error.message);
  }
}

module.exports = {
  apps: [{
    name: 'blog-platform',
    script: './apps/web/server.js',
    instances: appConfig.app.maxWorkers || 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: appConfig.app.port || '3000'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
