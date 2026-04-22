"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

interface AnnouncementProps {
  title?: string;
  content: string;
  type?: 'info' | 'warning' | 'success';
}

export default function Announcement({ 
  title = "公告", 
  content,
  type = 'info'
}: AnnouncementProps) {
  const typeStyles = {
    info: 'from-blue-500 to-blue-600',
    warning: 'from-amber-500 to-amber-600',
    success: 'from-green-500 to-green-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className={`w-5 h-5 text-[var(--theme-primary)]`} />
        <h3 className="text-lg font-bold text-[var(--theme-text)]">{title}</h3>
      </div>
      
      <div className={`p-4 rounded-lg bg-gradient-to-r ${typeStyles[type]} text-white text-sm leading-relaxed`}>
        {content}
      </div>
    </motion.div>
  );
}
