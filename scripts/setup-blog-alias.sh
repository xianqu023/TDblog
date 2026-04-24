#!/bin/bash

# Blog 快捷命令安装脚本
# 添加到 shell 配置文件即可使用

set -e

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Blog 快捷命令配置${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# 获取项目根目录
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
CLI_SCRIPT="$PROJECT_ROOT/scripts/blog-cli.js"

# 检测 shell 类型
if [[ -f ~/.zshrc ]]; then
    SHELL_RC="~/.zshrc"
    SHELL_NAME="zsh"
elif [[ -f ~/.bashrc ]]; then
    SHELL_RC="~/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_RC="~/.profile"
    SHELL_NAME="bash"
fi

echo "✓ 检测到 Shell: $SHELL_NAME"
echo "✓ 配置文件：$SHELL_RC"
echo ""

# 创建别名配置
ALIAS_CONFIG="
# Blog CLI 快捷命令 (添加于 $(date +%Y-%m-%d))
alias blog='node $CLI_SCRIPT'
alias blogd='node $CLI_SCRIPT deploy'
alias blogs='node $CLI_SCRIPT start'
alias blogx='node $CLI_SCRIPT stop'
alias blogr='node $CLI_SCRIPT restart'
alias blogl='node $CLI_SCRIPT logs'
alias blogm='node $CLI_SCRIPT monitor'
alias blogc='node $CLI_SCRIPT check'
alias blogv='node $CLI_SCRIPT dev'
"

# 检查是否已存在
if grep -q "alias blog=" "$SHELL_RC" 2>/dev/null; then
    echo -e "${YELLOW}⚠ 已存在 blog 别名配置${NC}"
    echo "是否覆盖？(y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "已跳过"
        exit 0
    fi
    # 备份原文件
    cp "$SHELL_RC" "$SHELL_RC.backup.$(date +%Y%m%d)"
    echo "✓ 已备份原配置文件"
fi

# 添加到配置文件
echo "$ALIAS_CONFIG" >> ~/$SHELL_RC
echo -e "${GREEN}✓ 已添加到 $SHELL_RC${NC}"
echo ""

# 立即生效
echo "是否立即生效？(y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    source ~/$SHELL_RC 2>/dev/null || true
    echo -e "${GREEN}✓ 配置已生效${NC}"
    echo ""
    
    # 测试
    if command -v blog &> /dev/null; then
        echo -e "${GREEN}✓ blog 命令可用！${NC}"
        echo ""
        echo "现在可以使用："
        echo "  blog              # 交互式菜单"
        echo "  blog deploy       # 一键部署"
        echo "  blog monitor      # 实时监控"
        echo "  blog help         # 查看帮助"
    else
        echo -e "${YELLOW}⚠ 命令可能未正确加载${NC}"
        echo "请手动执行：source ~/$SHELL_RC"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠ 配置已添加，请手动执行以下命令使其生效：${NC}"
    echo "  source ~/$SHELL_RC"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  安装完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
