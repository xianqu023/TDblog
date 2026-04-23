#!/bin/bash

# =============================================================================
# 博客平台 - 快速打包脚本
# =============================================================================
# 使用方法:
#   ./quick-package.sh              # 快速打包当前构建
#   ./quick-package.sh --build      # 先构建再打包
#   ./quick-package.sh --deploy     # 打包部署包（包含部署脚本）
#   ./quick-package.sh --help       # 显示帮助
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 显示帮助
show_help() {
    echo "博客平台快速打包脚本"
    echo ""
    echo "用法：$0 [选项]"
    echo ""
    echo "选项:"
    echo "  --build      先构建再打包"
    echo "  --deploy     打包部署包（包含部署脚本和文档）"
    echo "  --source     打包源码包"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 快速打包现有构建"
    echo "  $0 --build            # 构建并打包"
    echo "  $0 --deploy           # 打包完整部署包"
    echo "  $0 --source           # 打包源码包"
}

# 获取版本号
get_version() {
    VERSION=$(node -p "require('./package.json').version")
    echo "$VERSION"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    export NODE_ENV=production
    
    cd "$PROJECT_ROOT/apps/web"
    pnpm run build
    
    log_success "项目构建完成"
}

# 打包部署包
package_deploy() {
    log_info "打包部署包..."
    
    VERSION=$(get_version)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PACKAGE_NAME="blog-platform-deploy-$VERSION-$TIMESTAMP"
    PACKAGE_DIR="$BUILD_DIR/$PACKAGE_NAME"
    
    # 创建目录
    mkdir -p "$PACKAGE_DIR"
    
    # 复制必要文件
    log_info "复制文件..."
    
    # 根目录文件
    cp package.json "$PACKAGE_DIR/"
    cp pnpm-lock.yaml "$PACKAGE_DIR/" 2>/dev/null || true
    cp pnpm-workspace.yaml "$PACKAGE_DIR/"
    cp turbo.json "$PACKAGE_DIR/"
    cp ecosystem.config.js "$PACKAGE_DIR/"
    
    # 部署脚本
    cp deploy.sh start.sh install.sh "$PACKAGE_DIR/"
    cp conf.ini.example nginx.conf.example blog-platform.service "$PACKAGE_DIR/"
    
    # 文档
    cp DEPLOY_GUIDE.md SERVER_README.md README.md "$PACKAGE_DIR/"
    
    # apps/web
    mkdir -p "$PACKAGE_DIR/apps/web"
    [ -d "apps/web/.next" ] && cp -r apps/web/.next "$PACKAGE_DIR/apps/web/"
    [ -d "apps/web/public" ] && cp -r apps/web/public "$PACKAGE_DIR/apps/web/"
    cp apps/web/package.json apps/web/next.config.ts "$PACKAGE_DIR/apps/web/" 2>/dev/null || true
    
    # packages/database
    mkdir -p "$PACKAGE_DIR/packages/database/prisma"
    cp packages/database/package.json "$PACKAGE_DIR/packages/database/" 2>/dev/null || true
    cp packages/database/prisma/schema.prisma "$PACKAGE_DIR/packages/database/prisma/"
    
    # 创建 README
    cat > "$PACKAGE_DIR/QUICKSTART.md" << EOF
# 博客平台 - 快速部署

版本：$VERSION
打包时间：$TIMESTAMP

## 快速开始

\`\`\`bash
# 1. 配置
cp conf.ini.example conf.ini
vim conf.ini  # 修改配置

# 2. 安装依赖
pnpm install

# 3. 部署
chmod +x deploy.sh
./deploy.sh
\`\`\`

## 或使用一键安装

\`\`\`bash
chmod +x install.sh
sudo ./install.sh
\`\`\`

## 查看文档

- 完整部署指南：\`DEPLOY_GUIDE.md\`
- 服务器使用说明：\`SERVER_README.md\`
EOF
    
    # 打包
    cd "$BUILD_DIR"
    tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
    
    # 创建校验
    sha256sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.sha256"
    md5sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.md5"
    
    log_success "部署包创建完成"
    log_info "文件：$BUILD_DIR/$PACKAGE_NAME.tar.gz"
    log_info "大小：$(du -h "$BUILD_DIR/$PACKAGE_NAME.tar.gz" | cut -f1)"
}

# 打包源码包
package_source() {
    log_info "打包源码包..."
    
    VERSION=$(get_version)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PACKAGE_NAME="blog-platform-source-$VERSION-$TIMESTAMP"
    PACKAGE_DIR="$BUILD_DIR/$PACKAGE_NAME"
    
    # 创建目录
    mkdir -p "$PACKAGE_DIR"
    
    # 复制源码（排除不必要的文件）
    log_info "复制源码..."
    
    rsync -av --progress \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.turbo' \
        --exclude='build' \
        --exclude='dist' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        . "$PACKAGE_DIR/"
    
    # 打包
    cd "$BUILD_DIR"
    tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
    
    # 创建校验
    sha256sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.sha256"
    md5sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.md5"
    
    log_success "源码包创建完成"
    log_info "文件：$BUILD_DIR/$PACKAGE_NAME.tar.gz"
    log_info "大小：$(du -h "$BUILD_DIR/$PACKAGE_NAME.tar.gz" | cut -f1)"
}

# 快速打包现有构建
package_existing() {
    log_info "打包现有构建..."
    
    VERSION=$(get_version)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PACKAGE_NAME="blog-platform-$VERSION-$TIMESTAMP"
    
    # 检查是否有构建文件
    if [ ! -d "apps/web/.next" ]; then
        log_error "未找到构建文件，请先运行构建或使用 --build 选项"
        exit 1
    fi
    
    # 创建目录
    mkdir -p "$BUILD_DIR/$PACKAGE_NAME"
    
    # 复制构建文件
    log_info "复制构建文件..."
    
    mkdir -p "$BUILD_DIR/$PACKAGE_NAME/apps/web"
    cp -r apps/web/.next "$BUILD_DIR/$PACKAGE_NAME/apps/web/"
    cp -r apps/web/public "$BUILD_DIR/$PACKAGE_NAME/apps/web/" 2>/dev/null || true
    
    # 打包
    cd "$BUILD_DIR"
    tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"
    
    # 创建校验
    sha256sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.sha256"
    md5sum "$PACKAGE_NAME.tar.gz" > "$PACKAGE_NAME.md5"
    
    log_success "构建包创建完成"
    log_info "文件：$BUILD_DIR/$PACKAGE_NAME.tar.gz"
    log_info "大小：$(du -h "$BUILD_DIR/$PACKAGE_NAME.tar.gz" | cut -f1)"
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "  博客平台快速打包"
    echo "========================================="
    echo ""
    
    # 解析参数
    BUILD_FIRST=false
    PACKAGE_TYPE="existing"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build)
                BUILD_FIRST=true
                shift
                ;;
            --deploy)
                PACKAGE_TYPE="deploy"
                shift
                ;;
            --source)
                PACKAGE_TYPE="source"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项：$1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 设置路径
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    BUILD_DIR="$PROJECT_ROOT/build"
    
    mkdir -p "$BUILD_DIR"
    
    # 执行
    if [ "$BUILD_FIRST" = true ]; then
        build_project
    fi
    
    case $PACKAGE_TYPE in
        deploy)
            package_deploy
            ;;
        source)
            package_source
            ;;
        *)
            package_existing
            ;;
    esac
    
    echo ""
    log_success "打包完成！"
    echo ""
}

# 执行主函数
main "$@"
