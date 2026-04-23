import { getTranslations } from "next-intl/server";
import ArticleCard from "@/components/public/ArticleCard";
import { Search, Filter } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

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
          color: tag.color || "#1A2456",
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
  
  const articles = await getArticles(locale);

  return (
    <div className="min-h-screen theme-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center mb-4">
            <div className="w-1 h-8 bg-theme-primary rounded mr-3"></div>
            <h1 className="text-4xl font-bold theme-text">{t("articles")}</h1>
          </div>
          <p className="text-lg theme-text-muted ml-4">
            {locale === "zh" && "浏览我们的最新文章和教程"}
            {locale === "en" && "Browse our latest articles and tutorials"}
            {locale === "ja" && "最新の記事とチュートリアルを閲覧する"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-text-muted h-5 w-5" />
            <input
              type="text"
              placeholder={tCommon("search")}
              className="w-full pl-12 pr-4 py-3 border-2 border-theme-border rounded-xl focus:outline-none focus:border-theme-primary focus:ring-4 focus:ring-theme-primary/10 transition-all bg-theme-surface theme-text"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-theme-border rounded-xl hover:border-theme-primary hover:text-theme-primary hover:bg-theme-primary/5 transition-all font-medium theme-text">
            <Filter className="h-5 w-5" />
            <span>{tCommon("filter") || "Filter"}</span>
          </button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="col-span-full text-center py-16">
              <p className="text-xl theme-text-muted mb-2">{t("noArticles")}</p>
              <p className="theme-text-muted">
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
            <button className="px-10 py-3.5 bg-gradient-to-r from-theme-primary to-theme-primary-dark text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold">
              {t("loadMore")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
