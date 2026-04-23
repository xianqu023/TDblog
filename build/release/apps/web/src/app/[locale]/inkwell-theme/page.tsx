/**
 * 文艺复古主题演示页面
 * 此页面用于展示文艺复古主题的独立效果
 * 实际使用时请通过主题设置切换主题
 */

import { useTheme } from "@/components/providers/ThemeProvider";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { type Locale } from "@/lib/i18n/config";

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
    title: "博客首页 - 文艺复古主题",
    description: "分享技术、设计、生活等精彩内容",
  };
}

interface InkwellThemePageProps {
  params: {
    locale: Locale;
  };
}

export default async function InkwellThemePage({ params: { locale } }: InkwellThemePageProps) {
  const siteSettings = {
    siteName: "我的博客",
    siteDescription: "分享技术、生活和创意内容",
    logoUrl: "",
    siteKeywords: "技术,博客,前端,开发",
  };

  return (
    <>
      <Header currentLocale={locale} siteSettings={siteSettings} />
      <main className="min-h-screen theme-bg">
        <div className="container mx-auto px-4 py-12">
          {/* 主题标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold theme-text mb-4">文艺复古主题</h1>
            <p className="text-lg theme-text-muted max-w-2xl mx-auto">
              温暖米色调，经典优雅的复古风格，为您的博客增添独特的文艺气息
            </p>
          </div>

          {/* 主题特色 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="theme-card p-6 text-center">
              <div className="w-16 h-16 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold theme-text mb-2">经典配色</h3>
              <p className="theme-text-muted">温暖的米色调搭配深蓝和棕色调，营造复古文艺氛围</p>
            </div>
            <div className="theme-card p-6 text-center">
              <div className="w-16 h-16 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold theme-text mb-2">响应式设计</h3>
              <p className="theme-text-muted">完美适配各种设备，提供流畅的浏览体验</p>
            </div>
            <div className="theme-card p-6 text-center">
              <div className="w-16 h-16 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold theme-text mb-2">优雅动效</h3>
              <p className="theme-text-muted">精心设计的过渡动画，提升用户体验</p>
            </div>
          </div>

          {/* 示例文章 */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold theme-text mb-6">精选文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockFeaturedArticles.map((article) => (
                <div key={article.id} className="theme-card p-6 hover:shadow-lg transition-all duration-300">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-theme-primary/10 text-theme-primary text-sm rounded-full mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-semibold theme-text mb-2">{article.title}</h3>
                    <p className="theme-text-muted mb-4">{article.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm theme-text-muted">
                    <span>{article.date}</span>
                    <span>👁️ {article.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 主题切换提示 */}
          <div className="theme-card p-8 text-center">
            <h2 className="text-2xl font-bold theme-text mb-4">如何使用</h2>
            <p className="theme-text-muted mb-6 max-w-2xl mx-auto">
              您可以通过顶部导航栏的主题切换按钮选择"文艺复古"主题，
              或者在后台管理页面中设置为默认主题
            </p>
            <div className="inline-flex items-center justify-center px-6 py-3 bg-theme-gradient-accent text-white rounded-lg font-medium">
              立即体验文艺复古主题
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
