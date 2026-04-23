"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Eye, Tag, FileText } from "lucide-react";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  date: string;
  views: number;
  category?: string;
  tags?: string[] | Array<{ name: string; color?: string }>;
}

interface ArticleListViewProps {
  articles: Article[];
}

export default function ArticleListView({ articles }: ArticleListViewProps) {
  // 处理 undefined 或 null 的情况
  const articleList = articles || [];
  
  if (articleList.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">暂无文章</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {articleList.map((article, index) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden group"
          suppressHydrationWarning
        >
          <div className="flex flex-col md:flex-row gap-6 p-6">
            {/* 封面图片 */}
            {article.coverImage && (
              <Link href={`/articles/${article.slug}`} className="md:flex-shrink-0">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full md:w-48 h-48 object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            )}
            
            {/* 文章内容 */}
            <div className="flex-1 min-w-0">
              {/* 分类和日期 */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
                {article.category && (
                  <span className="px-2 py-1 bg-[#C41E3A]/10 text-[#C41E3A] rounded-md font-medium">
                    {article.category}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(article.date).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views} 阅读</span>
                </div>
              </div>
              
              {/* 标题 */}
              <Link href={`/articles/${article.slug}`}>
                <h2 className="text-xl font-bold text-[var(--theme-text)] mb-3 group-hover:text-[var(--theme-primary)] transition-colors">
                  {article.title}
                </h2>
              </Link>
              
              {/* 摘要 */}
              <p className="text-[var(--theme-text-muted)] text-sm leading-relaxed mb-4 line-clamp-2">
                {article.excerpt}
              </p>
              
              {/* 标签和阅读更多 */}
              <div className="flex items-center justify-between">
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => {
                      const tagName = typeof tag === 'string' ? tag : tag.name;
                      return (
                        <span
                          key={tagName}
                          className="inline-flex items-center gap-1 text-xs text-[var(--theme-text-muted)] bg-[var(--theme-bg)] px-2 py-1 rounded-md hover:bg-[var(--theme-primary)] hover:text-white transition-colors"
                        >
                          <Tag className="w-3 h-3" />
                          {tagName}
                        </span>
                      );
                    })}
                  </div>
                )}
                <Link
                  href={`/articles/${article.slug}`}
                  className="inline-flex items-center gap-1 text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primary-dark)] transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  阅读全文
                </Link>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
