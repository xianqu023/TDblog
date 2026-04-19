# Vercel 一键部署方案

## 📋 目录

- [部署架构](#部署架构)
- [前置准备](#前置准备)
- [Vercel 部署步骤](#vercel-部署步骤)
- [Cloudflare 全球加速配置](#cloudflare-全球加速配置)
- [环境变量配置](#环境变量配置)
- [数据库配置](#数据库配置)
- [日常开发流程](#日常开发流程)
- [常见问题](#常见问题)

---

## 部署架构

```
用户访问
    ↓
Cloudflare DNS (域名解析)
    ↓
Cloudflare CDN (全球加速 + 缓存)
    ↓
Vercel Edge Network (应用服务器)
    ↓
PostgreSQL 数据库 (外部数据库服务)
```

### 技术栈

- **前端框架**: Next.js 16.2.4 + Turbopack
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **部署平台**: Vercel
- **CDN**: Cloudflare
- **国际化**: next-intl
- **AI 功能**: OpenAI API 集成

---

## 前置准备

### 1. 注册账号

- [GitHub](https://github.com) - 代码托管
- [Vercel](https://vercel.com) - 应用部署（支持 GitHub 账号登录）
- [Cloudflare](https://cloudflare.com) - DNS 和 CDN（可选）

### 2. 准备数据库

你需要一个 PostgreSQL 数据库，可以选择以下服务：

#### 推荐：Neon（免费）

1. 访问 https://neon.tech
2. 使用 GitHub 账号登录
3. 创建新项目
4. 复制数据库连接字符串，格式：
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

#### 其他选项

- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Render**: https://render.com

### 3. 生成 NextAuth Secret

```bash
# 在终端中运行
openssl rand -base64 32
```

复制生成的字符串，稍后配置环境变量时使用。

---

## Vercel 部署步骤

### 第一步：连接 GitHub 仓库

1. 打开 https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择你的仓库 `TDblog`
4. 点击 **Import**

### 第二步：配置项目设置

在 Vercel 项目配置页面，设置以下参数：

#### Build Settings

```
Framework Preset:    Next.js
Root Directory:      apps/web
Build Command:       cd ../.. && pnpm install && cd packages/database && npx prisma generate && cd ../.. && cd apps/web && npx next build
Output Directory:    .next
Install Command:     pnpm install
```

#### Environment Variables

点击 **Environment Variables** 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | 数据库连接字符串 |
| `NEXTAUTH_SECRET` | `随机字符串` | NextAuth 加密密钥 |
| `NEXTAUTH_URL` | `https://your-domain.com` | 网站地址 |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | 网站公开地址 |
| `NEXT_PUBLIC_SITE_NAME` | `你的网站名称` | 网站名称 |

### 第三步：部署

1. 点击 **Deploy** 按钮
2. 等待构建完成（约 3-5 分钟）
3. 访问 Vercel 提供的临时域名测试

---

## Cloudflare 全球加速配置

### 第一步：添加域名到 Cloudflare

1. 登录 Cloudflare Dashboard
2. 点击 **Add a Domain**
3. 输入你的域名（例如：`042617.xyz`）
4. 按照提示修改域名注册商的 DNS 服务器

### 第二步：配置 DNS 记录

在 Cloudflare DNS 设置中添加：

| Type | Name | Target | Proxy Status |
|------|------|--------|--------------|
| CNAME | @ | `cname.vercel-dns.com` | Proxied (橙色云朵) |
| CNAME | www | `cname.vercel-dns.com` | Proxied (橙色云朵) |

### 第三步：在 Vercel 添加自定义域名

1. 打开 Vercel 项目
2. 进入 **Settings → Domains**
3. 点击 **Add**
4. 输入你的域名（例如：`042617.xyz`）
5. 点击 **Add**
6. Vercel 会自动验证 DNS 配置

### 第四步：更新环境变量

在 Vercel **Settings → Environment Variables** 中更新：

```
NEXTAUTH_URL=https://042617.xyz
NEXT_PUBLIC_SITE_URL=https://042617.xyz
```

### 第五步：重新部署

在 Vercel **Deployments** 页面点击 **Redeploy** 使环境变量生效。

---

## 环境变量配置

### 完整环境变量列表

创建 `.env.production` 文件（本地开发使用 `.env.local`）：

```bash
# ==================== 数据库配置 ====================
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# ==================== NextAuth 配置 ====================
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# ==================== 网站配置 ====================
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="你的网站名称"

# ==================== AI 配置（可选）====================
OPENAI_API_KEY="sk-xxx"
OPENAI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-3.5-turbo"

# ==================== 存储配置 ====================
# 使用本地存储（默认）
STORAGE_DRIVER="local"
UPLOAD_DIR="./uploads"

# 或使用阿里云 OSS（可选）
# STORAGE_DRIVER="oss"
# OSS_ACCESS_KEY_ID="your-access-key"
# OSS_ACCESS_KEY_SECRET="your-secret"
# OSS_BUCKET="your-bucket"
# OSS_REGION="oss-cn-hangzhou"

# 或使用 AWS S3（可选）
# STORAGE_DRIVER="s3"
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret"
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="your-bucket"

# ==================== 支付配置（可选）====================
# 支付宝
ALIPAY_APP_ID=""
ALIPAY_PRIVATE_KEY=""
ALIPAY_PUBLIC_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# PayPal
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
PAYPAL_MODE="sandbox"

# ==================== CDN 配置（可选）====================
CDN_BASE_URL="https://cdn.your-domain.com"
```

---

## 数据库配置

### 初始化数据库

部署完成后，需要初始化数据库表结构：

#### 方式一：使用 Vercel 部署后自动运行（推荐）

在 `package.json` 中添加 postinstall 脚本：

```json
{
  "scripts": {
    "postinstall": "cd packages/database && npx prisma generate && npx prisma db push"
  }
}
```

#### 方式二：手动运行

在 Vercel 项目设置中配置部署后命令，或本地运行：

```bash
# 生成 Prisma 客户端
cd packages/database
npx prisma generate

# 推送数据库表结构
npx prisma db push

# 填充示例数据（可选）
npx prisma db seed
```

### 创建管理员账号

部署完成后，通过网站注册第一个账号，系统会自动设置为管理员。

---

## 日常开发流程

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/xianqu023/TDblog.git
cd TDblog

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 4. 初始化数据库
cd packages/database
npx prisma generate
npx prisma db push

# 5. 启动开发服务器
cd ../..
pnpm dev
```

### 提交代码并自动部署

```bash
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交代码
git commit -m "feat: 添加新功能描述"

# 4. 推送到 GitHub
git push

# 5. Vercel 会自动检测并重新部署
#    你可以在 https://vercel.com 查看部署状态
```

### 部署流程

```
本地开发 → git push → GitHub → Vercel 自动构建 → 自动部署 → 全球 CDN 分发
```

**整个过程无需手动操作！**

---

## 常见问题

### Q1: 部署失败怎么办？

1. 查看 Vercel 构建日志
2. 检查环境变量是否正确配置
3. 确认数据库连接字符串有效
4. 检查 Node.js 版本兼容性

### Q2: 如何查看部署日志？

- Vercel Dashboard → 项目 → **Deployments** → 点击部署记录 → **Logs**

### Q3: 数据库连接失败？

1. 检查 `DATABASE_URL` 是否正确
2. 确认数据库允许外部访问
3. 检查 SSL 配置（Neon 等需要 `?sslmode=require`）

### Q4: 如何绑定自定义域名？

1. Vercel → Settings → Domains → Add
2. 输入你的域名
3. 按照提示配置 DNS（推荐使用 Cloudflare）

### Q5: Cloudflare 缓存导致更新不生效？

1. Cloudflare Dashboard → Caching → Configuration
2. 点击 **Purge Everything** 清除缓存
3. 或设置缓存规则排除动态内容

### Q6: 如何配置 HTTPS？

- Vercel 自动提供 HTTPS 证书
- Cloudflare 也提供免费的 SSL/TLS
- 建议同时开启两者的 HTTPS 支持

### Q7: 免费额度够用吗？

**Vercel 免费版**：
- ✅ 无限个人项目
- ✅ 每月 100GB 带宽
- ✅ 自动 HTTPS
- ✅ 全球 CDN

**Cloudflare 免费版**：
- ✅ 无限流量
- ✅ DDoS 防护
- ✅ 全球 CDN
- ✅ SSL 证书

对于个人博客网站，免费额度完全够用！

---

## 快速部署检查清单

部署前请确认：

- [ ] GitHub 仓库已推送代码
- [ ] PostgreSQL 数据库已创建
- [ ] 已获取数据库连接字符串
- [ ] 已生成 NEXTAUTH_SECRET
- [ ] Vercel 项目已创建并连接 GitHub
- [ ] 环境变量已配置
- [ ] 数据库表结构已初始化
- [ ] 自定义域名已配置（可选）
- [ ] Cloudflare DNS 已设置（可选）

---

## 技术支持

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 文档**: https://nextjs.org/docs
- **Prisma 文档**: https://www.prisma.io/docs
- **Cloudflare 文档**: https://developers.cloudflare.com

---

**最后更新**: 2026-04-19
