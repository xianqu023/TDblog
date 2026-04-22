import { getWidgetConfig } from "@/app/actions/widget-config";
import { DEFAULT_SIDEBAR_CONFIG } from "@/lib/sidebar-config";
import { locales, type Locale } from "@/lib/i18n/config";
import ThemeRenderer from "@/components/theme-editor/ThemeRenderer";
import { prisma } from "@blog/database";

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
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=8`,
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
        date: article.publishedAt, // 兼容 ArticleCardView
        viewCount: article.viewCount || 0,
        views: article.viewCount || 0, // 兼容 ArticleCardView
        category: article.categories?.[0]?.category?.name,
        tags: article.tags?.map((at: any) => at.tag?.name || "") || [],
        isPremium: article.isPremium || false,
        isPinned: article.isPinned || false,
        price: article.premiumPrice,
      };
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  icon?: string;
}

interface HotTag {
  name: string;
  slug: string;
  count: number;
}

async function getCategories(): Promise<Category[]> {
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
      icon: "📄",
      count: 0,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

async function getHotTags(): Promise<HotTag[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tags?limit=10`,
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
      name: tag.name,
      slug: tag.slug,
      count: tag._count?.articles || 0,
    }));
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

async function getHotArticles(locale: Locale): Promise<Article[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&sort=views&limit=5`,
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
        date: article.publishedAt, // 兼容 ArticleCardView
        viewCount: article.viewCount || 0,
        views: article.viewCount || 0, // 兼容 ArticleCardView
        category: article.categories?.[0]?.category?.name,
        tags: article.tags?.filter((at: any) => at && at.tag).map((at: any) => at.tag?.name || "") || [],
        isPremium: article.isPremium || false,
        price: article.premiumPrice,
      };
    });
  } catch (error) {
    console.error("Failed to fetch hot articles:", error);
    return [];
  }
}

async function getArchives(): Promise<Array<{ year: number; month: number; count: number; slug: string }>> {
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
      slug: `${archive.year}/${String(archive.month).padStart(2, '0')}`,
    }));
  } catch (error) {
    console.error("Failed to fetch archives:", error);
    return [];
  }
}

async function getActiveTheme() {
  try {
    const activeTheme = await prisma.theme.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return activeTheme;
  } catch (error) {
    console.error("Failed to get active theme:", error);
    return null;
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  
  const activeTheme = await getActiveTheme();
  
  // 检查是否是自定义主题编辑器格式（包含 components 数组）
  const config = activeTheme?.config as any;
  if (config && typeof config === "object" && Array.isArray(config.components)) {
    return <ThemeRenderer components={config.components} />;
  }
  
  // 否则使用默认布局，传递主题配置给前端
  const initialArticles = await getArticles(locale);
  const categories = await getCategories();
  const hotTags = await getHotTags();
  const hotArticles = await getHotArticles(locale);
  const archives = await getArchives();
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.home || DEFAULT_SIDEBAR_CONFIG.home;

  // 构建包含主题 slug 的配置对象
  const themeConfig = activeTheme && activeTheme.config && typeof activeTheme.config === "object" ? {
    ...activeTheme.config as object,
    slug: activeTheme.slug, // 添加主题 slug
  } : null;

  // 根据主题 slug 渲染不同的页面
  if (activeTheme?.slug === 'chinese-two-column') {
    // 使用中式双栏布局渲染
    const ChineseTwoColumnLayout = (await import('@/components/layout/ChineseTwoColumnLayout')).default;
    
    return (
      <ChineseTwoColumnLayout
        articles={initialArticles}
        categories={categories}
        tags={hotTags}
        hotArticles={hotArticles}
        archives={archives}
      >
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">首页</h1>
          {/* 其他默认主题内容 */}
        </div>
      </ChineseTwoColumnLayout>
    );
  }

  // 默认主题渲染逻辑（简化）
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">首页</h1>
      {/* 其他默认主题内容 */}
    </div>
  );
}
