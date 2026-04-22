"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Search, User, Globe, ChevronDown, LogOut, LayoutDashboard, Settings, Palette } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import AuthModal from "./AuthModal";
import { iconMap } from "@/components/admin/IconPicker";

interface SiteSettings {
  siteName: string;
  logoUrl: string;
}

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon?: string;
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

const themeOptions = [
  { slug: "inkwell", name: "文艺复古" },
  { slug: "cyber", name: "现代科技" },
  { slug: "minimal", name: "极简阅读" },
  { slug: "elegant-two-column", name: "优雅双栏" },
  { slug: "chinese-style", name: "中式风格" },
];

export default function Header({ currentLocale, siteSettings }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localeDropdownOpen, setLocaleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // 直接使用siteSettings prop，避免useState导致的闪烁
  const settings = siteSettings || { siteName: "My Blog", logoUrl: "" };
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: "1", href: "/", label: t("home"), icon: "Home" },
    { id: "2", href: "/articles", label: t("articles"), icon: "FileText" },
    { id: "3", href: "/shop", label: t("shop"), icon: "ShoppingBag" },
    { id: "4", href: "/orders", label: t("orders") || "订单", icon: "ShoppingBag" },
  ]);
  const [currentTheme, setCurrentTheme] = useState("inkwell");
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMenus();
    const saved = localStorage.getItem("blog-theme") || "inkwell";
    setCurrentTheme(saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
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
        { id: "3", href: "/shop", label: t("shop"), icon: "ShoppingBag" },
        { id: "4", href: "/orders", label: t("orders") || "订单", icon: "ShoppingBag" },
      ]);
    }
  };

  const getPathWithoutLocale = () => {
    const parts = pathname?.split("/").filter(Boolean) || [];
    if (locales.includes(parts[0] as Locale)) {
      parts.shift();
    }
    return "/" + parts.join("/");
  };

  const pathWithoutLocale = getPathWithoutLocale();

  const isAdmin = session?.user?.permissions?.includes("user:manage") || false;

  const userDisplayName = session?.user?.name || session?.user?.username || "用户";

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: `/${currentLocale}` });
  };

  const applyTheme = (slug: string) => {
    const themes: Record<string, any> = {
      inkwell: {
        colors: {
          primary: "#1A2456", primaryLight: "#2a3a7a", primaryDark: "#0f1740",
          secondary: "#5D4037", accent: "#B71C1C", accentHover: "#d32f2f",
          bg: "#F5F2E9", bgAlt: "#EDE8D8", bgCard: "#F5F2E9", surface: "#FFFFFF",
          text: "#1A2456", textMuted: "rgba(26, 36, 86, 0.7)", border: "#E8DCCA",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Playfair Display', serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "0.5rem", button: "0.375rem" },
      },
      cyber: {
        colors: {
          primary: "#0ea5e9", primaryLight: "#38bdf8", primaryDark: "#0284c7",
          secondary: "#8b5cf6", accent: "#06b6d4", accentHover: "#22d3ee",
          bg: "#0f172a", bgAlt: "#1e293b", bgCard: "#1e293b", surface: "#334155",
          text: "#f1f5f9", textMuted: "rgba(241, 245, 249, 0.6)", border: "#334155",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "1rem", button: "0.75rem" },
      },
      minimal: {
        colors: {
          primary: "#111827", primaryLight: "#1f2937", primaryDark: "#030712",
          secondary: "#6b7280", accent: "#2563eb", accentHover: "#3b82f6",
          bg: "#ffffff", bgAlt: "#f9fafb", bgCard: "#ffffff", surface: "#ffffff",
          text: "#111827", textMuted: "rgba(17, 24, 39, 0.6)", border: "#e5e7eb",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "0", button: "0" },
      },
      "elegant-two-column": {
        colors: {
          primary: "#3b82f6", primaryLight: "#60a5fa", primaryDark: "#2563eb",
          secondary: "#8b5cf6", accent: "#ec4899", accentHover: "#f472b6",
          bg: "#f3f4f6", bgAlt: "#e5e7eb", bgCard: "#ffffff", surface: "#ffffff",
          text: "#1f2937", textMuted: "rgba(31, 41, 55, 0.7)", border: "#e5e7eb",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "0.75rem", button: "0.5rem" },
      },
      "chinese-style": {
        colors: {
          primary: "#c41e3a", primaryLight: "#e8475f", primaryDark: "#9b1b30",
          secondary: "#1e3a5f", accent: "#b87333", accentHover: "#d49155",
          bg: "#f5f0e8", bgAlt: "#e8e0d0", bgCard: "#ffffff", surface: "#ffffff",
          text: "#1a1a1a", textMuted: "rgba(26, 26, 26, 0.7)", border: "#e5e5e5",
        },
        fonts: { sans: "'Noto Sans SC', sans-serif", serif: "'Noto Serif SC', serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "0.75rem", button: "0.5rem" },
      },
    };

    const theme = themes[slug];
    if (!theme) return;

    const root = document.documentElement;
    root.setAttribute("data-theme", slug);

    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssVar, value as string);
    });

    root.style.setProperty("--theme-font-sans", theme.fonts.sans);
    root.style.setProperty("--theme-font-serif", theme.fonts.serif);
    root.style.setProperty("--theme-font-mono", theme.fonts.mono);
    root.style.setProperty("--theme-radius-card", theme.radius.card);
    root.style.setProperty("--theme-radius-button", theme.radius.button);

    localStorage.setItem("blog-theme", slug);
    setCurrentTheme(slug);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b backdrop-blur"
        style={{
          backgroundColor: "var(--theme-nav-bg, rgba(255, 255, 255, 0.95))",
          borderColor: "var(--theme-border, #e5e7eb)",
        }}
      >
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
                <div
                  className="h-8 w-8 rounded-lg"
                  style={{
                    background: "var(--theme-gradient-accent, linear-gradient(135deg, #3b82f6, #8b5cf6))",
                  }}
                />
              )}
              <span
                className="text-xl font-bold"
                style={{ color: "var(--theme-text, #111827)" }}
              >
                {settings.siteName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const IconComponent = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center space-x-1.5 text-sm font-medium transition-colors"
                    style={{
                      color: "var(--theme-text, #374151)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--theme-primary, #3b82f6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--theme-text, #374151)";
                    }}
                  >
                    {IconComponent && (
                      <span style={{ display: "inline-flex", color: "var(--theme-primary, #3b82f6)" }}>
                        <IconComponent className="h-4 w-4" />
                      </span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                className="p-2 transition-colors"
                style={{ color: "var(--theme-text-muted, #6b7280)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--theme-text, #111827)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--theme-text-muted, #6b7280)";
                }}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Switcher */}
              <div className="relative hidden md:block" ref={themeDropdownRef}>
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="p-2 transition-colors"
                  style={{ color: "var(--theme-text-muted, #6b7280)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--theme-text, #111827)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--theme-text-muted, #6b7280)";
                  }}
                >
                  <Palette className="h-5 w-5" />
                </button>

                {themeDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-40 rounded-lg border shadow-lg py-2"
                    style={{
                      backgroundColor: "var(--theme-surface, #ffffff)",
                      borderColor: "var(--theme-border, #e5e7eb)",
                    }}
                  >
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.slug}
                        onClick={() => {
                          applyTheme(theme.slug);
                          setThemeDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{
                          color: currentTheme === theme.slug
                            ? "var(--theme-primary, #3b82f6)"
                            : "var(--theme-text, #374151)",
                          backgroundColor: currentTheme === theme.slug
                            ? "var(--theme-bg-alt, #f3f4f6)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (currentTheme !== theme.slug) {
                            e.currentTarget.style.backgroundColor = "var(--theme-bg-alt, #f3f4f6)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentTheme !== theme.slug) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLocaleDropdownOpen(!localeDropdownOpen)}
                  className="flex items-center space-x-1 p-2 transition-colors"
                  style={{ color: "var(--theme-text-muted, #6b7280)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--theme-text, #111827)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--theme-text-muted, #6b7280)";
                  }}
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">{localeNames[currentLocale]}</span>
                </button>

                {localeDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-32 rounded-lg border shadow-lg py-2"
                    style={{
                      backgroundColor: "var(--theme-surface, #ffffff)",
                      borderColor: "var(--theme-border, #e5e7eb)",
                    }}
                  >
                    {locales.map((locale) => (
                      <Link
                        key={locale}
                        href={`/${locale}${pathWithoutLocale}`}
                        onClick={() => setLocaleDropdownOpen(false)}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{
                          color: locale === currentLocale
                            ? "var(--theme-primary, #3b82f6)"
                            : "var(--theme-text, #374151)",
                          backgroundColor: locale === currentLocale
                            ? "var(--theme-bg-alt, #f3f4f6)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (locale !== currentLocale) {
                            e.currentTarget.style.backgroundColor = "var(--theme-bg-alt, #f3f4f6)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (locale !== currentLocale) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
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
                <div className="relative hidden md:block" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: userDropdownOpen ? "var(--theme-bg-alt, #f3f4f6)" : "transparent",
                    }}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        background: "var(--theme-gradient-accent, linear-gradient(135deg, #3b82f6, #8b5cf6))",
                      }}
                    >
                      {userDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="text-sm font-medium max-w-24 truncate"
                      style={{ color: "var(--theme-text, #374151)" }}
                    >
                      {userDisplayName}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 transition-transform"
                      style={{
                        color: "var(--theme-text-muted, #6b7280)",
                        transform: userDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-lg border shadow-lg py-2"
                      style={{
                        backgroundColor: "var(--theme-surface, #ffffff)",
                        borderColor: "var(--theme-border, #e5e7eb)",
                      }}
                    >
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: "var(--theme-border, #e5e7eb)" }}
                      >
                        <p className="text-sm font-medium" style={{ color: "var(--theme-text, #111827)" }}>
                          {userDisplayName}
                        </p>
                        <p className="text-xs" style={{ color: "var(--theme-text-muted, #6b7280)" }}>
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`/${currentLocale}/user-center`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm transition-colors"
                          style={{ color: "var(--theme-text, #374151)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--theme-bg-alt, #f3f4f6)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <User className="h-4 w-4 mr-3" />
                          {t("userCenter")}
                        </Link>

                        {isAdmin && (
                          <Link
                            href={`/${currentLocale}/admin/dashboard`}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm transition-colors"
                            style={{ color: "var(--theme-text, #374151)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--theme-bg-alt, #f3f4f6)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3" />
                            {t("dashboard")}
                          </Link>
                        )}

                        <Link
                          href={`/${currentLocale}/user-center/settings`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm transition-colors"
                          style={{ color: "var(--theme-text, #374151)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--theme-bg-alt, #f3f4f6)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          {t("settings")}
                        </Link>
                      </div>

                      <div
                        className="border-t py-1"
                        style={{ borderColor: "var(--theme-border, #e5e7eb)" }}
                      >
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                          style={{ color: "var(--theme-accent, #ef4444)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--theme-bg-alt, #f3f4f6)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          {t("logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{
                    background: "var(--theme-gradient-accent, linear-gradient(135deg, #3b82f6, #8b5cf6))",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <User className="h-4 w-4" />
                  <span>{t("login")}</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 transition-colors"
                style={{ color: "var(--theme-text-muted, #6b7280)" }}
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
            <div
              className="md:hidden py-4 border-t"
              style={{ borderColor: "var(--theme-border, #e5e7eb)" }}
            >
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--theme-text, #374151)" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Mobile Theme Switcher */}
                <div className="flex items-center space-x-2 px-4 py-2">
                  <Palette className="h-4 w-4" style={{ color: "var(--theme-text-muted, #6b7280)" }} />
                  <span className="text-sm" style={{ color: "var(--theme-text-muted, #6b7280)" }}>
                    主题:
                  </span>
                  <div className="flex space-x-2">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.slug}
                        onClick={() => applyTheme(theme.slug)}
                        className="px-3 py-1 text-xs rounded-full transition-colors"
                        style={{
                          backgroundColor: currentTheme === theme.slug
                            ? "var(--theme-primary, #3b82f6)"
                            : "var(--theme-bg-alt, #f3f4f6)",
                          color: currentTheme === theme.slug ? "#ffffff" : "var(--theme-text, #374151)",
                        }}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile User Menu */}
                {status === "loading" ? (
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                ) : session?.user ? (
                  <div
                    className="border-t pt-3"
                    style={{ borderColor: "var(--theme-border, #e5e7eb)" }}
                  >
                    <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{
                          background: "var(--theme-gradient-accent, linear-gradient(135deg, #3b82f6, #8b5cf6))",
                        }}
                      >
                        {userDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--theme-text, #111827)" }}>
                          {userDisplayName}
                        </p>
                        <p className="text-xs" style={{ color: "var(--theme-text-muted, #6b7280)" }}>
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/${currentLocale}/user-center`}
                      className="flex items-center px-4 py-2 text-sm transition-colors rounded-lg"
                      style={{ color: "var(--theme-text, #374151)" }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      {t("userCenter")}
                    </Link>

                    {isAdmin && (
                      <Link
                        href={`/${currentLocale}/admin/dashboard`}
                        className="flex items-center px-4 py-2 text-sm transition-colors rounded-lg"
                        style={{ color: "var(--theme-text, #374151)" }}
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
                      className="flex items-center w-full px-4 py-2 text-sm transition-colors rounded-lg"
                      style={{ color: "var(--theme-accent, #ef4444)" }}
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
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors w-fit"
                    style={{
                      background: "var(--theme-gradient-accent, linear-gradient(135deg, #3b82f6, #8b5cf6))",
                    }}
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
