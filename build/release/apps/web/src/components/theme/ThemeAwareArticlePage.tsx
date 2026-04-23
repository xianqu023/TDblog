"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";
import { Calendar, Eye, Tag, ArrowLeft, Lock } from "lucide-react";
import Paywall from "@/components/shared/Paywall";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import DynamicSidebar from "@/components/DynamicSidebar";
// 临时注释掉不存在的组件
// import FloatingShareSidebar from "@/components/article/FloatingShareSidebar";
// import CommentSection from "@/components/article/CommentSection";
import { markdownToHtml, getCoverImageUrl } from "@/lib/markdown";

interface ThemeAwareArticlePageProps {
  locale: string;
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    publishedAt: string;
    updatedAt?: string;
    viewCount: number;
    tags: Array<{ name: string; color: string }>;
    isPremium: boolean;
    premiumPrice?: number;
    premiumContent?: string;
    author: {
      name: string;
      avatar?: string;
    };
  };
  widgets: any[];
  translations: {
    backToHome: string;
    articleAuthor: string;
    relatedArticles: string;
    noRelatedArticles: string;
    views: string;
  };
}

export default function ThemeAwareArticlePage({
  locale,
  article,
  widgets,
  translations,
}: ThemeAwareArticlePageProps) {
  const { currentTheme } = useTheme();
  const isUnlocked = false;

  const formatDate = (dateStr: string) => {
    const localeMap: Record<string, string> = {
      zh: "zh-CN",
      en: "en-US",
      ja: "ja-JP",
    };
    return new Date(dateStr).toLocaleDateString(localeMap[locale] || "zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderDefaultLayout = () => (
    <>
      <Link href={`/${locale}`} className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {translations.backToHome}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 relative">
          {/* 临时注释掉 FloatingShareSidebar
          <FloatingShareSidebar
            title={article.title}
            url={`https://example.com/articles/${article.slug}`}
          />
          */}

          <ArticleJsonLd
            title={article.title}
            description={article.excerpt || ""}
            url={`https://example.com/articles/${article.slug}`}
            datePublished={article.publishedAt}
            dateModified={article.updatedAt || article.publishedAt}
            author={article.author.name}
            image={article.coverImage || ""}
            tags={article.tags.map((t) => t.name)}
          />

          {article.coverImage && (
            <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
              <img
                src={getCoverImageUrl(article.coverImage, { width: 1200, height: 500, fit: "crop" })}
                alt={article.title}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] object-cover"
              />
            </div>
          )}

          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                  }}
                >
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {tag.name}
                </span>
              ))}
              {article.isPremium && (
                <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  {locale === "zh" && `付费 ¥${article.premiumPrice}`}
                  {locale === "en" && `Premium $${article.premiumPrice}`}
                  {locale === "ja" && `有料 ¥${article.premiumPrice}`}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <img
                    src={article.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                    alt={article.author.name}
                    className="h-12 w-12 rounded-full mr-3 ring-2 ring-white shadow-sm"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 block">{article.author.name}</span>
                    <span className="text-sm text-gray-500">{translations.articleAuthor}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Eye className="h-4 w-4 mr-2 text-gray-400" />
                  {article.viewCount.toLocaleString(locale === "zh" ? "zh-CN" : locale === "en" ? "en-US" : "ja-JP")}{" "}
                  {translations.views}
                </span>
              </div>
            </div>
          </div>

          <article
            className="prose prose-lg prose-gray max-w-none mb-10 
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-4 prose-headings:mt-8
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-ul:text-gray-700 prose-li:text-gray-700
              prose-strong:text-gray-900
              prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
              prose-a:text-blue-600
              prose-img:rounded-xl prose-img:shadow-lg
              [&>h2:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.content) }}
          />

          {article.isPremium && !isUnlocked && (
            <div className="my-12">
              <Paywall
                articleId={article.id}
                articleTitle={article.title}
                price={article.premiumPrice || 0}
                isUnlocked={isUnlocked}
              />
            </div>
          )}

          <div className="border-t border-gray-200 pt-10 mt-12">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded mr-3"></div>
              <h3 className="text-2xl font-bold text-gray-900">{translations.relatedArticles}</h3>
            </div>
            <p className="text-gray-500 text-center py-8">{translations.noRelatedArticles}</p>
          </div>

          {/* 临时注释掉 CommentSection
          <CommentSection articleId={article.id} />
          */}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <DynamicSidebar
              widgets={widgets}
              pageType="article_detail"
              articleData={{
                authorName: article.author.name,
                authorAvatar: article.author.avatar,
                relatedArticles: [],
              }}
            />
          </div>
        </aside>
      </div>
    </>
  );

  switch (currentTheme) {
    case "elegant-two-column":
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-1" />

          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                  {renderDefaultLayout()}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-1 h-5 bg-gradient-to-b from-green-500 to-teal-500 rounded mr-3"></span>
                      关于作者
                    </h3>
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {article?.author?.name?.charAt(0) || "作"}
                      </div>
                      <h4 className="font-semibold text-gray-800">{article?.author?.name || "博客作者"}</h4>
                      <p className="text-sm text-gray-600 mt-2">热爱生活，热爱写作</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded mr-3"></span>
                      🔥 热门文章
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div key={idx} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-2xl font-black text-gray-200">{idx}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 truncate">热门文章标题 {idx}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              <span>👁️ {1000 * idx} 阅读</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-1 mt-12" />
        </div>
      );
    case "chinese-style":
      return (
        <div className="min-h-screen bg-rice-white">
          <div className="bg-gradient-to-r from-chinese-red to-navy-blue h-1" />

          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                  {renderDefaultLayout()}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                      <span className="w-1 h-5 bg-chinese-red rounded mr-3"></span>
                      关于作者
                    </h3>
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-chinese-red to-navy-blue flex items-center justify-center text-white text-2xl font-bold">
                        {article?.author?.name?.charAt(0) || "作"}
                      </div>
                      <h4 className="font-semibold text-gray-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {article?.author?.name || "博客作者"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-2">热爱生活，热爱写作</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                      <span className="w-1 h-5 bg-chinese-red rounded mr-3"></span>
                      🔥 热门文章
                    </h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div key={idx} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-2xl font-black text-gray-200">{idx}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 truncate" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                              热门文章标题 {idx}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              <span>👁️ {1000 * idx} 阅读</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-chinese-red to-navy-blue h-1 mt-12" />
        </div>
      );
    default:
      return <>{renderDefaultLayout()}</>;
  }
}
