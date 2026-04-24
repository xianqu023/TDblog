#!/bin/bash

# ============================================
# 博客平台自动化部署脚本
# ============================================
# 功能：
# - 自动检查环境
# - 安装依赖
# - 数据库初始化
# - 构建应用
# - 启动服务
# - 交互式菜单
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 日志文件
LOG_FILE="logs/deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

# 打印日志
log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo -e "$msg" | tee -a "$LOG_FILE"
}

log_success() {
  log "${GREEN}✓ $1${NC}"
}

log_error() {
  log "${RED}✗ $1${NC}"
}

log_info() {
  log "${BLUE}ℹ $1${NC}"
}

log_warn() {
  log "${YELLOW}⚠ $1${NC}"
}

# 打印横幅
print_banner() {
  echo ""
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}                                                       ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}         🚀 博客平台自动化部署脚本                     ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}                                                       ${BLUE}║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# 检查 Node.js
check_nodejs() {
  log_info "检查 Node.js..."
  
  if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装"
    return 1
  fi
  
  local version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$version" -lt 18 ]; then
    log_error "Node.js 版本过低 (需要 >= 18, 当前：$(node -v))"
    return 1
  fi
  
  log_success "Node.js 版本：$(node -v)"
  return 0
}

# 检查 pnpm
check_pnpm() {
  log_info "检查 pnpm..."
  
  if ! command -v pnpm &> /dev/null; then
    log_warn "pnpm 未安装，正在安装..."
    npm install -g pnpm
  fi
  
  log_success "pnpm 版本：$(pnpm -v)"
  return 0
}

# 检查 Git
check_git() {
  log_info "检查 Git..."
  
  if ! command -v git &> /dev/null; then
    log_error "Git 未安装"
    return 1
  fi
  
  log_success "Git 版本：$(git --version | cut -d' ' -f3)"
  return 0
}

# 检查磁盘空间
check_disk_space() {
  log_info "检查磁盘空间..."
  
  local available=$(df -k . | tail -1 | awk '{print $4}')
  local available_gb=$((available / 1024 / 1024))
  
  if [ "$available_gb" -lt 5 ]; then
    log_error "磁盘空间不足 (需要至少 5GB, 当前：${available_gb}GB)"
    return 1
  fi
  
  log_success "可用磁盘空间：${available_gb}GB"
  return 0
}

# 检查环境
check_environment() {
  log_info "检查系统环境..."
  echo ""
  
  local failed=0
  
  check_nodejs || failed=1
  check_pnpm || failed=1
  check_git || failed=1
  check_disk_space || failed=1
  
  echo ""
  
  if [ $failed -eq 1 ]; then
    log_error "环境检查失败"
    return 1
  fi
  
  log_success "环境检查通过"
  return 0
}

# 安装依赖
install_dependencies() {
  log_info "安装依赖..."
  echo ""
  
  pnpm install --frozen-lockfile
  
  log_success "依赖安装完成"
  return 0
}

# 生成 Prisma 客户端
generate_prisma() {
  log_info "生成 Prisma 客户端..."
  echo ""
  
  if [ -d "packages/database" ]; then
    cd packages/database
    DATABASE_URL="file:./prisma/blog.db" npx prisma generate
    cd ../..
    log_success "Prisma 客户端生成完成"
  fi
  
  return 0
}

# 初始化数据库
init_database() {
  log_info "初始化数据库..."
  echo ""
  
  if [ ! -d "packages/database/prisma" ]; then
    log_error "Prisma 目录不存在"
    return 1
  fi
  
  # 创建数据库目录
  mkdir -p packages/database/prisma
  
  # 检查数据库文件是否存在
  if [ ! -f "packages/database/prisma/blog.db" ]; then
    log_info "创建新数据库..."
    cd packages/database
    DATABASE_URL="file:./prisma/blog.db" npx prisma migrate dev --name init
    cd ../..
  else
    log_info "数据库已存在，执行迁移..."
    cd packages/database
    DATABASE_URL="file:./prisma/blog.db" npx prisma migrate deploy
    cd ../..
  fi
  
  log_success "数据库初始化完成"
  return 0
}

# 生成默认管理员
create_admin_user() {
  log_info "创建默认管理员账户..."
  echo ""
  
  # 创建种子脚本
  cat > /tmp/create-admin.js << 'EVALEOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasourceUrl: {
    url: 'file:./prisma/blog.db',
  },
});

async function main() {
  // 检查是否已有管理员
  const existingAdmin = await prisma.user.findFirst({
    where: {
      roles: {
        some: {
          role: {
            name: 'ADMIN',
          },
        },
      },
    },
  });

  if (existingAdmin) {
    console.log('管理员账户已存在');
    return;
  }

  // 创建管理员角色
  let adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: '系统管理员',
      },
    });
  }

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
      profile: {
        create: {
          displayName: '系统管理员',
          bio: '博客平台管理员',
          locale: 'zh',
        },
      },
    },
  });

  console.log('\n========================================');
  console.log('✅ 默认管理员账户创建成功！');
  console.log('========================================');
  console.log('用户名：admin');
  console.log('邮箱：admin@example.com');
  console.log('密码：Admin@123456');
  console.log('========================================');
  console.log('⚠️  请首次登录后立即修改密码！');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('创建管理员失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EVALEOF

  cd packages/database
  node /tmp/create-admin.js
  cd ../..
  
  log_success "管理员账户创建完成"
  return 0
}

# 构建应用
build_app() {
  log_info "构建应用..."
  echo ""
  
  # 设置环境变量
  export NODE_ENV=production
  export GENERATE_SOURCEMAP=false
  
  # 运行构建
  pnpm build
  
  log_success "构建完成"
  return 0
}

# 复制必要文件
copy_standalone_files() {
  log_info "复制 standalone 文件..."
  echo ""
  
  # 复制 static 目录
  if [ -d "apps/web/.next/static" ] && [ -d "apps/web/.next/standalone/apps/web/.next" ]; then
    cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/
    log_info "static 目录已复制"
  fi
  
  # 复制 public 目录
  if [ -d "apps/web/public" ] && [ -d "apps/web/.next/standalone/apps/web" ]; then
    cp -r apps/web/public apps/web/.next/standalone/apps/web/
    log_info "public 目录已复制"
  fi
  
  # 复制数据库文件和目录
  log_info "检查数据库文件..."
  if [ -d "packages/database/prisma" ]; then
    # 创建目标目录
    mkdir -p apps/web/.next/standalone/packages/database/prisma
    
    # 复制所有 .db 文件
    if ls packages/database/prisma/*.db 1> /dev/null 2>&1; then
      cp packages/database/prisma/*.db apps/web/.next/standalone/packages/database/prisma/
      log_info "数据库文件已复制"
      
      # 显示复制的数据库文件
      echo "   源目录：packages/database/prisma/"
      echo "   目标目录：apps/web/.next/standalone/packages/database/prisma/"
      echo "   已复制文件:"
      ls -lh packages/database/prisma/*.db | awk '{print "     - " $9 " (" $5 ")"}'
    else
      log_warn "未找到数据库文件 (.db)"
    fi
    
    # 复制 schema.prisma (可选，用于调试)
    if [ -f "packages/database/prisma/schema.prisma" ]; then
      cp packages/database/prisma/schema.prisma apps/web/.next/standalone/packages/database/prisma/ 2>/dev/null || true
    fi
  else
    log_warn "数据库目录不存在：packages/database/prisma"
  fi
  
  log_success "文件复制完成"
  return 0
}

# 启动服务
start_service() {
  log_info "启动服务..."
  echo ""
  
  cd apps/web/.next/standalone
  NODE_ENV=production node apps/web/server.js &
  local pid=$!
  
  # 等待服务启动
  sleep 5
  
  if kill -0 $pid 2>/dev/null; then
    log_success "服务已启动 (PID: $pid)"
    echo $pid > "$SCRIPT_DIR/.server.pid"
    return 0
  else
    log_error "服务启动失败"
    return 1
  fi
}

# 停止服务
stop_service() {
  log_info "停止服务..."
  
  if [ -f ".server.pid" ]; then
    local pid=$(cat .server.pid)
    if kill -0 $pid 2>/dev/null; then
      kill $pid
      log_success "服务已停止 (PID: $pid)"
    fi
    rm -f .server.pid
  else
    # 尝试通过端口查找进程
    local pid=$(lsof -ti:3000 2>/dev/null || true)
    if [ -n "$pid" ]; then
      kill $pid
      log_success "服务已停止 (PID: $pid)"
    else
      log_info "未找到运行中的服务"
    fi
  fi
  
  return 0
}

# 查看实时应用日志
view_app_logs() {
  log_info "查看应用实时日志（API 访问和错误日志）..."
  echo ""
  
  # 检查是否有运行中的服务
  if [ -f ".server.pid" ]; then
    local pid=$(cat .server.pid)
    if ! kill -0 $pid 2>/dev/null; then
      log_warn "服务未运行，无法查看实时日志"
      return 1
    fi
  fi
  
  # 尝试通过端口查找进程
  local server_pid=$(lsof -ti:3000 2>/dev/null || true)
  
  if [ -z "$server_pid" ]; then
    log_warn "未找到运行中的服务，无法查看实时日志"
    echo ""
    echo -e "${BLUE}提示：使用 'blog 7' 启动服务后再查看日志${NC}"
    return 1
  fi
  
  echo -e "${GREEN}找到运行中的服务 (PID: $server_pid)${NC}"
  echo ""
  
  # 显示日志查看选项
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}              📋 请选择日志查看方式                   ${BLUE}║${NC}"
  echo -e "${BLUE}╠═══════════════════════════════════════════════════════════╣${NC}"
  echo -e "${BLUE}║${NC}  1. PM2 实时日志（美化版）                            ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  2. 查看 PM2 输出日志（最近 100 行）                     ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  3. 查看 PM2 错误日志（最近 100 行）                     ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  4. 实时追踪所有日志文件（美化版）                    ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  5. PM2 原生日志（原始格式）                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  0. 返回上级菜单                                      ${BLUE}║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
  
  read -p "请选择 (0-5): " log_choice
  
  case $log_choice in
    1)
      # PM2 实时日志（美化版）
      if command -v pm2 &> /dev/null; then
        if pm2 describe blog-platform &> /dev/null 2>&1; then
          log_info "使用 PM2 查看实时日志（美化版）..."
          echo -e "${YELLOW}按 Ctrl+C 退出日志查看${NC}"
          echo ""
          
          # 使用美化脚本
          if [ -f "scripts/beautiful-logs.sh" ]; then
            bash scripts/beautiful-logs.sh logs/pm2-out.log 100 true
          else
            # 如果没有美化脚本，使用原始格式
            pm2 logs blog-platform --lines 100
          fi
        else
          log_error "PM2 未运行 blog-platform 进程"
          echo -e "${BLUE}提示：使用 'blog 1' 或 'blog 2' 进行部署${NC}"
        fi
      else
        log_error "PM2 未安装"
        echo -e "${BLUE}提示：npm install -g pm2${NC}"
      fi
      ;;
    2)
      # 查看 PM2 输出日志
      if [ -f "logs/pm2-out.log" ]; then
        log_info "查看 PM2 输出日志（最近 100 行）..."
        echo ""
        echo -e "${BLUE}━━━ PM2 输出日志 ━━━${NC}"
        tail -100 logs/pm2-out.log
      else
        log_info "PM2 输出日志文件不存在"
      fi
      ;;
    3)
      # 查看 PM2 错误日志
      if [ -f "logs/pm2-error.log" ]; then
        log_info "查看 PM2 错误日志（最近 100 行）..."
        echo ""
        echo -e "${BLUE}━━━ PM2 错误日志 ━━━${NC}"
        tail -100 logs/pm2-error.log
      else
        log_info "PM2 错误日志文件不存在"
      fi
      ;;
    4)
      # 实时追踪所有日志（美化版）
      if [ -d "logs" ]; then
        log_info "实时追踪所有日志文件（美化版）..."
        echo -e "${YELLOW}按 Ctrl+C 退出日志追踪${NC}"
        echo ""
        
        # 使用美化脚本
        if [ -f "scripts/beautiful-logs.sh" ]; then
          bash scripts/beautiful-logs.sh logs/pm2-out.log 50 true
        else
          tail -f logs/*.log
        fi
      else
        log_info "日志目录不存在"
      fi
      ;;
    5)
      # PM2 原生日志
      if command -v pm2 &> /dev/null; then
        if pm2 describe blog-platform &> /dev/null 2>&1; then
          log_info "使用 PM2 查看原生日志..."
          echo -e "${YELLOW}按 Ctrl+C 退出日志查看${NC}"
          echo ""
          pm2 logs blog-platform --lines 100
        else
          log_error "PM2 未运行 blog-platform 进程"
        fi
      else
        log_error "PM2 未安装"
      fi
      ;;
    0)
      log_info "返回上级菜单"
      return 0
      ;;
    *)
      log_error "无效的选择"
      return 1
      ;;
  esac
  
  return 0
}

# 查看部署日志（旧功能保留）
view_deploy_logs() {
  log_info "查看部署日志..."
  echo ""
  
  if [ -d "logs" ]; then
    # 显示最近的部署日志
    local latest_log=$(ls -t logs/deploy-*.log 2>/dev/null | head -1)
    
    if [ -n "$latest_log" ] && [ -f "$latest_log" ]; then
      echo -e "${BLUE}最近的部署日志：$latest_log${NC}"
      echo ""
      tail -100 "$latest_log"
    else
      log_info "暂无部署日志"
    fi
  else
    log_info "日志目录不存在"
  fi
  
  return 0
}

# 显示菜单
show_menu() {
  echo ""
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}                  📋 部署管理菜单                     ${BLUE}║${NC}"
  echo -e "${BLUE}╠═══════════════════════════════════════════════════════════╣${NC}"
  echo -e "${BLUE}║${NC}  1. 完整部署（环境检查 + 安装 + 构建 + 启动）         ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  2. 快速部署（仅构建 + 启动）                         ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  3. 环境检查                                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  4. 安装依赖                                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  5. 数据库初始化                                      ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  6. 构建应用                                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  7. 启动服务                                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  8. 停止服务                                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  9. 重启服务                                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  10. 查看实时日志（API 访问和错误）                   ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  11. 清理构建缓存                                     ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  12. 查看部署日志                                     ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  0. 退出                                              ${BLUE}║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# 完整部署
full_deploy() {
  log_info "开始完整部署流程..."
  echo ""
  
  check_environment || return 1
  install_dependencies
  generate_prisma
  init_database
  create_admin_user
  build_app
  copy_standalone_files
  start_service
  
  log_success "完整部署完成！"
  return 0
}

# 快速部署
quick_deploy() {
  log_info "开始快速部署..."
  echo ""
  
  install_dependencies
  generate_prisma
  build_app
  copy_standalone_files
  start_service
  
  log_success "快速部署完成！"
  return 0
}

# 清理缓存
clean_cache() {
  log_info "清理构建缓存..."
  echo ""
  
  rm -rf .next
  rm -rf apps/web/.next
  rm -rf packages/database/.next
  rm -rf node_modules/.cache
  rm -rf .turbo
  rm -rf apps/web/.turbo
  rm -rf packages/database/.turbo
  
  log_success "缓存清理完成"
  return 0
}

# 执行单个操作
execute_action() {
  local action=$1
  
  case $action in
    1)
      full_deploy
      ;;
    2)
      quick_deploy
      ;;
    3)
      check_environment
      ;;
    4)
      install_dependencies
      ;;
    5)
      init_database
      create_admin_user
      ;;
    6)
      build_app
      copy_standalone_files
      ;;
    7)
      start_service
      ;;
    8)
      stop_service
      ;;
    9)
      stop_service
      sleep 2
      start_service
      ;;
    10)
      view_app_logs
      ;;
    11)
      clean_cache
      ;;
    12)
      view_deploy_logs
      ;;
    0)
      log_info "退出部署脚本"
      exit 0
      ;;
    *)
      log_error "无效的选择：$action"
      return 1
      ;;
  esac
}

# 主函数
main() {
  print_banner
  
  # 确保日志目录存在
  mkdir -p logs
  
  # 如果是命令行参数直接执行
  case "$1" in
    "full")
      full_deploy
      exit $?
      ;;
    "quick")
      quick_deploy
      exit $?
      ;;
    "build")
      build_app
      exit $?
      ;;
    "start")
      start_service
      exit $?
      ;;
    "stop")
      stop_service
      exit $?
      ;;
    "restart")
      stop_service
      sleep 2
      start_service
      exit $?
      ;;
    "logs")
      view_logs
      exit $?
      ;;
    "clean")
      clean_cache
      exit $?
      ;;
    "check")
      check_environment
      exit $?
      ;;
    "logs")
      view_app_logs
      exit $?
      ;;
    "deploy-logs")
      view_deploy_logs
      exit $?
      ;;
    # 支持数字参数直接执行
    [0-9]|1[0-2])
      execute_action "$1"
      exit $?
      ;;
    *)
      # 交互式菜单
      while true; do
        show_menu
        read -p "请选择操作 (0-11): " choice
        
        case $choice in
          [0-9]|10|11)
            execute_action "$choice"
            ;;
          *)
            log_error "无效的选择，请重新输入"
            continue
            ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
      done
      ;;
  esac
}

# 运行主函数
main "$@"
