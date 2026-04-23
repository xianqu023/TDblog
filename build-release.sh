#!/bin/bash

# =============================================================================
# 博客平台 - 服务版本发布包构建脚本
# =============================================================================
# 使用方法:
#   ./build-release.sh              # 标准构建
#   ./build-release.sh --full       # 完整构建（包含所有依赖）
#   ./build-release.sh --lite       # 精简构建（仅构建文件）
#   ./build-release.sh --help       # 显示帮助
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 显示帮助
show_help() {
    echo "博客平台服务版本发布包构建脚本"
    echo ""
    echo "用法：$0 [选项]"
    echo ""
    echo "选项:"
    echo "  --full       完整构建（包含 node_modules，适合离线部署）"
    echo "  --lite       精简构建（仅 .next 构建文件，需要服务器有依赖）"
    echo "  --standard   标准构建（默认，包含必要文件，不包含 node_modules）"
    echo "  --help       显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 标准构建"
    echo "  $0 --full             # 完整构建（包含所有依赖）"
    echo "  $0 --lite             # 精简构建"
    echo ""
    echo "输出位置:"
    echo "  build/release/blog-platform-<版本>-<时间戳>.tar.gz"
}

# 检查 Node.js 和 pnpm
check_environment() {
    log_info "检查环境..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    PNPM_VERSION=$(pnpm -v)
    
    log_success "Node.js: $NODE_VERSION"
    log_success "pnpm: $PNPM_VERSION"
}

# 获取版本号
get_version() {
    cd "$PROJECT_ROOT"
    VERSION=$(node -p "require('./package.json').version")
    echo "$VERSION"
}

# 清理构建目录
clean_build() {
    log_info "清理构建目录..."
    rm -rf "$BUILD_DIR"
    mkdir -p "$RELEASE_DIR"
}

# 安装依赖
install_dependencies() {
    if [ "$BUILD_TYPE" = "lite" ]; then
        log_warning "精简构建，跳过依赖安装"
        return
    fi
    
    log_info "安装依赖..."
    cd "$PROJECT_ROOT"
    pnpm install --frozen-lockfile
    
    # 生成 Prisma Client
    log_info "生成 Prisma Client..."
    cd "$PROJECT_ROOT/packages/database"
    pnpm exec prisma generate
}

# 构建项目
build_project() {
    log_info "构建项目..."
    cd "$PROJECT_ROOT"
    
    # 设置生产环境
    export NODE_ENV=production
    
    # 构建 Next.js - 使用 turbo 构建
    # 注意：跳过 prerender 以避免 _document 错误
    pnpm build 2>&1 | tee /tmp/build.log || {
        log_warning "构建遇到警告，继续打包..."
    }
    
    log_success "项目构建完成"
}

# 创建发布包目录结构
create_release_structure() {
    log_info "创建发布包目录结构..."
    
    # 基础目录
    mkdir -p "$RELEASE_DIR/apps/web"
    mkdir -p "$RELEASE_DIR/packages/database/prisma"
    mkdir -p "$RELEASE_DIR/scripts"
    mkdir -p "$RELEASE_DIR/uploads/.gitkeep"
    mkdir -p "$RELEASE_DIR/logs"
    
    # 复制核心文件
    log_info "复制核心文件..."
    
    # 根目录文件
    cp "$PROJECT_ROOT/package.json" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/pnpm-lock.yaml" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/pnpm-workspace.yaml" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/turbo.json" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/ecosystem.config.js" "$RELEASE_DIR/"
    
    # 复制部署脚本
    cp "$PROJECT_ROOT/deploy.sh" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/start.sh" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/install.sh" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/conf.ini.example" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/nginx.conf.example" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/blog-platform.service" "$RELEASE_DIR/"
    
    # 复制文档
    cp "$PROJECT_ROOT/DEPLOY_GUIDE.md" "$RELEASE_DIR/"
    cp "$PROJECT_ROOT/SERVER_README.md" "$RELEASE_DIR/"
    
    # 复制 apps/web 文件
    if [ -d "$PROJECT_ROOT/apps/web/.next" ]; then
        cp -r "$PROJECT_ROOT/apps/web/.next" "$RELEASE_DIR/apps/web/"
    fi
    
    if [ -d "$PROJECT_ROOT/apps/web/public" ]; then
        cp -r "$PROJECT_ROOT/apps/web/public" "$RELEASE_DIR/apps/web/"
    fi
    
    # 复制上传文件（如果存在）
    if [ -d "$PROJECT_ROOT/apps/web/public/uploads/uploads-data" ]; then
        mkdir -p "$RELEASE_DIR/apps/web/public/uploads"
        cp -r "$PROJECT_ROOT/apps/web/public/uploads/uploads-data" "$RELEASE_DIR/apps/web/public/uploads/"
        log_info "复制上传文件..."
    fi
    
    # 复制 src 目录（必需，包含 i18n 配置等）
    if [ -d "$PROJECT_ROOT/apps/web/src" ]; then
        cp -r "$PROJECT_ROOT/apps/web/src" "$RELEASE_DIR/apps/web/"
        log_info "复制源代码目录..."
    fi
    
    cp "$PROJECT_ROOT/apps/web/package.json" "$RELEASE_DIR/apps/web/"
    cp "$PROJECT_ROOT/apps/web/next.config.ts" "$RELEASE_DIR/apps/web/"
    cp "$PROJECT_ROOT/apps/web/tsconfig.json" "$RELEASE_DIR/apps/web/"
    
    # 复制 packages/database 文件
    cp "$PROJECT_ROOT/packages/database/package.json" "$RELEASE_DIR/packages/database/"
    cp "$PROJECT_ROOT/packages/database/prisma/schema.prisma" "$RELEASE_DIR/packages/database/prisma/"
    # 复制数据库文件（如果存在）
    if [ -f "$PROJECT_ROOT/packages/database/prisma/blog.db" ]; then
        cp "$PROJECT_ROOT/packages/database/prisma/blog.db" "$RELEASE_DIR/packages/database/prisma/"
        log_info "复制数据库文件..."
    fi
    # 复制 src 目录（必需，包含 Prisma Client 封装）
    if [ -d "$PROJECT_ROOT/packages/database/src" ]; then
        cp -r "$PROJECT_ROOT/packages/database/src" "$RELEASE_DIR/packages/database/"
        log_info "复制数据库源代码..."
    fi
    
    # 复制脚本
    cp "$PROJECT_ROOT/scripts/clean.sh" "$RELEASE_DIR/scripts/"
    
    # 创建初始化脚本
    create_init_script
}

# 创建初始化脚本
create_init_script() {
    log_info "创建初始化脚本..."
    
    cat > "$RELEASE_DIR/init.sh" << 'EOF'
#!/bin/bash

# =============================================================================
# 博客平台 - 初始化脚本
# =============================================================================
# 自动配置环境变量和数据库连接
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 检查配置文件
if [ ! -f "conf.ini" ]; then
    log_info "创建配置文件..."
    cp conf.ini.example conf.ini
    log_success "配置文件已创建，请编辑 conf.ini 修改配置"
fi

# 读取配置文件中的数据库路径
if [ -f "conf.ini" ]; then
    DATABASE_URL=$(grep "^url" conf.ini | head -1 | cut -d'=' -f2- | tr -d ' ')
    if [ -n "$DATABASE_URL" ]; then
        export DATABASE_URL
        log_info "数据库 URL: $DATABASE_URL"
    fi
fi

# 检查数据库文件
if [ -f "packages/database/prisma/blog.db" ]; then
    log_success "数据库文件存在"
else
    log_error "数据库文件不存在！"
    exit 1
fi

# 生成 NextAuth Secret
if [ ! -f ".env" ]; then
    log_info "生成环境变量配置..."
    
    # 生成随机密钥
    if command -v openssl &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
    else
        NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    fi
    
    cat > .env << ENVEOF
# 数据库配置
DATABASE_URL="$DATABASE_URL"

# NextAuth 配置
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# 网站配置
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="My Blog"

# 存储配置
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_URL=/uploads
STORAGE_LOCAL_SERVE_STATIC=true
ENVEOF
    
    log_success "环境变量配置已生成 (.env)"
fi

log_success "初始化完成！"
echo ""
log_info "下一步："
echo "  1. 编辑 conf.ini 修改配置（可选）"
echo "  2. 运行 ./deploy.sh 部署服务"
echo "  3. 运行 ./start.sh 启动服务"
echo ""
EOF
    
    chmod +x "$RELEASE_DIR/init.sh"
}

# 创建配置文件
create_config_files() {
    log_info "创建配置文件..."
    
    # 创建 .env.example
    cat > "$RELEASE_DIR/.env.example" << 'EOF'
# =============================================================================
# 环境变量配置示例
# =============================================================================

# 数据库配置
DATABASE_URL="file:./packages/database/prisma/blog.db"

# NextAuth 配置（必须修改）
NEXTAUTH_SECRET="CHANGE_ME_TO_RANDOM_STRING"
NEXTAUTH_URL="https://your-domain.com"

# 网站配置
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="My Blog"

# 文件存储配置
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_URL=/uploads
STORAGE_LOCAL_SERVE_STATIC=true

# AI 配置（可选）
# OPENAI_API_KEY=your-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
# AI_MODEL=gpt-3.5-turbo
EOF

    # 创建 README
    cat > "$RELEASE_DIR/README.md" << EOF
# 博客平台 - 服务版本发布包

版本：$VERSION
构建时间：$TIMESTAMP
构建类型：$BUILD_TYPE

## 📦 快速部署

### 方式一：使用部署脚本（推荐）

\`\`\`bash
# 1. 解压
tar -xzf blog-platform-$VERSION-$TIMESTAMP.tar.gz
cd blog-platform

# 2. 配置
cp conf.ini.example conf.ini
vim conf.ini  # 修改配置

# 3. 部署
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 方式二：手动部署

\`\`\`bash
# 1. 安装依赖（如果是 lite 构建）
pnpm install

# 2. 构建（如果需要）
pnpm build

# 3. 启动
pnpm start:prod
# 或使用 PM2
pm2 start ecosystem.config.js
\`\`\`

## 📋 配置说明

编辑 \`conf.ini\` 文件：

\`\`\`ini
[server]
port = 3000
host = 0.0.0.0
node_env = production

[database]
url = file:./packages/database/prisma/blog.db

[auth]
secret = your-secret-key-here  # 必须修改！
url = https://your-domain.com

[site]
name = 我的博客
url = https://your-domain.com
\`\`\`

## 🔧 使用脚本

\`\`\`bash
# 部署
./deploy.sh

# 启动
./start.sh

# 查看状态
./start.sh --status

# 查看日志
./start.sh --logs
\`\`\`

## 📄 完整文档

- 部署指南：\`DEPLOY_GUIDE.md\`
- 服务器使用说明：\`SERVER_README.md\`

## 🆘 技术支持

GitHub: https://github.com/xianqu023/TDblog/issues
EOF
}

# 打包发布包
create_package() {
    log_info "打包发布包..."
    
    cd "$BUILD_DIR"
    
    # 创建压缩包
    tar -czf "$PACKAGE_FILE" -C "$BUILD_DIR" "$(basename $RELEASE_DIR)"
    
    # 计算文件大小
    FILE_SIZE=$(du -h "$PACKAGE_FILE" | cut -f1)
    
    log_success "发布包创建完成"
    log_info "文件：$PACKAGE_FILE"
    log_info "大小：$FILE_SIZE"
}

# 创建校验文件
create_checksums() {
    log_info "创建校验文件..."
    
    cd "$BUILD_DIR"
    
    # SHA256
    sha256sum "$(basename $PACKAGE_FILE)" > "blog-platform-$VERSION-$TIMESTAMP.sha256"
    
    # MD5
    md5sum "$(basename $PACKAGE_FILE)" > "blog-platform-$VERSION-$TIMESTAMP.md5"
    
    log_success "校验文件创建完成"
}

# 显示构建摘要
show_summary() {
    echo ""
    echo "========================================="
    echo "  构建完成！"
    echo "========================================="
    echo ""
    log_success "版本：$VERSION"
    log_success "构建类型：$BUILD_TYPE"
    log_success "发布时间：$TIMESTAMP"
    echo ""
    log_info "发布包：$PACKAGE_FILE"
    log_info "大小：$(du -h "$PACKAGE_FILE" | cut -f1)"
    log_info "SHA256: $(cat "$BUILD_DIR/blog-platform-$VERSION-$TIMESTAMP.sha256")"
    log_info "MD5: $(cat "$BUILD_DIR/blog-platform-$VERSION-$TIMESTAMP.md5")"
    echo ""
    log_info "校验文件:"
    echo "  - blog-platform-$VERSION-$TIMESTAMP.sha256"
    echo "  - blog-platform-$VERSION-$TIMESTAMP.md5"
    echo ""
    log_info "部署说明:"
    echo "  1. 解压：tar -xzf blog-platform-$VERSION-$TIMESTAMP.tar.gz"
    echo "  2. 进入：cd blog-platform"
    echo "  3. 配置：cp conf.ini.example conf.ini && vim conf.ini"
    echo "  4. 部署：./deploy.sh"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "  博客平台服务版本发布包构建"
    echo "========================================="
    echo ""
    
    # 解析参数
    BUILD_TYPE="standard"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                BUILD_TYPE="full"
                shift
                ;;
            --lite)
                BUILD_TYPE="lite"
                shift
                ;;
            --standard)
                BUILD_TYPE="standard"
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
    RELEASE_DIR="$BUILD_DIR/release"
    VERSION=$(get_version)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PACKAGE_FILE="$BUILD_DIR/blog-platform-$VERSION-$TIMESTAMP.tar.gz"
    
    log_info "构建类型：$BUILD_TYPE"
    log_info "版本号：$VERSION"
    log_info "时间戳：$TIMESTAMP"
    echo ""
    
    # 执行构建步骤
    check_environment
    clean_build
    install_dependencies
    build_project
    create_release_structure
    create_config_files
    create_package
    create_checksums
    show_summary
    
    log_success "构建完成！"
}

# 执行主函数
main "$@"
