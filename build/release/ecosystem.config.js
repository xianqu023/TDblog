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
const iniConfig = fs.existsSync(configPath) ? parseIni(configPath) : {};

const dbConfig = iniConfig.database || {};
const serverConfig = iniConfig.server || {};
const authConfig = iniConfig.auth || {};
const siteConfig = iniConfig.site || {};
const storageConfig = iniConfig.storage || {};
const aiConfig = iniConfig.ai || {};

module.exports = {
  apps: [{
    name: 'blog-platform',
    script: 'node',
    args: 'scripts/start-prod.js',
    cwd: '.',
    instances: serverConfig.instances || 1,
    autorestart: true,
    max_memory_restart: serverConfig.max_memory || '1G',
    env: {
      NODE_ENV: serverConfig.node_env || 'production',
      PORT: serverConfig.port || '3000',
      HOST: serverConfig.host || '0.0.0.0',
      DATABASE_URL: dbConfig.url || 'file:./packages/database/prisma/blog.db',
      AUTH_SECRET: authConfig.secret || '',
      NEXTAUTH_SECRET: authConfig.secret || '',
      NEXTAUTH_URL: authConfig.url || '',
      NEXT_PUBLIC_SITE_NAME: siteConfig.name || '',
      NEXT_PUBLIC_SITE_URL: siteConfig.url || '',
      STORAGE_DRIVER: storageConfig.driver || 'local',
      STORAGE_LOCAL_PATH: storageConfig.local_path || './uploads',
      STORAGE_LOCAL_URL: storageConfig.local_url || '/uploads',
      // AI 配置
      OPENAI_API_KEY: aiConfig.api_key || '',
      OPENAI_BASE_URL: aiConfig.base_url || '',
      AI_MODEL: aiConfig.model || '',
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    min_uptime: '10s',
    max_restarts: 5,
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs', 'conf.ini', 'uploads']
  }]
};
