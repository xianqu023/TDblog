"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Globe, LogOut, Home, FileText, MessageSquare,
  FileCode, Link2, Star, Settings, LayoutDashboard,
  Users, ShoppingBag, Eye, PenTool, Upload, Tag, FileBox,
  Sliders, ChevronRight, Monitor, Sun, Moon, Sparkles, Palette,
} from "lucide-react";
import { useDarkMode } from "./DarkModeProvider";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FileText, MessageSquare, FileCode, Link2,
  Star, Settings, Home, Users, ShoppingBag, Eye,
  PenTool, Upload, Tag, FileBox, Sliders, Monitor, Globe, LogOut, Sun, Moon, Sparkles, Palette,
};

interface NavItem {
  icon?: string;
  label: string;
  href?: string;
  children?: { icon: string; label: string; href: string }[];
}

const navItems: NavItem[] = [
  { icon: "LayoutDashboard", label: "概览", href: "/admin/dashboard" },
  { icon: "FileBox", label: "文件管理", href: "/admin/files" },
  {
    label: "内容管理",
    children: [
      { icon: "FileText", label: "文章管理", href: "/admin/articles" },
      { icon: "Eye", label: "页面管理", href: "/admin/pages" },
      { icon: "Tag", label: "文档系列", href: "/admin/categories" },
      { icon: "Sliders", label: "菜单管理", href: "/admin/menus" },
    ],
  },
  { icon: "MessageSquare", label: "评论管理", href: "/admin/comments" },
  { icon: "Link2", label: "友链管理", href: "/admin/links" },
  {
    label: "互动管理",
    children: [
      { icon: "Star", label: "友链管理", href: "/admin/links" },
      { icon: "Users", label: "用户管理", href: "/admin/users" },
    ],
  },
  {
    label: "系统管理",
    children: [
      { icon: "Settings", label: "系统设置", href: "/admin/settings" },
      { icon: "Palette", label: "主题设置", href: "/admin/theme-settings" },
      { icon: "ShoppingBag", label: "商城管理", href: "/admin/shop" },
      { icon: "Sparkles", label: "AI 配置", href: "/admin/ai-config" },
    ],
  },
];

interface SiteSettings {
  siteName: string;
  logoUrl: string;
}

interface UserInfo {
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "内容管理": true,
    "互动管理": true,
    "系统管理": true,
  });
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [settings, setSettings] = useState<SiteSettings>({ siteName: "", logoUrl: "" });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    loadSiteInfo();
  }, []);

  const loadSiteInfo = async () => {
    try {
      const response = await fetch('/api/site-info');
      const data = await response.json();
      if (data.success && data.data.site) {
        setSettings(data.data.site);
        if (data.data.user) {
          setUserInfo(data.data.user);
        }
      }
    } catch (error) {
      console.error('Failed to load site info:', error);
    }
  };

  const isActive = (href?: string) => {
    if (!href || !pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-40 h-full w-64 flex flex-col transition-all duration-300
          ${darkMode ? "bg-[#1a1d23]" : "bg-white"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo & User */}
        <div className={`px-5 py-5 ${darkMode ? "bg-[#1a1d23]" : "bg-white"}`}>
          <Link href="/" className="flex items-center space-x-3 mb-4">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName || "Logo"}
                className="w-9 h-9 rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25">
                {settings.siteName && settings.siteName.length > 0 ? settings.siteName.charAt(0).toUpperCase() : "TD"}
              </div>
            )}
            <div>
              <span className={`text-sm font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                {settings.siteName || "和知鱼"}
              </span>
              <div className="flex items-center mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">Admin</span>
              </div>
            </div>
          </Link>
          {userInfo && (
            <div className={`flex items-center space-x-3 px-3 py-3 rounded-xl ${darkMode ? "bg-[#22262e]" : "bg-gray-50"}`}>
              {userInfo.avatarUrl ? (
                <img
                  src={userInfo.avatarUrl}
                  alt={userInfo.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {userInfo.displayName && userInfo.displayName.length > 0 ? userInfo.displayName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${darkMode ? "text-gray-100" : "text-gray-800"} truncate`}>{userInfo.displayName || userInfo.username || "用户"}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>{userInfo.email || ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto px-4">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedMenus[item.label] || false;
              return (
                <div key={item.label} className="mb-2">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex items-center w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="space-y-1 mt-1">
                      {item.children.map((child) => {
                        const active = isActive(child.href);
                        const ChildIcon = iconMap[child.icon];
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                              flex items-center px-3 py-2.5 rounded-xl text-sm transition-all
                              ${active
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                : darkMode
                                ? "text-gray-400 hover:bg-[#22262e] hover:text-gray-200"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }
                            `}
                          >
                            {ChildIcon && <ChildIcon className="h-4 w-4 flex-shrink-0 mr-2.5" />}
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const ItemIcon = item.icon ? iconMap[item.icon] : null;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href || item.label}
                href={item.href || "#"}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-xl text-sm transition-all mb-1
                  ${active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : darkMode
                    ? "text-gray-400 hover:bg-[#22262e] hover:text-gray-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4 flex-shrink-0 mr-2.5" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-4 ${darkMode ? "bg-[#1a1d23]" : "bg-white"}`}>
          <div className={`rounded-xl p-3 space-y-1 ${darkMode ? "bg-[#22262e]" : "bg-gray-50"}`}>
            <Link
              href="/"
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-[#2a2e37]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Globe className="h-4 w-4 mr-2.5" />
              <span>访问前台</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                darkMode
                  ? "text-yellow-400 hover:text-yellow-300 hover:bg-[#2a2e37]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4 mr-2.5" /> : <Moon className="h-4 w-4 mr-2.5" />}
              <span>{darkMode ? "浅色模式" : "深色模式"}</span>
            </button>
            <Link
              href="/api/auth/signout"
              className="flex items-center px-3 py-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2.5" />
              <span>退出登录</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
