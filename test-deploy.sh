#!/bin/bash

# ============================================
# 快速测试脚本
# ============================================

set -e

cd /Volumes/文档/blog

echo "========================================"
echo "测试环境检查"
echo "========================================"

# 检查 Node.js
echo "Node.js 版本：$(node -v)"

# 检查 pnpm
echo "pnpm 版本：$(pnpm -v)"

# 检查 Git
echo "Git 版本：$(git --version | head -1)"

# 检查磁盘空间
echo "可用磁盘空间：$(df -h . | tail -1 | awk '{print $4}')"

echo ""
echo "========================================"
echo "✅ 环境检查通过"
echo "========================================"

echo ""
echo "========================================"
echo "测试数据库配置"
echo "========================================"

# 检查数据库目录
if [ -d "packages/database/prisma" ]; then
  echo "✓ Prisma 目录存在"
else
  echo "✗ Prisma 目录不存在"
  mkdir -p packages/database/prisma
  echo "✓ 已创建 Prisma 目录"
fi

# 检查数据库文件
if [ -f "packages/database/prisma/blog.db" ]; then
  echo "✓ 数据库文件存在"
else
  echo "⚠ 数据库文件不存在（将在部署时创建）"
fi

echo ""
echo "========================================"
echo "测试构建产物"
echo "========================================"

# 检查 standalone 目录
if [ -d "apps/web/.next/standalone" ]; then
  echo "✓ Standalone 目录存在"
  echo "  大小：$(du -sh apps/web/.next/standalone 2>/dev/null | cut -f1)"
else
  echo "⚠ Standalone 目录不存在（需要运行构建）"
fi

# 检查 static 目录
if [ -d "apps/web/.next/static" ]; then
  echo "✓ Static 目录存在"
  echo "  大小：$(du -sh apps/web/.next/static 2>/dev/null | cut -f1)"
else
  echo "⚠ Static 目录不存在（需要运行构建）"
fi

echo ""
echo "========================================"
echo "测试服务状态"
echo "========================================"

# 检查端口占用
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "⚠ 端口 3000 被占用 (PID: $(lsof -ti:3000))"
else
  echo "✓ 端口 3000 可用"
fi

# 检查 PM2 进程
if command -v pm2 > /dev/null 2>&1; then
  echo "PM2 进程状态:"
  pm2 status blog-platform 2>/dev/null || echo "  未运行"
else
  echo "⚠ PM2 未安装"
fi

echo ""
echo "========================================"
echo "✅ 所有测试完成！"
echo "========================================"
echo ""
echo "下一步操作:"
echo "  1. 运行完整部署：bash deploy.sh full"
echo "  2. 运行交互式菜单：bash deploy.sh"
echo "  3. 查看使用指南：cat DEPLOYMENT_GUIDE.md"
echo ""
