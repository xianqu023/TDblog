"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  title?: string;
  placeholder?: string;
}

export default function SearchBox({ title = "搜索", placeholder = "搜索文章..." }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <h3 className="text-lg font-bold text-[var(--theme-text)] mb-4">{title}</h3>
      
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pl-10 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white text-xs rounded-md hover:shadow-lg transition-all"
        >
          搜索
        </button>
      </form>
    </motion.div>
  );
}
