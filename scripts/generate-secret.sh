#!/bin/bash

# 生成安全的 NextAuth Secret 密钥

echo "🔐 生成 NextAuth Secret 密钥..."
echo ""

# 使用 openssl 生成随机密钥
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    echo "✅ 使用 openssl 生成密钥:"
    echo ""
    echo "NEXTAUTH_SECRET=\"$SECRET\""
    echo ""
else
    # 使用 node 生成
    if command -v node &> /dev/null; then
        SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
        echo "✅ 使用 Node.js 生成密钥:"
        echo ""
        echo "NEXTAUTH_SECRET=\"$SECRET\""
        echo ""
    else
        echo "❌ 未找到 openssl 或 node，请手动生成密钥"
        echo ""
        echo "方法 1: 使用 openssl"
        echo "   openssl rand -base64 32"
        echo ""
        echo "方法 2: 使用 Node.js"
        echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
        echo ""
        exit 1
    fi
fi

# 询问是否更新 .env.local
echo "是否更新 .env.local 文件？(y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if [ -f ".env.local" ]; then
        # 备份原文件
        cp .env.local .env.local.backup
        echo "📁 已备份原文件：.env.local.backup"
        
        # 更新 NEXTAUTH_SECRET
        if sed -i.bak "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local; then
            echo "✅ 已更新 .env.local 文件"
            echo ""
            echo "📝 新的配置:"
            grep "NEXTAUTH_SECRET" .env.local
        else
            # macOS 兼容性
            sed -i '' "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
            echo "✅ 已更新 .env.local 文件"
            echo ""
            echo "📝 新的配置:"
            grep "NEXTAUTH_SECRET" .env.local
        fi
    else
        echo "❌ .env.local 文件不存在"
        echo "请先创建 .env.local 文件"
    fi
else
    echo ""
    echo "💡 提示：将上面的 NEXTAUTH_SECRET 值复制到 .env.local 文件中"
fi

echo ""
echo "🎉 完成！"
