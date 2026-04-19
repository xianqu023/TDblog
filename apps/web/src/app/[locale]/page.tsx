import { getTranslations } from "next-intl/server";
import HeroSlider from "@/components/public/HeroSlider";
import ArticleList from "@/components/public/ArticleList";
import { getWidgetConfig } from "@/app/actions/widget-config";
import DynamicSidebar from "@/components/DynamicSidebar";
import { DEFAULT_SIDEBAR_CONFIG } from "@/lib/sidebar-config";
import { locales, type Locale } from "@/lib/i18n/config";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  viewCount?: number;
  tags?: Array<{ name: string; color?: string }>;
  isPremium?: boolean;
  price?: number;
}

async function getArticles(locale: Locale): Promise<Article[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=6`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.articles) {
      return [];
    }
    
    // 转换 API 返回的数据格式
    return data.articles.map((article: any) => {
      // 获取当前语言的翻译
      const translation = article.translations?.[0] || {};
      
      return {
        id: article.id,
        slug: article.slug,
        title: translation.title || article.title || "",
        excerpt: translation.excerpt || article.excerpt || "",
        coverImage: article.coverImage,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount || 0,
        tags: article.tags?.map((at: any) => ({
          name: at.tag?.name || "",
          color: at.tag?.color,
        })) || [],
        isPremium: article.isPremium || false,
        price: article.premiumPrice,
      };
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  
  // Get initial articles from API for current locale
  const initialArticles = await getArticles(locale);
  
  // Get widget config from database
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.home || DEFAULT_SIDEBAR_CONFIG.home;

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left Column - Articles with AJAX loading */}
          <div className="lg:col-span-3">
            <div className="flex items-center mb-8">
              <div className="w-1 h-8 bg-blue-600 rounded mr-3"></div>
              <h2 className="text-3xl font-bold text-gray-900">{t("recentArticles")}</h2>
            </div>

            {/* AJAX Auto-load Article List */}
            <ArticleList locale={locale} initialArticles={initialArticles} />
          </div>

          {/* Right Column - Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <DynamicSidebar widgets={widgets} pageType="home" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
