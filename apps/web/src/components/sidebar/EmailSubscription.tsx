"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";

interface EmailSubscriptionProps {
  title?: string;
  description?: string;
}

export default function EmailSubscription({ 
  title = "订阅更新",
  description = "获取最新文章推送" 
}: EmailSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现订阅逻辑
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="theme-card p-6 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] text-white"
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      
      <p className="text-sm opacity-90 mb-4">{description}</p>
      
      {subscribed ? (
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
          <p className="text-sm font-medium">✓ 订阅成功！感谢您的关注</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            立即订阅
          </button>
        </form>
      )}
    </motion.div>
  );
}
