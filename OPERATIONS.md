# Blog Platform 运维指南

## 快速启动

### 开发环境

```bash
# 方式 1: 使用 npm scripts
pnpm start

# 方式 2: 直接运行脚本
bash scripts/start-dev.sh
```

### 生产环境

```bash
# 启动服务
pnpm start:prod

# 或使用脚本
bash scripts/start-prod.sh
```

## 服务管理

### 常用命令

```bash
# 查看服务状态
pnpm status
# 或
bash scripts/manage.sh status

# 重启服务
pnpm restart
# 或
bash scripts/manage.sh restart

# 停止服务
pnpm stop
# 或
bash scripts/manage.sh stop

# 查看日志 (最近 100 行)
pnpm logs
# 或
bash scripts/manage.sh logs

# 查看错误日志
pnpm logs:error
# 或
bash scripts/manage.sh logs-error
```

### 日志管理

```bash
# 查看日志统计
bash scripts/logs.sh status

# 清理 30 天前的日志
bash scripts/logs.sh clean

# 清理指定天数前的日志
bash scripts/logs.sh clean 7

# 轮转日志 (备份当前日志并创建新日志)
bash scripts/logs.sh rotate

# 清空所有日志
bash scripts/logs.sh clear

# 分析日志 (统计错误等)
bash scripts/logs.sh analyze
```

## 日志位置

```
logs/
├── web/                    # Web 服务日志
│   ├── 2026-04-18.log     # 按日期命名的日志
│   ├── error.log          # 错误日志
│   └── restart.log        # 重启日志
├── pm2/                    # PM2 管理日志 (生产环境)
│   ├── web-out.log
│   ├── web-error.log
│   └── web-combined.log
├── monitor.log            # 监控日志
└── backup/                # 轮转备份
```

## 自动启动

### 使用 systemd (Linux)

1. 复制服务文件：
```bash
sudo cp scripts/blog-platform.service /etc/systemd/system/
```

2. 修改服务文件中的路径：
```bash
sudo nano /etc/systemd/system/blog-platform.service
```

3. 启用并启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable blog-platform
sudo systemctl start blog-platform
```

4. 查看状态：
```bash
sudo systemctl status blog-platform
```

### 使用 PM2 (推荐)

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 保存配置 (开机自启)
pm2 save

# 设置开机自启
pm2 startup
```

### 使用 cron 定时监控

```bash
# 编辑 crontab
crontab -e

# 添加每分钟检查
* * * * * /path/to/blog/scripts/monitor.sh
```

## 健康检查

访问健康检查 API：

```bash
curl http://localhost:3000/api/health
```

响应示例：
```json
{
  "status": "OK",
  "timestamp": "2026-04-18T12:00:00.000Z",
  "uptime": 12345,
  "memory": {
    "rss": 543210000,
    "heapTotal": 234567000,
    "heapUsed": 123456000,
    "external": 12345000
  },
  "database": "connected"
}
```

## 故障排除

### 服务无法启动

1. 检查端口是否被占用：
```bash
lsof -i :3000
```

2. 检查 Node.js 版本：
```bash
node --version  # 需要 >= 18.0.0
```

3. 重新安装依赖：
```bash
pnpm install
```

4. 重新生成 Prisma 客户端：
```bash
cd packages/database
pnpm prisma generate
```

### 内存不足

1. 查看内存使用：
```bash
ps aux | grep node
```

2. 限制 Node.js 内存：
```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

### 日志文件过大

清理旧日志：
```bash
bash scripts/logs.sh clean 7
```

轮转日志：
```bash
bash scripts/logs.sh rotate
```

## 性能优化

### 生产环境建议

1. 使用 `next start` 而不是 `next dev`
2. 启用 gzip 压缩
3. 使用 CDN 加速静态资源
4. 配置数据库连接池
5. 启用 Redis 缓存

### 监控建议

1. 定期检查 `/api/health`
2. 监控内存和 CPU 使用
3. 设置日志告警阈值
4. 配置错误通知（邮件、Slack 等）
