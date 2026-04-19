import Link from 'next/link';
import { Calendar, Eye, Tag, ArrowLeft, Lock, Check } from 'lucide-react';
import Paywall from '@/components/shared/Paywall';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import { getWidgetConfig } from '@/app/actions/widget-config';
import DynamicSidebar from '@/components/DynamicSidebar';
import { DEFAULT_SIDEBAR_CONFIG } from '@/lib/sidebar-config';
import FloatingShareSidebar from '@/components/article/FloatingShareSidebar';
import type { Locale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import { markdownToHtml, getCoverImageUrl } from '@/lib/markdown';

interface Article {
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
}

async function getArticle(slug: string, locale: string): Promise<Article | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=100`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data.success || !data.articles) return null;
    
    const article = data.articles.find((a: any) => a.slug === slug);
    if (!article) return null;
    
    const translation = article.translations?.[0] || {};
    
    return {
      id: article.id,
      slug: article.slug,
      title: translation.title || article.title || '',
      excerpt: translation.excerpt || article.excerpt,
      content: translation.content || article.content || '',
      coverImage: article.coverImage,
      publishedAt: article.publishedAt || article.createdAt,
      updatedAt: article.updatedAt,
      viewCount: article.viewCount || 0,
      tags: article.tags?.map((tag: any) => ({
        name: tag.tag?.name || tag.name,
        color: tag.tag?.color || tag.color || '#6b7280',
      })) || [],
      isPremium: article.isPremium || false,
      premiumPrice: article.premiumPrice ? parseFloat(article.premiumPrice) : undefined,
      premiumContent: translation.content, // For now, use full content as premium content
      author: {
        name: article.author?.profile?.displayName || article.author?.username || '匿名',
        avatar: article.author?.profile?.avatarUrl,
      },
    };
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

export default async function ArticleDetailPage({ 
  params,
}: { 
  params: Promise<{ slug: string; locale: Locale }> 
}) {
  const { slug, locale } = await params;
  const article = await getArticle(slug, locale);
  
  if (!article) {
    notFound();
  }
  
  const isUnlocked = false; // TODO: Check if user has access
  
  // Get widget config from database
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.article_detail || DEFAULT_SIDEBAR_CONFIG.article_detail;

  const formatDate = (dateStr: string) => {
    const localeMap: Record<string, string> = {
      zh: 'zh-CN',
      en: 'en-US',
      ja: 'ja-JP',
    };
    return new Date(dateStr).toLocaleDateString(localeMap[locale] || 'zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link href={`/${locale}`} className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {locale === 'zh' && '返回首页'}
        {locale === 'en' && 'Back to Home'}
        {locale === 'ja' && 'ホームに戻る'}
      </Link>

      {/* Main Layout: Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-3 relative">
            {/* Floating Share Sidebar */}
            <FloatingShareSidebar
              title={article.title}
              url={`https://example.com/articles/${article.slug}`}
            />

            {/* JSON-LD Structured Data */}
            <ArticleJsonLd
              title={article.title}
              description={article.excerpt || ''}
              url={`https://example.com/articles/${article.slug}`}
              datePublished={article.publishedAt}
              dateModified={article.updatedAt || article.publishedAt}
              author={article.author.name}
              image={article.coverImage || ''}
              tags={article.tags.map(t => t.name)}
            />

            {/* Cover Image - Hero Style (moved to top) */}
            {article.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
                <img
                  src={getCoverImageUrl(article.coverImage, { width: 1200, height: 500, fit: 'crop' })}
                  alt={article.title}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] object-cover"
                />
              </div>
            )}

            {/* Header */}
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
                    {locale === 'zh' && `付费 ¥${article.premiumPrice}`}
                    {locale === 'en' && `Premium $${article.premiumPrice}`}
                    {locale === 'ja' && `有料 ¥${article.premiumPrice}`}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Author Info Card */}
              <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <img
                      src={article.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                      alt={article.author.name}
                      className="h-12 w-12 rounded-full mr-3 ring-2 ring-white shadow-sm"
                    />
                    <div>
                      <span className="font-semibold text-gray-900 block">{article.author.name}</span>
                      <span className="text-sm text-gray-500">
                        {locale === 'zh' && '文章作者'}
                        {locale === 'en' && 'Author'}
                        {locale === 'ja' && '著者'}
                      </span>
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
                    {article.viewCount.toLocaleString(locale === 'zh' ? 'zh-CN' : locale === 'en' ? 'en-US' : 'ja-JP')} 
                    {locale === 'zh' && ' 次阅读'}
                    {locale === 'en' && ' views'}
                    {locale === 'ja' && ' 閲覧'}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Content */}
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

            {/* Paywall */}
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

            {/* Related Articles */}
            <div className="border-t border-gray-200 pt-10 mt-12">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded mr-3"></div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {locale === 'zh' && '相关文章'}
                  {locale === 'en' && 'Related Articles'}
                  {locale === 'ja' && '関連記事'}
                </h3>
              </div>
              <p className="text-gray-500 text-center py-8">
                {locale === 'zh' && '暂无相关文章'}
                {locale === 'en' && 'No related articles yet'}
                {locale === 'ja' && 'まだ関連記事はありません'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <DynamicSidebar
                widgets={widgets}
                pageType="article_detail"
                articleData={{
                  authorName: article.author.name,
                  authorAvatar: article.author.avatar,
                  relatedArticles: []
                }}
              />
            </div>
          </aside>
        </div>
      </div>
  );
}
