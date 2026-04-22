import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过 Next.js 内部路径和 API 路由
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 检查是否有重复的 locale 前缀（如 /zh/zh）
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === segments[1] && locales.includes(segments[0] as typeof locales[number])) {
    // 移除重复的 locale，重定向到正确的路径
    const url = request.nextUrl.clone();
    url.pathname = "/" + segments.slice(1).join("/");
    return NextResponse.redirect(url);
  }

  // 检查是否已经有 locale 前缀
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 如果没有 locale 前缀，重定向到默认 locale
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return response;
  }

  // 提取当前 locale
  const locale = pathname.split("/")[1];

  // 设置 locale cookie 供 next-intl 使用
  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - uploads (上传文件)
     * - api (API 路由)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads|api).*)",
  ],
};
