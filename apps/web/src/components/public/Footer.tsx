"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Code2, AtSign, Send } from "lucide-react";
import { useState, useEffect } from "react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
}

export default function Footer() {
  const t = useTranslations("footer");
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "My Blog",
    siteDescription: "分享技术、生活与思考的个人博客平台",
    logoUrl: "",
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    // 从全局变量获取设置（由 layout 注入）
    if (typeof window !== "undefined" && (window as any).__SITE_SETTINGS__) {
      setSettings((window as any).__SITE_SETTINGS__);
    }
    
    // 从 API 获取分类
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 使用默认分类
      setCategories([
        { id: '1', name: '技术', slug: 'technology' },
        { id: '2', name: '生活', slug: 'life' },
        { id: '3', name: '思考', slug: 'thoughts' },
        { id: '4', name: '教程', slug: 'tutorials' },
      ]);
    }
  };

  const links = [
    { label: t("quickLinks"), href: "/about" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-8 w-8 object-contain rounded-lg"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              )}
              <span className="text-xl font-bold text-white">{settings.siteName}</span>
            </div>
            <p className="text-sm text-gray-400">
              {settings.siteDescription}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">分类</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">关注我们</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <Code2 className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <AtSign className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">{t("copyright")}</p>
          <p className="text-sm text-gray-400 mt-2 md:mt-0">{t("poweredBy")}</p>
        </div>
      </div>
    </footer>
  );
}
