import { notFound } from "next/navigation";
import ArticleContent from "@/components/public/ArticleContent";
import { prisma } from "@blog/database";

async function getArticleBySlug(slug: string, locale: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/articles-by-slug/${slug}?locale=${locale}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.article;
  } catch (error) {
    console.error("Failed to fetch article:", error);
    return null;
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

export default async function ArticleDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = await params;

  const article = await getArticleBySlug(slug, locale);
  const activeTheme = await getActiveTheme();

  if (!article) {
    notFound();
  }

  const articleData = {
    id: article.id,
    slug: article.slug,
    title: article.translations?.[0]?.title || article.title || "无标题",
    content: article.translations?.[0]?.content || article.content || "",
    coverImage: article.coverImage,
    publishedAt: article.publishedAt || new Date().toISOString(),
    viewCount: article.viewCount || 0,
    tags: article.tags?.filter((t: any) => t && t.tag).map((t: any) => ({
      name: t.tag?.name || "未命名标签",
      color: t.tag?.color || "#1A2456",
    })) || [],
    author: {
      name: article.author?.profile?.displayName || article.author?.username || "佚名",
      avatar: article.author?.profile?.avatarUrl,
    },
  };

  const articleContent = <ArticleContent articleData={articleData} locale={locale} />;

  if (activeTheme?.slug === 'chinese-two-column') {
    const ChineseTwoColumnLayout = (await import('@/components/layout/ChineseTwoColumnLayout')).default;
    
    return (
      <ChineseTwoColumnLayout
        articles={[]}
        categories={[]}
        tags={[]}
        hotArticles={[]}
        archives={[]}
      >
        {articleContent}
      </ChineseTwoColumnLayout>
    );
  }

  if (activeTheme?.slug === 'elegant-two-column') {
    const ElegantTwoColumnLayout = (await import('@/components/layout/ElegantTwoColumnLayout')).default;
    
    return (
      <ElegantTwoColumnLayout
        articles={[]}
        categories={[]}
        tags={[]}
        hotArticles={[]}
        archives={[]}
      >
        {articleContent}
      </ElegantTwoColumnLayout>
    );
  }

  if (activeTheme?.slug === 'minimal') {
    const MinimalLayout = (await import('@/components/layout/MinimalLayout')).default;
    
    return (
      <MinimalLayout
        articles={[]}
        categories={[]}
        tags={[]}
        hotArticles={[]}
        archives={[]}
      >
        {articleContent}
      </MinimalLayout>
    );
  }

  return articleContent;
}
