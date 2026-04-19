#!/bin/bash

# Blog Platform - 日志管理脚本
# 用于日志轮转、清理和统计

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/..

LOG_DIR="logs"
MAX_LOG_SIZE="100M"  # 单个日志文件最大大小
MAX_LOG_AGE=30       # 日志保留天数

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Blog Platform 日志管理${NC}"
echo -e "${GREEN}========================================${NC}"

case "${1:-status}" in
    status)
        echo -e "${YELLOW}日志统计:${NC}"
        echo ""
        
        # 总日志大小
        TOTAL_SIZE=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)
        echo -e "日志总大小: ${GREEN}$TOTAL_SIZE${NC}"
        
        # 日志文件数量
        FILE_COUNT=$(find "$LOG_DIR" -name "*.log" 2>/dev/null | wc -l)
        echo -e "日志文件数: ${GREEN}$FILE_COUNT${NC}"
        
        # 超过 30 天的日志
        OLD_LOGS=$(find "$LOG_DIR" -name "*.log" -mtime +30 2>/dev/null | wc -l)
        echo -e "超过 30 天的日志: ${YELLOW}$OLD_LOGS${NC}"
        
        echo ""
        echo -e "${YELLOW}日志目录结构:${NC}"
        du -sh "$LOG_DIR"/* 2>/dev/null || echo "无日志文件"
        ;;
    
    clean)
        DAYS="${2:-30}"
        echo -e "${YELLOW}清理 $DAYS 天前的日志...${NC}"
        
        DELETED=$(find "$LOG_DIR" -name "*.log" -mtime +$DAYS -delete -print 2>/dev/null | wc -l)
        echo -e "${GREEN}已删除 $DELETED 个日志文件${NC}"
        ;;
    
    rotate)
        echo -e "${YELLOW}轮转日志...${NC}"
        
        # 创建备份目录
        BACKUP_DIR="$LOG_DIR/backup/$(date +%Y%m%d)"
        mkdir -p "$BACKUP_DIR"
        
        # 移动当前日志
        find "$LOG_DIR" -name "*.log" -type f | while read -r file; do
            if [ -f "$file" ]; then
                BASENAME=$(basename "$file")
                mv "$file" "$BACKUP_DIR/$BASENAME"
                touch "$file"
                echo -e "${GREEN}已轮转: $BASENAME${NC}"
            fi
        done
        
        echo -e "${GREEN}日志轮转完成${NC}"
        ;;
    
    clear)
        echo -e "${RED}警告: 这将清空所有日志!${NC}"
        read -p "确认? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            find "$LOG_DIR" -name "*.log" -type f -exec truncate -s 0 {} \;
            echo -e "${GREEN}所有日志已清空${NC}"
        fi
        ;;
    
    analyze)
        echo -e "${YELLOW}日志分析:${NC}"
        echo ""
        
        # 错误统计
        ERROR_COUNT=$(grep -r "ERROR\|Error\|error" "$LOG_DIR" --include="*.log" 2>/dev/null | wc -l)
        echo -e "错误数量: ${RED}$ERROR_COUNT${NC}"
        
        # 最常见的错误
        echo ""
        echo -e "${YELLOW}最常见的错误 (Top 10):${NC}"
        grep -r "ERROR\|Error" "$LOG_DIR" --include="*.log" 2>/dev/null | \
            sed 's/.*[Ee]rror: //' | \
            sort | uniq -c | sort -rn | head -10
        ;;
    
    *)
        echo -e "用法: $0 {status|clean [天数]|rotate|clear|analyze}"
        exit 1
        ;;
esac
