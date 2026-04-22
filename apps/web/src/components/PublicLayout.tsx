"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/public/Header";
import HeaderChinese from "@/components/public/HeaderChinese";
import Footer from "@/components/public/Footer";
import { useTheme } from "@/components/providers/ThemeProvider";
import { type Locale } from "@/lib/i18n/config";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  siteKeywords: string;
}

interface PublicLayoutProps {
  children: React.ReactNode;
  locale: Locale;
  siteSettings: SiteSettings;
}

export default function PublicLayout({ children, locale, siteSettings }: PublicLayoutProps) {
  const pathname = usePathname();
  const { currentTheme } = useTheme();

  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/zh/admin") ||
    pathname?.startsWith("/en/admin") ||
    pathname?.startsWith("/ja/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  // 检查是否是 /zh 路由，如果是则使用中式主题
  const isZhRoute = pathname === '/zh' || pathname?.startsWith('/zh/');
  const isChineseTheme = isZhRoute || currentTheme === "chinese-style" || currentTheme === "chinese-two-column";
  const shouldShowGlobalHeader = !isChineseTheme;
  const shouldShowGlobalFooter = !isChineseTheme;

  return (
    <>
      {shouldShowGlobalHeader ? (
        <Header currentLocale={locale} siteSettings={siteSettings} />
      ) : (
        <HeaderChinese currentLocale={locale as Locale} siteSettings={siteSettings} />
      )}
      <main className="min-h-screen">{children}</main>
      {shouldShowGlobalFooter && <Footer />}
    </>
  );
}
