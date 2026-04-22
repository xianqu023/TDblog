"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface FriendLink {
  name: string;
  url: string;
  logo?: string;
}

interface FriendLinksProps {
  title?: string;
  links: FriendLink[];
}

export default function FriendLinks({ title = "友情链接", links }: FriendLinksProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="theme-card p-6"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 mb-4">
        <ExternalLink className="w-5 h-5 text-[var(--theme-primary)]" />
        <h3 className="text-lg font-bold text-[var(--theme-text)]">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--theme-bg-alt)] transition-colors group"
          >
            {link.logo ? (
              <img src={link.logo} alt={link.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] flex items-center justify-center text-white text-xs font-bold">
                {link.name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors truncate">
              {link.name}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
