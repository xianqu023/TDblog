import { getTranslations } from "next-intl/server";
import ArticleCard from "@/components/public/ArticleCard";
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
  tags: Array<{ name: string; color?: string }>;
  isPremium: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

async function getArticlesByCategory(locale: Locale, categorySlug: string): Promise<Article[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&category=${categorySlug}&page=1&limit=12`,
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

async function getCategoryBySlug(categorySlug: string): Promise<Category | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories/${categorySlug}`,
      { cache: "no-store" }
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data.success || !data.category) return null;
    
    return data.category;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export default async function CategoryArticlesPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("article");
  const tCommon = await getTranslations("common");
  
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.articles || DEFAULT_SIDEBAR_CONFIG.articles;
  
  const [siteSettings, articles, category] = await Promise.all([
    getSiteSettings(),
    getArticlesByCategory(locale, slug),
    getCategoryBySlug(slug)
  ]);

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

  const friendLinks: Array<{ name: string; url: string }> = [];
  const authorInfo = undefined;
  const archives: any[] = [];

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
          <h1 className="text-4xl font-bold text-gray-900">
            {category?.name || slug}
          </h1>
        </div>
        <p className="text-lg text-gray-600 ml-4">
          {category?.description || `浏览"${category?.name || slug}"分类下的所有文章`}
        </p>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-3">
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
                <p className="text-xl text-gray-600 mb-2">暂无文章</p>
                <p className="text-gray-500">
                  该分类下暂时没有文章
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
