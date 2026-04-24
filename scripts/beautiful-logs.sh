#!/bin/bash

# ============================================
# 美化日志查看脚本
# 显示：访问页面、API 请求、错误信息、访问时间、加载时间
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 图标
ICON_PAGE="📄"
ICON_API="🔌"
ICON_ERROR="❌"
ICON_SUCCESS="✅"
ICON_WARN="⚠️"
ICON_TIME="⏱️"
ICON_CLOCK="🕐"

# 格式化时间
format_time() {
    local timestamp="$1"
    if [[ "$timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2} ]]; then
        echo -e "${CYAN}${timestamp}${NC}"
    else
        echo -e "${CYAN}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    fi
}

# 格式化加载时间
format_duration() {
    local duration="$1"
    if [[ -z "$duration" ]]; then
        return
    fi
    
    # 移除 ms 后缀
    duration="${duration%ms}"
    
    if (( $(echo "$duration < 100" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${GREEN}${duration}ms${NC}"
    elif (( $(echo "$duration < 500" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}${duration}ms${NC}"
    else
        echo -e "${RED}${duration}ms${NC}"
    fi
}

# 解析并美化日志行
parse_log_line() {
    local line="$1"
    
    # 跳过空行
    [[ -z "$line" ]] && return
    
    # 提取时间戳
    local timestamp=""
    if [[ "$line" =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2}\ [0-9]{2}:[0-9]{2}:[0-9]{2}) ]]; then
        timestamp="${BASH_REMATCH[1]}"
        line="${line#$timestamp: }"
    fi
    
    # 检测错误
    if [[ "$line" =~ [Ee]rror:|[Ff]ailed|Exception|prisma:error ]]; then
        echo -e "${RED}${ICON_ERROR} $(format_time "$timestamp")${NC}"
        echo -e "   ${RED}错误：${line}${NC}"
        echo ""
        return
    fi
    
    # 检测 API 请求 (GET, POST, PUT, DELETE)
    if [[ "$line" =~ (GET|POST|PUT|DELETE)\ (/[^ ]*)\ ([0-9]+)\ ([0-9]+ms) ]]; then
        local method="${BASH_REMATCH[1]}"
        local path="${BASH_REMATCH[2]}"
        local status="${BASH_REMATCH[3]}"
        local duration="${BASH_REMATCH[4]}"
        
        # 根据状态码选择颜色
        local status_color=""
        local icon=""
        if [[ "$status" =~ ^2 ]]; then
            status_color="${GREEN}"
            icon="${ICON_SUCCESS}"
        elif [[ "$status" =~ ^3 ]]; then
            status_color="${BLUE}"
            icon="${ICON_PAGE}"
        elif [[ "$status" =~ ^4 ]]; then
            status_color="${YELLOW}"
            icon="${ICON_WARN}"
        else
            status_color="${RED}"
            icon="${ICON_ERROR}"
        fi
        
        # 根据方法选择颜色
        local method_color=""
        case "$method" in
            GET) method_color="${BLUE}" ;;
            POST) method_color="${GREEN}" ;;
            PUT) method_color="${YELLOW}" ;;
            DELETE) method_color="${RED}" ;;
        esac
        
        echo -e "${ICON_API} $(format_time "$timestamp")"
        echo -e "   ${method_color}${method}${NC} ${path}"
        echo -e "   状态：${status_color}${status}${NC}  |  ${ICON_TIME} 加载：$(format_duration "$duration")"
        echo ""
        return
    fi
    
    # 检测页面访问
    if [[ "$line" =~ "GET" && "$line" =~ "^/" && ! "$line" =~ "/api/" ]]; then
        echo -e "${ICON_PAGE} $(format_time "$timestamp")"
        echo -e "   ${WHITE}页面访问：${line}${NC}"
        echo ""
        return
    fi
    
    # 检测警告
    if [[ "$line" =~ [Ww]arning:|[Ww]arn ]]; then
        echo -e "${YELLOW}${ICON_WARN} $(format_time "$timestamp")${NC}"
        echo -e "   ${YELLOW}警告：${line}${NC}"
        echo ""
        return
    fi
    
    # 检测服务器启动信息
    if [[ "$line" =~ "Ready" || "$line" =~ "started" || "$line" =~ "Listening" ]]; then
        echo -e "${GREEN}${ICON_SUCCESS} $(format_time "$timestamp")${NC}"
        echo -e "   ${GREEN}${line}${NC}"
        echo ""
        return
    fi
    
    # 其他日志
    if [[ -n "$timestamp" ]]; then
        echo -e "ℹ️  $(format_time "$timestamp")"
        echo -e "   ${WHITE}${line}${NC}"
        echo ""
    fi
}

# 主函数
main() {
    local log_file="${1:-logs/pm2-out.log}"
    local lines="${2:-100}"
    local follow="${3:-false}"
    
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}              📊 博客平台 - 美化日志查看              ${BLUE}║${NC}"
    echo -e "${BLUE}╠═══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  ${ICON_PAGE} 页面访问  ${ICON_API} API 请求  ${ICON_ERROR} 错误信息  ${ICON_TIME} 加载时间          ${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}错误：日志文件不存在：$log_file${NC}"
        exit 1
    fi
    
    if [ "$follow" = "true" ]; then
        echo -e "${YELLOW}实时日志追踪中... (按 Ctrl+C 退出)${NC}"
        echo ""
        tail -f "$log_file" | while read -r line; do
            parse_log_line "$line"
        done
    else
        echo -e "${CYAN}显示最近 ${lines} 行日志：${NC}"
        echo ""
        tail -n "$lines" "$log_file" | while read -r line; do
            parse_log_line "$line"
        done
    fi
}

# 显示帮助
show_help() {
    echo ""
    echo -e "${BLUE}用法：${NC}"
    echo "  $0 [日志文件] [行数] [是否实时追踪]"
    echo ""
    echo -e "${BLUE}示例：${NC}"
    echo "  $0 logs/pm2-out.log 100          # 查看最近 100 行"
    echo "  $0 logs/pm2-out.log 50           # 查看最近 50 行"
    echo "  $0 logs/pm2-out.log 100 true     # 实时追踪日志"
    echo "  $0 logs/pm2-error.log 50         # 查看错误日志"
    echo ""
    echo -e "${BLUE}快捷命令：${NC}"
    echo "  blog logs                        # 查看实时日志（美化版）"
    echo ""
}

# 检查参数
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# 执行主函数
main "$@"
