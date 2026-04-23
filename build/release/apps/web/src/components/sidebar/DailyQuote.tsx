"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface DailyQuoteProps {
  quote?: string;
  author?: string;
}

const quotes = [
  { quote: "学而不思则罔，思而不学则殆。", author: "孔子" },
  { quote: "千里之行，始于足下。", author: "老子" },
  { quote: "知之者不如好之者，好之者不如乐之者。", author: "孔子" },
  { quote: "己所不欲，勿施于人。", author: "孔子" },
  { quote: "天行健，君子以自强不息。", author: "周易" },
];

export default function DailyQuote({ quote, author }: DailyQuoteProps) {
  // 根据日期选择每日一句
  const today = new Date();
  const index = today.getDate() % quotes.length;
  const dailyQuote = quote || quotes[index].quote;
  const dailyAuthor = author || quotes[index].author;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="theme-card p-6 bg-gradient-to-br from-[var(--theme-bg)] to-[var(--theme-bg-alt)]"
      suppressHydrationWarning
    >
      <div className="flex items-start gap-3">
        <Quote className="w-6 h-6 text-[var(--theme-primary)] flex-shrink-0 mt-1" />
        <div>
          <p className="text-[var(--theme-text)] text-sm leading-relaxed italic mb-2">
            {dailyQuote}
          </p>
          <p className="text-xs text-[var(--theme-text-muted)] text-right">
            —— {dailyAuthor}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
