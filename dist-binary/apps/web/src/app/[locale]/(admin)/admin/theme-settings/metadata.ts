/**
 * 主题设置页面 SEO 配置
 */

import { generatePageMetadata } from "@/lib/seo-full";

const SEO_CONFIG = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "TDblog",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  defaultDescription: "TDblog 主题设置 - 自定义您的博客外观",
  defaultImage: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
  author: process.env.NEXT_PUBLIC_SITE_AUTHOR,
};

export const metadata = generatePageMetadata("custom", SEO_CONFIG, {
  title: "主题设置",
  description: "自定义博客主题配置，包括全局样式、侧边组件、广告管理、SEO 优化等",
  canonical: `${SEO_CONFIG.siteUrl}/admin/theme-settings`,
  noindex: true, // 后台页面不索引
  nofollow: true,
});

export default function ThemeSettingsPage() {
  // 页面内容在另一个文件中
}
