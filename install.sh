#!/bin/bash

# =============================================================================
# 博客平台 - 一键安装脚本（Ubuntu/Debian）
# =============================================================================
# 使用方法:
#   curl -o install.sh https://your-server/install.sh
#   chmod +x install.sh
#   ./install.sh
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

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 检查 root 权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本：sudo $0"
        exit 1
    fi
}

# 检查系统
check_system() {
    log_info "检查系统..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
        log_info "系统：$OS $VER"
    else
        log_error "无法识别操作系统"
        exit 1
    fi
}

# 安装系统依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    apt-get update
    apt-get install -y \
        curl \
        git \
        wget \
        build-essential \
        ca-certificates \
        apt-transport-https
    
    log_success "系统依赖安装完成"
}

# 安装 Node.js
install_nodejs() {
    log_info "安装 Node.js..."
    
    # 检查是否已安装
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_warning "Node.js 已安装：$NODE_VERSION"
        read -p "是否继续安装？(y/N): " confirm
        if [ "$confirm" != "y" ]; then
            return
        fi
    fi
    
    # 安装 Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    
    log_success "Node.js $NODE_VERSION 安装完成"
    log_success "npm $NPM_VERSION 安装完成"
}

# 安装 pnpm
install_pnpm() {
    log_info "安装 pnpm..."
    
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm -v)
        log_warning "pnpm 已安装：$PNPM_VERSION"
        return
    fi
    
    npm install -g pnpm
    PNPM_VERSION=$(pnpm -v)
    log_success "pnpm $PNPM_VERSION 安装完成"
}

# 安装 PM2
install_pm2() {
    log_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 -v)
        log_warning "PM2 已安装：$PM2_VERSION"
        return
    fi
    
    npm install -g pm2
    PM2_VERSION=$(pm2 -v)
    log_success "PM2 $PM2_VERSION 安装完成"
}

# 安装 Nginx
install_nginx() {
    log_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1)
        log_warning "Nginx 已安装：$NGINX_VERSION"
        return
    fi
    
    apt-get install -y nginx
    
    log_success "Nginx 安装完成"
}

# 创建用户
create_user() {
    log_info "创建博客用户..."
    
    if id "blog" &>/dev/null; then
        log_warning "用户 blog 已存在"
        return
    fi
    
    useradd -m -s /bin/bash blog
    log_success "用户 blog 创建完成"
}

# 下载代码
download_code() {
    log_info "下载代码..."
    
    cd /home/blog
    
    if [ -d "TDblog" ]; then
        log_warning "TDblog 目录已存在"
        read -p "是否删除并重新下载？(y/N): " confirm
        if [ "$confirm" = "y" ]; then
            rm -rf TDblog
        else
            return
        fi
    fi
    
    # 从 GitHub 克隆
    git clone https://github.com/xianqu023/TDblog.git
    chown -R blog:blog TDblog
    
    log_success "代码下载完成"
}

# 配置系统
setup_system() {
    log_info "配置系统..."
    
    cd /home/blog/TDblog
    
    # 复制配置文件
    if [ ! -f "conf.ini" ]; then
        cp conf.ini.example conf.ini
        
        # 生成密钥
        SECRET=$(openssl rand -base64 32)
        sed -i "s/secret = your-secret-key-here/secret = $SECRET/" conf.ini
        
        log_success "配置文件生成完成"
    fi
    
    # 设置权限
    chown -R blog:blog .
    chmod +x deploy.sh start.sh
    
    log_success "系统配置完成"
}

# 部署应用
deploy_app() {
    log_info "部署应用..."
    
    cd /home/blog/TDblog
    
    # 切换到 blog 用户执行
    su - blog -c "cd /home/blog/TDblog && ./deploy.sh --skip-build"
    
    log_success "应用部署完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    # 复制 Nginx 配置
    cat > /etc/nginx/sites-available/blog << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试并重启
    nginx -t
    systemctl restart nginx
    
    log_success "Nginx 配置完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        log_success "防火墙配置完成"
    else
        log_warning "UFW 未安装，跳过防火墙配置"
    fi
}

# 显示完成信息
show_complete() {
    echo ""
    echo "========================================="
    echo "  安装完成！"
    echo "========================================="
    echo ""
    echo "访问地址：http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "管理命令:"
    echo "  启动服务：su - blog -c 'cd /home/blog/TDblog && ./start.sh'"
    echo "  查看状态：su - blog -c 'cd /home/blog/TDblog && ./start.sh --status'"
    echo "  查看日志：su - blog -c 'cd /home/blog/TDblog && ./start.sh --logs'"
    echo ""
    echo "下次登录:"
    echo "  su - blog"
    echo "  cd TDblog"
    echo ""
    echo "重要提示:"
    echo "  1. 请修改 conf.ini 中的配置"
    echo "  2. 请创建管理员账户"
    echo "  3. 建议配置 HTTPS（使用 Certbot）"
    echo ""
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "  博客平台一键安装脚本"
    echo "========================================="
    echo ""
    
    # 检查
    check_root
    check_system
    
    # 安装
    install_dependencies
    install_nodejs
    install_pnpm
    install_pm2
    install_nginx
    
    # 创建用户
    create_user
    
    # 下载和配置
    download_code
    setup_system
    
    # 部署
    deploy_app
    
    # 配置 Nginx
    setup_nginx
    
    # 配置防火墙
    setup_firewall
    
    # 完成
    show_complete
}

# 执行
main "$@"
