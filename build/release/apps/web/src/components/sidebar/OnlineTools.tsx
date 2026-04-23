"use client";

import { motion } from "framer-motion";

interface OnlineToolsProps {
  tools?: Array<{
    name: string;
    url: string;
    icon: string;
    description: string;
  }>;
}

export default function OnlineTools({ tools = [] }: OnlineToolsProps) {
  const defaultTools = [
    {
      name: "JSON 格式化",
      url: "https://jsonlint.com",
      icon: "📝",
      description: "在线 JSON 验证和格式化",
    },
    {
      name: "Base64 编码",
      url: "https://www.base64encode.org",
      icon: "🔐",
      description: "Base64 编码解码工具",
    },
    {
      name: "Markdown 编辑器",
      url: "https://markdownlivepreview.com",
      icon: "✍️",
      description: "在线 Markdown 编辑预览",
    },
    {
      name: "颜色选择器",
      url: "https://htmlcolorcodes.com",
      icon: "🎨",
      description: "在线颜色选择器和转换器",
    },
  ];

  const displayTools = tools.length > 0 ? tools : defaultTools;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--theme-surface)] rounded-[var(--theme-radius-card)] p-6 shadow-[var(--theme-card-shadow)]"
      suppressHydrationWarning
    >
      <h3 className="text-lg font-bold text-[var(--theme-text)] mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-[var(--theme-primary)] rounded-full"></span>
        在线工具
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {displayTools.map((tool, index) => (
          <a
            key={index}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 rounded-lg hover:bg-[var(--theme-bg)] transition-colors text-center"
          >
            <span className="text-2xl mb-1">{tool.icon}</span>
            <span className="text-xs text-[var(--theme-text)] font-medium">{tool.name}</span>
            <span className="text-xs text-[var(--theme-text-muted)] mt-1 line-clamp-2">{tool.description}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
