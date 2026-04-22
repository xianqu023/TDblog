"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Link from "next/link";

interface CalendarArchiveProps {
  title?: string;
  archives: Array<{
    year: number;
    month: number;
    count: number;
    slug: string;
  }>;
}

export default function CalendarArchive({ title = "文章归档", archives }: CalendarArchiveProps) {
  const getMonthName = (month: number) => {
    const months = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];
    return months[month - 1];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[var(--theme-primary)]" />
        <h3 className="text-lg font-bold text-[var(--theme-text)]">{title}</h3>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {archives.map((archive) => (
          <Link
            key={`${archive.year}-${archive.month}`}
            href={`/archive/${archive.year}/${archive.month}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--theme-bg-alt)] transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[var(--theme-primary)] rounded-full"></div>
              <span className="text-sm text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors">
                {archive.year}年{getMonthName(archive.month)}
              </span>
            </div>
            <span className="text-xs text-[var(--theme-text-muted)] bg-[var(--theme-bg)] px-2 py-1 rounded-full">
              {archive.count} 篇
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
