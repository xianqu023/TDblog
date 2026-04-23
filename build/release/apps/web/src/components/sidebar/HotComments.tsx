"use client";

import { motion } from "framer-motion";

interface HotCommentsProps {
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    articleTitle: string;
    date: string;
  }>;
}

export default function HotComments({ comments = [] }: HotCommentsProps) {
  // 模拟数据
  const mockComments = [
    {
      id: "1",
      author: "张三",
      content: "写得非常好，学到了很多！",
      articleTitle: "2026 年前端开发趋势分析",
      date: "2026-04-20",
    },
    {
      id: "2",
      author: "李四",
      content: "感谢分享，期待更多内容",
      articleTitle: "如何构建高性能 Next.js 应用",
      date: "2026-04-19",
    },
    {
      id: "3",
      author: "王五",
      content: "太实用了，已收藏",
      articleTitle: "React Server Components 深度解析",
      date: "2026-04-18",
    },
  ];

  const displayComments = comments.length > 0 ? comments : mockComments;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--theme-surface)] rounded-[var(--theme-radius-card)] p-6 shadow-[var(--theme-card-shadow)]"
      suppressHydrationWarning
    >
      <h3 className="text-lg font-bold text-[var(--theme-text)] mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-[var(--theme-primary)] rounded-full"></span>
        热门评论
      </h3>
      <div className="space-y-4">
        {displayComments.map((comment) => (
          <div key={comment.id} className="border-b border-[var(--theme-border)] last:border-0 pb-3 last:pb-0">
            <div className="text-sm text-[var(--theme-text)] line-clamp-2 mb-1">
              {comment.content}
            </div>
            <div className="text-xs text-[var(--theme-text-muted)] flex items-center justify-between">
              <span>{comment.author}</span>
              <span className="line-clamp-1">{comment.articleTitle}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
