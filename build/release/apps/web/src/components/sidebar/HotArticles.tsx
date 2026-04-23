"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame } from "lucide-react";

interface HotArticlesProps {
  title?: string;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    views: number;
    coverImage?: string;
  }>;
}

export default function HotArticles({ title = "热门文章", articles }: HotArticlesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-[var(--theme-primary)]" />
        <h3 className="text-lg font-bold text-[var(--theme-text)]">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="flex gap-3 group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors line-clamp-2">
                {article.title}
              </h4>
              <div className="text-xs text-[var(--theme-text-muted)] mt-1">
                {article.views} 次阅读
              </div>
            </div>
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-16 h-12 object-cover rounded-md flex-shrink-0"
              />
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
