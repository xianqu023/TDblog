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
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
    
    // 解析 section
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      config[currentSection] = {};
      continue;
    }
    
    // 解析 key = value
    if (currentSection && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      config[currentSection][key.trim()] = valueParts.join('=').trim();
    }
  }
  
  return config;
}

/**
 * 从 conf.ini 加载配置并导出为环境变量
 */
function loadConfig() {
  const configPath = path.resolve(__dirname, '..', 'conf.ini');
  
  if (!fs.existsSync(configPath)) {
    console.warn('⚠️ 配置文件不存在:', configPath);
    return;
  }
  
  const config = parseIni(configPath);
  
  // 数据库配置
  if (config.database) {
    process.env.DB_PROVIDER = config.database.provider || process.env.DB_PROVIDER || 'postgresql';
    process.env.DATABASE_URL = config.database.url || process.env.DATABASE_URL;
  }
  
  // 服务器配置
  if (config.server) {
    process.env.PORT = config.server.port || process.env.PORT || '3000';
    process.env.HOST = config.server.host || process.env.HOST || '0.0.0.0';
    process.env.NODE_ENV = config.server.node_env || process.env.NODE_ENV || 'production';
  }
  
  // 认证配置
  if (config.auth) {
    process.env.AUTH_SECRET = config.auth.secret || process.env.AUTH_SECRET;
    process.env.NEXTAUTH_URL = config.auth.url || process.env.NEXTAUTH_URL;
  }
  
  // 网站配置
  if (config.site) {
    process.env.NEXT_PUBLIC_SITE_NAME = config.site.name || process.env.NEXT_PUBLIC_SITE_NAME;
    process.env.NEXT_PUBLIC_SITE_URL = config.site.url || process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 存储配置
  if (config.storage) {
    process.env.STORAGE_DRIVER = config.storage.driver || process.env.STORAGE_DRIVER || 'local';
    process.env.STORAGE_LOCAL_PATH = config.storage.local_path || process.env.STORAGE_LOCAL_PATH || './uploads';
    process.env.STORAGE_LOCAL_URL = config.storage.local_url || process.env.STORAGE_LOCAL_URL || '/uploads';
  }
  
  console.log('✅ 配置加载完成');
  console.log('   数据库:', process.env.DB_PROVIDER);
  console.log('   存储驱动:', process.env.STORAGE_DRIVER);
  console.log('   网站:', process.env.NEXT_PUBLIC_SITE_NAME);
}

module.exports = { parseIni, loadConfig };

// 如果直接运行此脚本，则加载配置
if (require.main === module) {
  loadConfig();
}
