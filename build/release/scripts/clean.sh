#!/bin/bash

# =============================================================================
# 清理构建缓存和临时文件脚本
# =============================================================================

echo "🧹 开始清理构建缓存和临时文件..."

# 清理 Next.js 构建缓存
echo "📦 清理 .next 构建缓存..."
rm -rf apps/web/.next
rm -rf apps/web/.turbo

# 清理 Turborepo 缓存
echo "🗑️  清理 Turborepo 缓存..."
rm -rf .turbo
rm -rf node_modules/.cache

# 清理 Prisma 生成文件
echo "🗄️  清理 Prisma 生成文件..."
rm -rf node_modules/.prisma

# 清理 TypeScript 构建缓存
echo "🔧 清理 TypeScript 缓存..."
find . -name "tsconfig.tsbuildinfo" -type f -delete

# 清理 ESLint 缓存
echo "🔍 清理 ESLint 缓存..."
rm -rf .eslintcache

# 清理临时文件和日志
echo "📝 清理临时文件和日志..."
rm -rf *.log
rm -rf apps/web/*.log
rm -rf packages/database/*.log
find . -name "*.log" -type f -delete

# 清理测试覆盖率报告
echo "📊 清理测试报告..."
rm -rf coverage
rm -rf apps/web/coverage
rm -rf packages/database/coverage

# 清理 source maps（如果存在）
echo "🗺️  清理 source maps..."
find . -name "*.map" -type f -delete

# 清理开发环境的 node_modules（保留根目录的）
echo "📁 清理开发依赖..."
# 注意：不删除 node_modules，因为生产构建需要

echo "✅ 清理完成！"
