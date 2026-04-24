/**
 * 优雅双栏主题演示页面
 * 此页面用于展示优雅双栏主题的独立效果
 * 实际使用时请通过主题设置切换主题
 */

import ElegantTwoColumnTheme from "@/components/themes/ElegantTwoColumn";

// 模拟数据
const mockBanners = [
  { id: "1", title: "欢迎来到我们的博客", subtitle: "分享技术、生活和创意内容" },
  { id: "2", title: "最新文章推荐", subtitle: "精选优质内容，等你来读" },
];

interface MockArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  views: number;
  category: string;
  tags: string[];
}

const mockFeaturedArticles: MockArticle[] = [
  { id: "1", slug: "frontend-trends-2026", title: "2026 年前端开发趋势分析", excerpt: "探讨未来前端技术发展方向", date: "2026-04-15", views: 5234, category: "技术", tags: ["前端", "趋势", "2026"] },
  { id: "2", slug: "nextjs-performance", title: "如何构建高性能 Next.js 应用", excerpt: "从架构设计到代码优化", date: "2026-04-12", views: 4123, category: "开发", tags: ["Next.js", "性能", "优化"] },
];

const mockLatestArticles: MockArticle[] = [
  { id: "5", slug: "react-server-components", title: "React Server Components 深度解析", excerpt: "全面理解 React Server Components", date: "2026-04-18", views: 2345, category: "开发", tags: ["React", "RSC", "性能"] },
  { id: "6", slug: "css-container-queries", title: "CSS Container Queries 实战指南", excerpt: "学习使用 CSS Container Queries", date: "2026-04-17", views: 1987, category: "前端", tags: ["CSS", "响应式", "新特性"] },
];

const mockCategories = [
  { id: "1", name: "技术", slug: "tech", count: 45, icon: "💻" },
  { id: "2", name: "设计", slug: "design", count: 23, icon: "🎨" },
  { id: "3", name: "生活", slug: "life", count: 18, icon: "🌟" },
];

const mockHotTags = [
  { name: "React", count: 28 },
  { name: "TypeScript", count: 24 },
  { name: "Next.js", count: 19 },
];

const mockFriendLinks = [
  { name: "GitHub", url: "https://github.com" },
  { name: "掘金", url: "https://juejin.cn" },
];

const mockSiteStats = { articles: 156, views: 125432, comments: 3456, users: 2341 };

// SEO 元数据生成
export async function generateMetadata() {
  return {
    title: "博客首页 - 优雅双栏主题",
    description: "分享技术、设计、生活等精彩内容",
  };
}

export default async function ElegantTwoColumnThemePage() {
  return (
    <ElegantTwoColumnTheme
      banners={mockBanners}
      featuredArticles={mockFeaturedArticles}
      latestArticles={mockLatestArticles}
      categories={mockCategories}
      hotTags={mockHotTags}
      friendLinks={mockFriendLinks}
      siteStats={mockSiteStats}
      authorInfo={{ name: "博客作者", bio: "热爱生活，热爱写作" }}
    />
  );
}
