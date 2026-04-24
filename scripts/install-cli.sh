#!/bin/bash

# Blog CLI 安装脚本

set -e

echo ""
echo "======================================"
echo "  Blog CLI 安装向导"
echo "======================================"
echo ""

# 检测操作系统
if [[ "$OSTYPE" == "darwin"*" ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    echo "⚠ 未检测到支持的操作系统"
    exit 1
fi

echo "✓ 检测到操作系统：$OS"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "✗ 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js 已安装：$(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠ pnpm 未安装，正在安装..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    source ~/.bashrc 2>/dev/null || true
fi
echo "✓ pnpm 已安装：$(pnpm -v)"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠ PM2 未安装，正在安装..."
    npm install -g pm2
fi
echo "✓ PM2 已安装：$(pm2 -v)"

# 创建符号链接
PROJECT_ROOT=$(pwd)
CLI_PATH="$PROJECT_ROOT/scripts/blog-cli.js"
INSTALL_PATH="/usr/local/bin/blog"

echo ""
echo "正在安装 Blog CLI..."

# macOS
if [[ "$OS" == "macos" ]]; then
    # 创建符号链接
    sudo ln -sf "$CLI_PATH" "$INSTALL_PATH"
    sudo chmod +x "$INSTALL_PATH"
    
# Linux
elif [[ "$OS" == "linux" ]]; then
    # 创建符号链接
    sudo ln -sf "$CLI_PATH" "$INSTALL_PATH"
    sudo chmod +x "$INSTALL_PATH"
fi

echo ""
echo "======================================"
echo "  ✅ 安装完成！"
echo "======================================"
echo ""
echo "现在可以使用 blog 命令了！"
echo ""
echo "快速开始："
echo "  blog              # 交互式菜单"
echo "  blog deploy       # 一键部署"
echo "  blog monitor      # 实时监控 API"
echo "  blog help         # 查看帮助"
echo ""
echo "======================================"
echo ""

# 测试安装
if command -v blog &> /dev/null; then
    echo "✓ 验证成功：blog 命令可用"
    echo ""
    echo "运行 blog help 查看完整帮助"
else
    echo "⚠ 安装可能未成功，请手动添加路径："
    echo "  export PATH=$PROJECT_ROOT/scripts:\$PATH"
    echo ""
    echo "添加到 ~/.bashrc 或 ~/.zshrc 使其永久生效"
fi

echo ""
