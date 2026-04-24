"use client";

import { useState, useEffect } from "react";
import { Calendar, Eye, Tag, User, ArrowLeft, Clock, Share2, Bookmark, ChevronUp } from "lucide-react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import MarkdownRenderer from "../MarkdownRenderer";

// 独立的滚动进度条组件 - 直接操作 DOM 避免重新渲染
function ScrollProgressBar() {
  useEffect(() => {
    const handleScroll = () => {
      const progressBar = document.getElementById('scroll-progress-bar');
      if (progressBar) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        // 直接使用 requestAnimationFrame 优化性能
        requestAnimationFrame(() => {
          progressBar.style.width = `${progress}%`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
      <div
        id="scroll-progress-bar"
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        style={{ width: '0%', willChange: 'width' }}
      />
    </div>
  );
}

// 独立的返回顶部按钮组件
function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      <ChevronUp className="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>
  );
}

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  viewCount: number;
  tags: Array<{ name: string; color: string }>;
  author: {
    name: string;
    avatar?: string;
  };
}

interface ArticleContentProps {
  articleData: ArticleData;
  locale: string;
}

export default function ArticleContent({ articleData, locale }: ArticleContentProps) {
  const [readingTime, setReadingTime] = useState(0);

  // 计算阅读时间（假设每分钟阅读 300 字）
  useEffect(() => {
    const textContent = articleData.content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.length;
    setReadingTime(Math.ceil(wordCount / 300));
  }, [articleData.content]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* 阅读进度条 - 使用独立组件避免重新渲染主内容 */}
      <ScrollProgressBar />

      {/* 主内容区 */}
      <div className="px-4 py-8 md:px-8 lg:px-16 xl:px-24">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link
            href={`/${locale}/articles`}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            返回文章列表
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          {/* 封面图片 */}
          {articleData.coverImage && (
            <div className="relative mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[21/9] md:aspect-[21/8]">
                <img
                  src={articleData.coverImage}
                  alt={articleData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          )}

          {/* 文章标题 */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {articleData.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 dark:text-gray-400">
              {/* 作者 */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {articleData.author.name[0]}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">{articleData.author.name}</span>
              </div>

              {/* 分隔符 */}
              <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>

              {/* 发布日期 */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time>{formatDate(articleData.publishedAt)}</time>
              </div>

              {/* 分隔符 */}
              <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>

              {/* 阅读时间 */}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{readingTime} 分钟阅读</span>
              </div>

              {/* 分隔符 */}
              <span className="hidden md:inline text-gray-300 dark:text-gray-600">•</span>

              {/* 阅读量 */}
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{articleData.viewCount} 阅读</span>
              </div>
            </div>

            {/* 标签 */}
            {articleData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {articleData.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      border: `1px solid ${tag.color}30`,
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                <Bookmark className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                <Share2 className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>
          </header>

          {/* 文章内容 */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900 dark:text-white
              prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-6 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-3
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
              prose-p:text-gray-700 dark:text-gray-300 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-[17px]
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
              prose-strong:text-gray-900 dark:text-white prose-strong:font-semibold
              prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800/50
              prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
              prose-pre:rounded-xl prose-pre:p-5 prose-pre:overflow-x-auto
              prose-code:before:content-none prose-code:after:content-none
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-gray-700 dark:text-gray-300 prose-li:leading-relaxed
              prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-500
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500
              prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10
              prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-blockquote:text-gray-600 dark:text-gray-400
              prose-blockquote:italic prose-blockquote:not-italic
              prose-hr:border-gray-200 dark:prose-hr:border-gray-700
              prose-table:w-full prose-table:overflow-x-auto
              prose-thead:bg-gray-50 dark:prose-thead:bg-gray-800/50
              prose-th:p-3 prose-th:text-left prose-th:font-semibold
              prose-td:p-3 prose-td:border-t prose-td:border-gray-200 dark:prose-td:border-gray-700
            "
          >
            <MarkdownRenderer content={articleData.content} />
          </div>

          {/* 文章底部装饰线 */}
          <div className="mt-16 mb-12">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </div>

          {/* 作者卡片 */}
          <div className="mb-12">
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {articleData.author.name[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {articleData.author.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    热爱生活，热爱写作，分享技术与生活。希望通过文字记录成长，分享经验，帮助更多人。
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>活跃作者</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 评论区 */}
          <div className="pb-12">
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">评论</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
            <CommentSection articleId={articleData.id} />
          </div>
        </article>
      </div>

      {/* 返回顶部按钮 - 使用独立组件 */}
      <BackToTopButton />
    </div>
  );
}