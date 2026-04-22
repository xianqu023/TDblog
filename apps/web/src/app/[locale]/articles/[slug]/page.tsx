import { notFound } from "next/navigation";
import ChineseTwoColumnLayout from "@/components/layout/ChineseTwoColumnLayout";
import CommentSection from "@/components/public/CommentSection";

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

export default async function ArticleDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = await params;

  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  // 提取文章数据
  const articleData = {
    id: article.id,
    slug: article.slug,
    title: article.translations?.[0]?.title || article.title || "无标题",
    content: article.translations?.[0]?.content || article.content || "",
    excerpt: article.translations?.[0]?.excerpt || article.excerpt || "",
    coverImage: article.coverImage,
    publishedAt: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("zh-CN") : "未发布",
    viewCount: article.viewCount || 0,
    tags: article.tags?.map((t: any) => ({
      name: t.tag.name,
      color: "#C41E3A",
    })) || [],
    author: {
      name: article.author?.profile?.displayName || article.author?.username || "佚名",
      avatar: article.author?.profile?.avatarUrl,
    },
  };

  const categories = [
    { id: "1", name: "技术", slug: "tech", count: 45 },
    { id: "2", name: "生活", slug: "life", count: 32 },
    { id: "3", name: "设计", slug: "design", count: 23 },
  ];

  const hotTags = [
    { name: "React", slug: "react", count: 28 },
    { name: "TypeScript", slug: "typescript", count: 24 },
    { name: "Next.js", slug: "nextjs", count: 19 },
    { name: "CSS", slug: "css", count: 15 },
  ];

  const friendLinks = [
    { name: "GitHub", url: "https://github.com" },
    { name: "掘金", url: "https://juejin.cn" },
    { name: "思否", url: "https://segmentfault.com" },
  ];

  return (
    <ChineseTwoColumnLayout
      articles={[]}
      categories={categories}
      tags={hotTags}
      hotArticles={[]}
      authorInfo={{
        name: "博客作者",
        bio: "热爱生活，热爱写作，分享技术与生活",
        avatar: undefined,
      }}
      friendLinks={friendLinks}
      archives={[]}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        {/* 文章封面 */}
        {articleData.coverImage && (
          <div className="relative h-64 md:h-96">
            <img
              src={articleData.coverImage}
              alt={articleData.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 文章内容 */}
        <div className="p-6 md:p-8">
          {/* 文章标题 */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {articleData.title}
          </h1>

          {/* 文章元数据 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <span>📅 {articleData.publishedAt}</span>
            <span>👁️ {articleData.viewCount} 次阅读</span>
            <div className="flex gap-2">
              {articleData.tags.map((tag: { name: string; color: string }) => (
                <span
                  key={tag.name}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* 文章内容 */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900
              prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-[#C41E3A] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-code:text-gray-700
              prose-pre:bg-gray-50
              prose-pre:border prose-pre:border-gray-200
              prose-ul:my-4 prose-ol:my-4
              prose-li:text-gray-700
            "
            dangerouslySetInnerHTML={{ __html: articleData.content }}
          />

          {/* 作者信息 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#B87333] flex items-center justify-center text-white font-bold text-lg">
                {articleData.author.name[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900">{articleData.author.name}</div>
                <div className="text-sm text-gray-600">热爱生活，热爱写作，分享技术与生活</div>
              </div>
            </div>
          </div>

          {/* 评论系统 */}
          <CommentSection articleId={article.id} />
        </div>
      </div>
    </ChineseTwoColumnLayout>
  );
}
