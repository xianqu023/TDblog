module.exports = {
  apps: [{
    name: 'blog-web',
    script: 'node',
    args: 'apps/web/server.js',
    cwd: '.',
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: 'logs/web/error.log',
    out_file: 'logs/web/output.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    min_uptime: '10s',
    max_restarts: 5,
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs']
  }]
};
