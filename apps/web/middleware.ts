import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 请求日志中间件
 * 
 * 功能：
 * - 记录所有 HTTP 请求（方法、路径、状态码、耗时）
 * - 支持 API 请求和页面访问日志
 * - 输出到 stdout，供 PM2 和监控工具捕获
 */
export function middleware(request: NextRequest) {
  const start = Date.now();
  const pathname = request.nextUrl.pathname;
  
  // 创建响应
  const response = NextResponse.next();
  
  // 计算处理时间
  const end = () => {
    const duration = Date.now() - start;
    const method = request.method;
    const status = response.status || 200;
    
    // 只记录 API 请求和重要页面访问（避免日志过多）
    if (
      pathname.startsWith('/api/') ||
      pathname === '/' ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/article') ||
      pathname.startsWith('/category') ||
      pathname.startsWith('/tag')
    ) {
      // 格式化输出，便于监控工具解析
      const logMessage = `${method} ${pathname} ${status} in ${duration}ms`;
      console.log(logMessage);
    }
  };
  
  // 立即执行 end 函数记录日志
  end();
  
  // 添加响应头，便于调试
  response.headers.set('X-Process-Time', (Date.now() - start).toString());
  response.headers.set('X-Request-ID', crypto.randomUUID());
  
  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除以下静态资源：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - 静态资源文件 (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
