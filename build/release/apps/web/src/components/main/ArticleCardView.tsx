"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Eye, Tag } from "lucide-react";

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
  isPinned?: boolean;
}

interface ArticleCardViewProps {
  articles: Article[];
}

export default function ArticleCardView({ articles }: ArticleCardViewProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articleList.map((article, index) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden group relative"
          suppressHydrationWarning
        >
          {/* 置顶标识 */}
          {article.isPinned && (
            <div className="absolute top-0 right-0 bg-[#C41E3A] text-white text-xs font-bold px-3 py-1 z-10">
              置顶推荐
            </div>
          )}
          
          {/* 封面图片 */}
          {article.coverImage && (
            <Link href={`/zh/articles/${article.slug}`} className="block overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </Link>
          )}
          
          {/* 文章内容 */}
          <div className="p-6">
            {/* 分类和日期 */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
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
            <Link href={`/zh/articles/${article.slug}`}>
              <h2 className="text-xl font-bold text-[var(--theme-text)] mb-3 group-hover:text-[var(--theme-primary)] transition-colors line-clamp-2">
                {article.title}
              </h2>
            </Link>
            
            {/* 摘要 */}
            <p className="text-[var(--theme-text-muted)] text-sm leading-relaxed mb-4 line-clamp-3">
              {article.excerpt}
            </p>
            
            {/* 标签 */}
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
          </div>
        </motion.article>
      ))}
    </div>
  );
}
