"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Tag } from "lucide-react";

interface TagCloudProps {
  title?: string;
  tags: Array<{
    name: string;
    slug: string;
    count: number;
  }>;
}

export default function TagCloud({ title = "标签云", tags }: TagCloudProps) {
  // 七彩标签颜色
  const tagColors = [
    "bg-gradient-to-r from-red-400 to-pink-400",
    "bg-gradient-to-r from-orange-400 to-amber-400",
    "bg-gradient-to-r from-yellow-400 to-lime-400",
    "bg-gradient-to-r from-green-400 to-emerald-400",
    "bg-gradient-to-r from-blue-400 to-cyan-400",
    "bg-gradient-to-r from-indigo-400 to-purple-400",
    "bg-gradient-to-r from-purple-400 to-pink-400"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-[var(--theme-primary)]" />
        <h3 className="text-lg font-bold text-[var(--theme-text)]">{title}</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {tags.map((tag, index) => {
          const colorIndex = index % tagColors.length;
          const colorClass = tagColors[colorIndex];
          
          return (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className={`
                flex items-center justify-center px-3 py-2 rounded-lg
                ${colorClass}
                text-white
                text-sm
                hover:opacity-90
                transition-all duration-300
                shadow-md
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {tag.name}
              <span className="ml-1 text-xs opacity-80">({tag.count})</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
