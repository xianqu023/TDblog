import { getTranslations } from "next-intl/server";
import ArticleCard from "@/components/public/ArticleCard";
import { Search, Filter } from "lucide-react";
import ChineseTwoColumnLayout from "@/components/layout/ChineseTwoColumnLayout";
import { getWidgetConfig } from "@/app/actions/widget-config";
import DynamicSidebar from "@/components/DynamicSidebar";
import { DEFAULT_SIDEBAR_CONFIG } from "@/lib/sidebar-config";
import type { Locale } from "@/lib/i18n/config";
import { getSiteSettings } from "@/lib/site-settings";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  viewCount: number;
  tags: Array<{ name: string; color: string }>;
  isPremium: boolean;
}

async function getArticles(locale: Locale): Promise<Article[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=12`,
      { cache: "no-store" }
    );
    
    if (!response.ok) return [];
    const data = await response.json();
    
    if (!data.success || !data.articles) return [];
    
    return data.articles.map((article: any) => {
      const translation = article.translations?.[0] || {};
      return {
        id: article.id,
        slug: article.slug,
        title: translation.title || article.title || "",
        excerpt: translation.excerpt || article.excerpt || "",
        coverImage: article.coverImage,
        publishedAt: article.publishedAt || article.createdAt,
        viewCount: article.viewCount || 0,
        tags: article.tags?.filter((tag: any) => tag && tag.name).map((tag: any) => ({
          name: tag.name || "未命名标签",
          color: tag.color || "#6b7280",
        })) || [],
        isPremium: article.isPremium || false,
      };
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("article");
  const tCommon = await getTranslations("common");
  // Get widget config from database
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.articles || DEFAULT_SIDEBAR_CONFIG.articles;
  
  const [siteSettings, articles] = await Promise.all([
    getSiteSettings(),
    getArticles(locale)
  ]);

  // 获取分类、标签等数据
  const categories = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`,
    { cache: "no-store" }
  ).then(res => res.ok ? res.json() : { success: false, data: [] }).then(data => data.data || []);

  const tags = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tags?limit=10`,
    { cache: "no-store" }
  ).then(res => res.ok ? res.json() : { success: false, data: [] }).then(data => data.data || []);

  const hotArticles = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=5&orderBy=views`,
    { cache: "no-store" }
  ).then(res => res.ok ? res.json() : { success: false, data: [] }).then(data => data.articles || []);

  // friendLinks API 可能不存在，使用空数组
  const friendLinks: Array<{ name: string; url: string }> = [];
  const authorInfo = undefined;
  
  // 获取归档数据
  const archives = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/archives`,
    { cache: "no-store" }
  ).then(res => res.ok ? res.json() : { success: false, data: { archives: [] } })
    .then(data => {
      if (data.success && data.data && data.data.archives) {
        return data.data.archives.map((archive: any) => ({
          year: archive.year,
          month: archive.month,
          count: archive.count,
          slug: `${archive.year}/${String(archive.month).padStart(2, '0')}`
        }));
      }
      return [];
    });

  return (
    <ChineseTwoColumnLayout
      articles={articles}
      categories={categories}
      tags={tags}
      hotArticles={hotArticles}
      authorInfo={authorInfo}
      friendLinks={friendLinks}
      archives={archives}
      siteSettings={siteSettings}
    >
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-1 h-8 bg-blue-600 rounded mr-3"></div>
          <h1 className="text-4xl font-bold text-gray-900">{t("articles")}</h1>
        </div>
        <p className="text-lg text-gray-600 ml-4">
          {locale === "zh" && "浏览我们的最新文章和教程"}
          {locale === "en" && "Browse our latest articles and tutorials"}
          {locale === "ja" && "最新の記事とチュートリアルを閲覧する"}
        </p>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={tCommon("search")}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium">
              <Filter className="h-5 w-5" />
              <span>{tCommon("filter") || "Filter"}</span>
            </button>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt}
                  coverImage={article.coverImage}
                  publishedAt={article.publishedAt}
                  viewCount={article.viewCount}
                  tags={article.tags}
                  isPremium={article.isPremium}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-16">
                <p className="text-xl text-gray-600 mb-2">{t("noArticles")}</p>
                <p className="text-gray-500">
                  {locale === "zh" && "请前往后台管理添加文章"}
                  {locale === "en" && "Please add articles from admin panel"}
                  {locale === "ja" && "管理パネルから記事を追加してください"}
                </p>
              </div>
            )}
          </div>

          {/* Load More */}
          {articles.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
                {t("loadMore")}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <DynamicSidebar widgets={widgets} pageType="articles" />
          </div>
        </div>
      </div>
    </ChineseTwoColumnLayout>
  );
}
