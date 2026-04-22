import { getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/i18n/config";
import ChineseTwoColumnLayout from "@/components/layout/ChineseTwoColumnLayout";
import { getSiteSettings } from "@/lib/site-settings";

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

async function getArticlesByYearMonth(locale: Locale, year: string, month: string): Promise<Article[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&year=${year}&month=${month}&page=1&limit=50`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.articles) {
      return [];
    }
    
    return data.articles.map((article: any) => {
      const translation = article.translations?.[0] || {};
      
      return {
        id: article.id,
        slug: article.slug,
        title: translation.title || article.title || "",
        excerpt: translation.excerpt || article.excerpt || "",
        coverImage: article.coverImage,
        publishedAt: article.publishedAt,
        date: article.publishedAt,
        viewCount: article.viewCount || 0,
        views: article.viewCount || 0,
        category: article.categories?.[0]?.category?.name,
        tags: article.tags?.filter((at: any) => at && at.tag).map((at: any) => at.tag?.name || "") || [],
        isPremium: article.isPremium || false,
        price: article.premiumPrice,
      };
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

async function getTags() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tags?limit=20`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

async function getFriendLinks() {
  // FriendLink 模型暂不存在，返回空数组
  return [];
}

async function getArchives() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/archives`,
      { cache: "no-store" }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.archives) {
      return [];
    }
    
    return data.data.archives.map((archive: any) => ({
      year: archive.year,
      month: archive.month,
      count: archive.count,
      slug: `${archive.year}/${String(archive.month).padStart(2, '0')}`
    }));
  } catch (error) {
    console.error("Failed to fetch archives:", error);
    return [];
  }
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: Locale; year: string; month: string }>;
}) {
  const { locale, year, month } = await params;
  const t = await getTranslations("archive");
  
  const siteSettings = await getSiteSettings();
  
  const [articles, categories, tags, friendLinks, archives] = await Promise.all([
    getArticlesByYearMonth(locale, year, month),
    getCategories(),
    getTags(),
    getFriendLinks(),
    getArchives()
  ]);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  const monthName = monthNames[parseInt(month) - 1] || month;

  return (
    <ChineseTwoColumnLayout
      articles={articles}
      categories={categories}
      tags={tags}
      friendLinks={friendLinks}
      archives={archives}
      siteSettings={siteSettings}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{year}年{monthName}归档</h1>
        
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">该月份暂无文章</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {article.coverImage && (
                  <div className="mb-4">
                    <img 
                      src={article.coverImage} 
                      alt={article.title} 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold mb-2">
                  <a href={`/zh/articles/${article.slug}`} className="hover:text-blue-600">
                    {article.title}
                  </a>
                </h2>
                {article.excerpt && (
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('zh-CN') : ''}</span>
                  {article.viewCount && (
                    <span>阅读 {article.viewCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChineseTwoColumnLayout>
  );
}
