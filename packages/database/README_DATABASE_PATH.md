# 数据库路径配置指南

## 🎯 问题解决

本次优化解决了以下问题：

1. ✅ **构建时数据库路径错误** - 使用绝对路径替代相对路径
2. ✅ **部署后数据库文件找不到** - 自动检测运行环境并设置正确路径
3. ✅ **服务器无法连接数据库** - 确保数据库目录自动创建
4. ✅ **注册登录失败** - 数据库连接稳定可靠

## 📁 数据库路径管理

### 核心改进

#### 1. 智能路径检测 (`packages/database/src/db-path.ts`)

```typescript
import { getDatabasePath, ensureDatabaseDirectory } from '@blog/database';

// 自动检测环境并返回正确的数据库路径
const dbPath = getDatabasePath();
// 输出示例:
// 开发环境：file:/home/user/blog/packages/database/prisma/blog.db
// 生产环境：file:/data/blog.db (来自环境变量)
// Standalone: file:/app/.next/standalone/database/prisma/blog.db

// 确保数据库目录存在
await ensureDatabaseDirectory(dbPath);
```

#### 2. 自动环境检测

系统会自动检测以下环境：

- **开发环境** - 使用项目目录下的数据库
- **生产环境 (Standalone)** - 使用 `.next/standalone` 目录
- **生产环境 (Binary)** - 使用 `dist-binary` 目录
- **自定义环境** - 使用 `DATABASE_URL` 环境变量

## 🔧 配置方法

### 方法 1: 使用 conf.ini (推荐)

```ini
[database]
# 相对路径会自动转换为绝对路径
url = file:./packages/database/prisma/blog.db
# 或绝对路径
# url = file:/data/blog.db
```

### 方法 2: 使用环境变量

```bash
# 开发环境
DATABASE_URL=file:./packages/database/prisma/blog.db

# 生产环境（服务器）
DATABASE_URL=file:/data/blog.db

# 远程数据库（PostgreSQL/MySQL/Turso）
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_URL=libsql://your-db.turso.io
```

### 方法 3: 代码中配置

```typescript
import { getDatabasePath } from '@blog/database';

// 自定义路径
process.env.DATABASE_URL = 'file:/custom/path/blog.db';
const dbPath = getDatabasePath(); // => "file:/custom/path/blog.db"
```

## 📊 路径转换规则

### 自动转换

| 输入路径 | 项目根目录 | 输出路径 |
|---------|-----------|---------|
| `file:./prisma/blog.db` | `/home/user/blog` | `file:/home/user/blog/prisma/blog.db` |
| `file:packages/database/prisma/blog.db` | `/home/user/blog` | `file:/home/user/blog/packages/database/prisma/blog.db` |
| `file:/data/blog.db` | 任意 | `file:/data/blog.db` (不变) |
| `postgresql://...` | 任意 | `postgresql://...` (不变) |

### 环境特定路径

#### 开发环境
```
工作目录：/home/user/blog
数据库路径：file:/home/user/blog/packages/database/prisma/blog.db
```

#### Standalone 部署
```
工作目录：/app/.next/standalone
数据库路径：file:/app/.next/standalone/database/prisma/blog.db
```

#### PM2 部署
```
工作目录：/var/www/blog
数据库路径：file:/var/www/blog/packages/database/prisma/blog.db
```

## 🚀 部署指南

### 1. Vercel 部署

```bash
# 在 Vercel 环境变量中设置
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 2. Docker 部署

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 创建数据库目录
RUN mkdir -p /app/data

# 设置环境变量
ENV DATABASE_URL=file:/app/data/blog.db
ENV PROJECT_ROOT=/app

COPY . .

RUN pnpm install && pnpm build

CMD ["pnpm", "start"]
```

### 3. PM2 部署

```bash
# 1. 配置 conf.ini
cat > conf.ini << EOF
[database]
url = file:/var/www/blog/packages/database/prisma/blog.db

[server]
port = 3000
node_env = production
EOF

# 2. 加载配置
node scripts/config-loader.js

# 3. 启动服务
pm2 start ecosystem.config.js
```

### 4. 二进制部署

```bash
# 数据库文件会自动放在 dist-binary 目录
DATABASE_URL=file:./dist-binary/packages/database/prisma/blog.db
```

## 🔍 调试工具

### 检查数据库路径

```typescript
import { getDatabasePathInfo } from '@blog/database';

const info = getDatabasePathInfo();
console.log(info);
// 输出:
// {
//   environment: 'production-standalone',
//   cwd: '/app/.next/standalone',
//   databaseUrl: 'file:/app/.next/standalone/database/prisma/blog.db',
//   hasEnvVar: false
// }
```

### 日志输出

启动时会看到详细日志：

```
[Database] Environment: production
[Database] DATABASE_URL env: true
[Database] Connecting to: file:/data/blog.db
[Database] Using better-sqlite3 adapter for local database
[DB Path] 数据库目录已确保存在：/data
```

## ⚠️ 常见问题

### 问题 1: 数据库文件不存在

**症状**: 启动时报错 "unable to open database file"

**解决**:
```bash
# 手动创建数据库目录
mkdir -p /path/to/database/prisma

# 或使用自动创建（已集成）
# 系统会自动调用 ensureDatabaseDirectory()
```

### 问题 2: 路径权限问题

**症状**: "Permission denied"

**解决**:
```bash
# 修改目录权限
chmod 755 /path/to/database
chown -R node:node /path/to/database
```

### 问题 3: 构建后路径错误

**症状**: 开发环境正常，构建后找不到数据库

**解决**:
```bash
# 确保使用绝对路径
# 在 conf.ini 中:
url = file:/absolute/path/to/blog.db

# 或使用环境变量
export DATABASE_URL=file:/absolute/path/to/blog.db
```

### 问题 4: 多实例部署数据不同步

**症状**: 多个 PM2 实例数据不一致

**解决**: 使用共享数据库
```bash
# 使用 PostgreSQL/MySQL 等中心数据库
DATABASE_URL=postgresql://user:password@db-host:5432/blog

# 或使用共享文件存储（NFS 等）
DATABASE_URL=file:/shared/storage/blog.db
```

## 📝 最佳实践

### ✅ 推荐

1. **开发环境使用相对路径**
   ```ini
   [database]
   url = file:./packages/database/prisma/blog.db
   ```

2. **生产环境使用绝对路径或环境变量**
   ```bash
   DATABASE_URL=file:/var/www/blog/database.db
   ```

3. **使用远程数据库（推荐用于云部署）**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

4. **定期备份数据库文件**
   ```bash
   cp /path/to/blog.db /backup/blog.db.$(date +%Y%m%d)
   ```

### ❌ 避免

1. **硬编码相对路径**
   ```typescript
   // ❌ 错误
   const dbPath = './prisma/blog.db';
   
   // ✅ 正确
   const dbPath = getDatabasePath();
   ```

2. **在代码中写死路径**
   ```typescript
   // ❌ 错误
   DATABASE_URL = '/home/user/blog/db.db';
   
   // ✅ 正确
   DATABASE_URL = process.env.DATABASE_URL || getDatabasePath();
   ```

## 📦 环境变量参考

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接 URL | `file:/data/blog.db` |
| `DATABASE_PROVIDER` | 数据库类型 | `sqlite`, `postgresql`, `mysql` |
| `DATABASE_AUTH_TOKEN` | 远程数据库认证 Token | `your-token` |
| `DATABASE_READ_URL` | 读库 URL（读写分离） | `file:/data/read.db` |
| `DATABASE_WRITE_URL` | 写库 URL（读写分离） | `file:/data/write.db` |
| `PROJECT_ROOT` | 项目根目录 | `/var/www/blog` |

## 🎉 验证

部署后运行以下命令验证：

```bash
# 1. 检查数据库连接
node -e "const {prisma} = require('@blog/database'); prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ 数据库连接成功'))"

# 2. 检查数据库路径
node -e "const {getDatabasePathInfo} = require('@blog/database'); console.log(getDatabasePathInfo())"

# 3. 测试注册功能
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","username":"test"}'
```

数据库路径配置完成！现在您的应用应该可以在任何环境下正常连接数据库了。🚀
