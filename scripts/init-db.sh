#!/bin/bash

# =============================================================================
# 数据库初始化脚本 - 用于 Vercel 部署后初始化数据库
# =============================================================================

echo "🚀 开始初始化数据库..."

# 进入数据库包目录
cd packages/database

# 检查 DATABASE_URL 是否设置
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误: DATABASE_URL 环境变量未设置"
    echo "请在 Vercel 项目设置中配置 DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL 已配置"

# 生成 Prisma 客户端
echo "📦 生成 Prisma 客户端..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma 客户端生成失败"
    exit 1
fi

echo "✅ Prisma 客户端生成成功"

# 推送数据库表结构
echo "🗄️ 推送数据库表结构..."
npx prisma db push --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ 数据库表结构推送失败"
    exit 1
fi

echo "✅ 数据库表结构推送成功"

# 询问是否填充示例数据
read -p "是否填充示例数据？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 填充示例数据..."
    npx prisma db seed
    
    if [ $? -ne 0 ]; then
        echo "⚠️ 示例数据填充失败（可选步骤，可忽略）"
    else
        echo "✅ 示例数据填充成功"
    fi
fi

echo ""
echo "🎉 数据库初始化完成！"
echo "📝 请通过网站注册第一个账号，系统会自动设置为管理员"
