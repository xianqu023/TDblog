"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Search, User, Globe, ChevronDown, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import AuthModal from "./AuthModal";

interface SiteSettings {
  siteName: string;
  logoUrl: string;
}

interface HeaderProps {
  currentLocale: Locale;
  siteSettings?: SiteSettings;
}

const getInitialSettings = (fallback?: SiteSettings): SiteSettings => {
  if (fallback) {
    return fallback;
  }
  if (typeof window !== "undefined" && (window as any).__SITE_SETTINGS__) {
    return (window as any).__SITE_SETTINGS__;
  }
  return {
    siteName: "My Blog",
    logoUrl: "",
  };
};

export default function Header({ currentLocale, siteSettings }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localeDropdownOpen, setLocaleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(() => getInitialSettings(siteSettings));
  const [navItems, setNavItems] = useState<Array<{ href: string; label: string }>>([]);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 从 API 获取菜单项
    fetchMenus();
  }, []);

  // 点击外部关闭用户下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      const data = await response.json();
      if (data.success) {
        setNavItems(data.data.map((m: any) => ({ href: m.href, label: m.label })));
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      // 使用默认菜单
      setNavItems([
        { href: "/", label: t("home") },
        { href: "/articles", label: t("articles") },
        { href: "/shop", label: t("shop") },
        { href: "/orders", label: t("orders") || "订单" },
      ]);
    }
  };

  // Get path without locale prefix for locale switching
  const getPathWithoutLocale = () => {
    const parts = pathname?.split("/").filter(Boolean) || [];
    if (locales.includes(parts[0] as Locale)) {
      parts.shift();
    }
    return "/" + parts.join("/");
  };

  const pathWithoutLocale = getPathWithoutLocale();

  // 检查是否是管理员
  const isAdmin = session?.user?.permissions?.includes("user:manage") || false;

  // 获取用户显示名
  const userDisplayName = session?.user?.name || session?.user?.username || "用户";

  // 处理登出
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: `/${currentLocale}` });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-8 w-8 object-contain rounded-lg"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              )}
              <span className="text-xl font-bold text-gray-900">{settings.siteName}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLocaleDropdownOpen(!localeDropdownOpen)}
                  className="flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">{localeNames[currentLocale]}</span>
                </button>

                {localeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 rounded-lg border bg-white shadow-lg">
                    {locales.map((locale) => (
                      <Link
                        key={locale}
                        href={`/${locale}${pathWithoutLocale}`}
                        onClick={() => setLocaleDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                          locale === currentLocale ? "bg-blue-50 text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {localeNames[locale]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu / Login Button */}
              {status === "loading" ? (
                <div className="hidden md:flex items-center space-x-2 px-4 py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              ) : session?.user ? (
                // 已登录 - 显示用户菜单
                <div className="relative hidden md:block" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {userDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                      {userDisplayName}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href={`/${currentLocale}/user-center`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="h-4 w-4 mr-3" />
                          {t("userCenter")}
                        </Link>

                        {isAdmin && (
                          <Link
                            href={`/${currentLocale}/admin/dashboard`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3" />
                            {t("dashboard")}
                          </Link>
                        )}

                        <Link
                          href={`/${currentLocale}/user-center/settings`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          {t("settings")}
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t("logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 未登录 - 显示登录按钮
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{t("login")}</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile User Menu */}
                {status === "loading" ? (
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                ) : session?.user ? (
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {userDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{userDisplayName}</p>
                        <p className="text-xs text-gray-500">{session.user.email}</p>
                      </div>
                    </div>

                    <Link
                      href={`/${currentLocale}/user-center`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      {t("userCenter")}
                    </Link>

                    {isAdmin && (
                      <Link
                        href={`/${currentLocale}/admin/dashboard`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        {t("dashboard")}
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {t("logout")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-fit"
                  >
                    <User className="h-4 w-4" />
                    <span>{t("login")}</span>
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
