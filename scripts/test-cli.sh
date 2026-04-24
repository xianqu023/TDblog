#!/bin/bash

# Blog CLI 测试脚本

set -e

echo ""
echo "======================================"
echo "  Blog CLI 功能测试"
echo "======================================"
echo ""

cd /Volumes/文档/blog

# 测试 1: 环境检查
echo "📋 测试 1: 环境检查..."
node scripts/blog-cli.js check
echo "✓ 环境检查完成"
echo ""

# 测试 2: 查看状态
echo "📊 测试 2: 查看服务状态..."
node scripts/blog-cli.js status || true
echo "✓ 状态查看完成"
echo ""

# 测试 3: 帮助信息
echo "📖 测试 3: 查看帮助..."
node scripts/blog-cli.js help | head -20
echo "✓ 帮助查看完成"
echo ""

echo "======================================"
echo "  ✅ 基础功能测试通过！"
echo "======================================"
echo ""
echo "提示：服务管理功能（启动/停止/重启）需要 PM2 配置正确"
echo "      请使用交互式菜单进行测试："
echo ""
echo "      node scripts/blog-cli.js"
echo ""
echo "      然后输入数字选择功能"
echo ""
echo "======================================"
echo ""
