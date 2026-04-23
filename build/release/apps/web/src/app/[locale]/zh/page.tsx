import { getWidgetConfig } from "@/app/actions/widget-config";
import { DEFAULT_SIDEBAR_CONFIG } from "@/lib/sidebar-config";
import { type Locale } from "@/lib/i18n/config";
import ChineseTwoColumnLayout from "@/components/layout/ChineseTwoColumnLayout";
import { prisma } from "@blog/database";
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

async function getArticles(locale: Locale): Promise<Article[]> {
  try {
    const apiUrl = `http://localhost:3000/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=50`;
    
    const response = await fetch(apiUrl, { cache: "no-store" });
    
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

async function getAuthorInfo() {
  try {
    const adminUser = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: {
              name: 'admin'
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    if (!adminUser) {
      return null;
    }
    
    return {
      name: adminUser.profile?.displayName || adminUser.username,
      bio: adminUser.profile?.bio || '热爱生活，热爱写作，分享技术与生活',
      avatar: adminUser.profile?.avatarUrl || undefined,
    };
  } catch (error) {
    console.error("Failed to fetch author info:", error);
    return null;
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

export default async function ChineseHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  
  const siteSettings = await getSiteSettings();
  
  const [articles, categories, tags, authorInfo, friendLinks, archives] = await Promise.all([
    getArticles(locale),
    getCategories(),
    getTags(),
    getAuthorInfo(),
    getFriendLinks(),
    getArchives()
  ]);
  
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.home || DEFAULT_SIDEBAR_CONFIG.home;

  return (
    <ChineseTwoColumnLayout
      articles={articles}
      categories={categories}
      tags={tags}
      authorInfo={authorInfo || undefined}
      friendLinks={friendLinks}
      archives={archives}
      siteSettings={siteSettings}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">首页</h1>
      </div>
    </ChineseTwoColumnLayout>
  );
}
