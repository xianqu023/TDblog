#!/bin/bash

# ============================================
# 安装博客平台快捷命令
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOG_SCRIPT="$SCRIPT_DIR/blog"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}          安装博客平台快捷命令                        ${BLUE}║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检测 Shell 类型
SHELL_NAME=$(basename $SHELL)
echo -e "${YELLOW}检测到 Shell: ${SHELL_NAME}${NC}"

# 创建符号链接到 /usr/local/bin
if [ -w "/usr/local/bin" ]; then
    echo -e "${BLUE}正在安装到 /usr/local/bin...${NC}"
    
    # 删除旧的链接（如果存在）
    if [ -L "/usr/local/bin/blog" ]; then
        sudo rm -f /usr/local/bin/blog
    fi
    
    # 创建新链接
    sudo ln -s "$BLOG_SCRIPT" /usr/local/bin/blog
    
    echo -e "${GREEN}✓ 安装成功！${NC}"
    echo ""
    echo -e "${BLUE}使用方法：${NC}"
    echo "  blog          # 打开交互式菜单"
    echo "  blog 1        # 完整部署"
    echo "  blog 3        # 环境检查"
    echo "  blog 10       # 查看日志"
    echo ""
else
    echo -e "${YELLOW}⚠ 没有 /usr/local/bin 写入权限${NC}"
    echo ""
    echo -e "${BLUE}请选择安装方式：${NC}"
    echo ""
    echo "  1) 使用 sudo 安装到 /usr/local/bin（推荐）"
    echo "  2) 安装到 ~/bin 目录"
    echo "  3) 手动配置（添加到 PATH）"
    echo "  4) 取消安装"
    echo ""
    read -p "请选择 (1-4): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}正在使用 sudo 安装...${NC}"
            sudo ln -s "$BLOG_SCRIPT" /usr/local/bin/blog
            echo -e "${GREEN}✓ 安装成功！${NC}"
            ;;
        2)
            mkdir -p ~/bin
            cp "$BLOG_SCRIPT" ~/bin/blog
            chmod +x ~/bin/blog
            
            # 检查 ~/.bashrc 或 ~/.zshrc 是否包含 ~/bin
            if [[ "$SHELL_NAME" == "zsh" ]]; then
                RC_FILE="$HOME/.zshrc"
            else
                RC_FILE="$HOME/.bashrc"
            fi
            
            if ! grep -q 'export PATH="$HOME/bin:$PATH"' "$RC_FILE" 2>/dev/null; then
                echo "" >> "$RC_FILE"
                echo 'export PATH="$HOME/bin:$PATH"' >> "$RC_FILE"
                echo -e "${YELLOW}⚠ 已添加到 $RC_FILE，请运行以下命令使其生效：${NC}"
                echo "   source $RC_FILE"
            else
                echo -e "${GREEN}✓ 安装成功！${NC}"
            fi
            ;;
        3)
            echo ""
            echo -e "${BLUE}请手动将以下路径添加到您的 PATH 环境变量：${NC}"
            echo ""
            echo "   $SCRIPT_DIR"
            echo ""
            echo "添加到 ~/.zshrc 或 ~/.bashrc："
            echo "   export PATH=\"$SCRIPT_DIR:\$PATH\""
            echo ""
            ;;
        4)
            echo -e "${YELLOW}已取消安装${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效的选择${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}安装完成！${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}现在您可以使用：${NC}"
echo "  ${GREEN}blog${NC}          # 打开交互式菜单"
echo "  ${GREEN}blog 1${NC}        # 完整部署"
echo "  ${GREEN}blog 3${NC}        # 环境检查"
echo "  ${GREEN}blog 7${NC}        # 启动服务"
echo "  ${GREEN}blog 9${NC}        # 重启服务"
echo "  ${GREEN}blog 10${NC}       # 查看日志"
echo "  ${GREEN}blog 11${NC}       # 清理缓存"
echo ""
echo -e "${YELLOW}提示：安装完成后需要重新打开终端或运行 source ~/.zshrc (或 ~/.bashrc)${NC}"
echo ""
