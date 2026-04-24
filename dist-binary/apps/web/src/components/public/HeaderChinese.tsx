"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, User, Globe, LogOut, LayoutDashboard, Settings, FileText } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import AuthModal from "./AuthModal";

interface HeaderChineseProps {
  currentLocale: Locale;
  siteSettings?: {
    siteName: string;
    siteDescription: string;
    logoUrl: string;
    siteKeywords: string;
  };
}

interface UserInfo {
  id?: string;
  name: string;
  email?: string;
  image?: string;
  role?: string;
  isAdmin?: boolean;
}

export default function HeaderChinese({ currentLocale, siteSettings }: HeaderChineseProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localeDropdownOpen, setLocaleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [navItems, setNavItems] = useState<Array<{ id: string; href: string; label: string; icon?: string }>>([
    { id: "1", href: "/", label: t("home"), icon: "Home" },
    { id: "2", href: "/articles", label: t("articles"), icon: "FileText" },
  ]);
  const [settings, setSettings] = useState(siteSettings || { siteName: "", siteDescription: "", logoUrl: "", siteKeywords: "" });
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const localeDropdownRef = useRef<HTMLDivElement>(null);
  
  // 从 API 加载网站设置（仅在未提供siteSettings时加载）
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/site-info');
        const data = await response.json();
        if (data.success && data.data.site) {
          setSettings({
            siteName: data.data.site.siteName || "My Blog",
            siteDescription: data.data.site.siteDescription || "一个个人博客平台",
            logoUrl: data.data.site.logoUrl || "",
            siteKeywords: data.data.site.siteKeywords || "",
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    fetchMenus();
    loadUserInfo();
    // 只有当siteSettings未提供时才从API加载
    if (!siteSettings) {
      loadSettings();
    }
  }, [siteSettings]);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      const data = await response.json();
      if (data.success) {
        setNavItems(data.data.map((m: any) => ({ 
          id: m.id,
          href: m.href, 
          label: m.label,
          icon: m.icon 
        })));
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
      setNavItems([
        { id: "1", href: "/", label: t("home"), icon: "Home" },
        { id: "2", href: "/articles", label: t("articles"), icon: "FileText" },
      ]);
    }
  };

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/api/site-info');
      const data = await response.json();
      if (data.success) {
        // 优先使用 user 信息，如果没有则使用 blogAuthor 信息
        const userInfo = data.data.user ? {
          id: data.data.user.id,
          name: data.data.user.displayName || data.data.user.username,
          email: data.data.user.email,
          image: data.data.user.avatarUrl,
          role: data.data.user.isAdmin ? 'admin' : undefined,
          isAdmin: data.data.user.isAdmin
        } : {
          name: data.data.blogAuthor?.displayName || '用户',
          image: data.data.blogAuthor?.avatarUrl,
        };
        setUserInfo(userInfo);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
      setUserDropdownOpen(false);
    }
    if (localeDropdownRef.current && !localeDropdownRef.current.contains(event.target as Node)) {
      setLocaleDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: `/${currentLocale}` });
  };

  const getPathWithoutLocale = () => {
    const path = pathname || "/";
    const localePattern = new RegExp(`^/(${locales.join("|")})`);
    return path.replace(localePattern, "") || "/";
  };

  const pathWithoutLocale = getPathWithoutLocale();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-white/95 border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo 和网站名 */}
            <Link href="/" className="flex items-center space-x-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-10 w-10 object-contain rounded-lg"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center shadow-lg">
                  {settings.siteName && settings.siteName.length > 0 ? settings.siteName.charAt(0).toUpperCase() : "B"}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">
                {settings.siteName}
              </span>
            </Link>

            {/* 桌面导航菜单 */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item: any) => {
                const IconComponent = item.icon ? (require("lucide-react") as any)[item.icon] : null;
                return (
                  <Link
                    key={item.id}
                    href={`/${currentLocale}${item.href}`}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathWithoutLocale === item.href
                        ? "text-[#C41E3A] bg-red-50"
                        : "text-gray-700 hover:text-[#C41E3A] hover:bg-red-50"
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 右侧操作 */}
            <div className="flex items-center space-x-4">
              {/* 语言切换 */}
              <div className="relative" ref={localeDropdownRef}>
                <button
                  onClick={() => setLocaleDropdownOpen(!localeDropdownOpen)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#C41E3A] hover:bg-red-50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{localeNames[currentLocale]}</span>
                </button>
                {localeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {locales.map((locale) => (
                        <Link
                          key={locale}
                          href={`/${locale}${pathWithoutLocale}`}
                          className={`block px-4 py-2 text-sm ${
                            locale === currentLocale
                              ? "bg-red-50 text-[#C41E3A]"
                              : "text-gray-700 hover:bg-red-50 hover:text-[#C41E3A]"
                          }`}
                        >
                          {localeNames[locale]}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 用户菜单 */}
              {status === "authenticated" ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-[#C41E3A] hover:bg-red-50 transition-colors"
                  >
                    {userInfo?.image ? (
                      <img src={userInfo.image} alt={userInfo.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{userInfo?.name || session?.user?.name}</span>
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {/* 普通用户菜单项 */}
                        <Link
                          href={`/${currentLocale}/user-center`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C41E3A]"
                        >
                          <User className="w-4 h-4 mr-2" />
                          个人中心
                        </Link>
                        <Link
                          href={`/${currentLocale}/user-center/settings`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C41E3A]"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          账号设置
                        </Link>
                        <div className="border-t my-1"></div>
                        {/* 管理员菜单项 */}
                        {userInfo?.isAdmin && (
                          <>
                            <Link
                              href={`/${currentLocale}/admin`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C41E3A]"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-2" />
                              管理后台
                            </Link>
                            <Link
                              href={`/${currentLocale}/admin/settings`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C41E3A]"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-2" />
                              网站设置
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C41E3A]"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-[#C41E3A] text-white hover:bg-[#8B0000] transition-colors"
                >
                  登录
                </button>
              )}

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#C41E3A] hover:bg-red-50 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              {navItems.map((item: any) => {
                const IconComponent = item.icon ? (require("lucide-react") as any)[item.icon] : null;
                return (
                  <Link
                    key={item.id}
                    href={`/${currentLocale}${item.href}`}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      pathWithoutLocale === item.href
                        ? "text-[#C41E3A] bg-red-50"
                        : "text-gray-700 hover:text-[#C41E3A] hover:bg-red-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>
      
      {/* 登录/注册模态框 */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
