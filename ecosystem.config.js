/**
 * PM2 配置文件
 * 用于生产环境进程管理
 */

module.exports = {
  apps: [
    {
      name: 'blog-platform',
      // 使用 standalone 服务器
      script: './apps/web/.next/standalone/apps/web/server.js',
      
      // 实例数量（集群模式）
      instances: 1,
      exec_mode: 'fork', // 不使用 cluster，SQLite 不支持多进程
      
      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        STANDALONE: 'true',
      },
      
      // 错误处理
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 自动重启
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // 重启策略
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 网络配置
      listen_timeout: 3000,
      kill_timeout: 5000,
      
      // 健康检查
      status: {
        port: 9615,
        path: '/health',
      },
    },
  ],
};
