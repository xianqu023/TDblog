"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { useState } from "react";

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = availableThemes.length > 0 ? availableThemes : [
    { id: "1", name: "文艺复古", slug: "inkwell", description: "", previewUrl: "" },
    { id: "2", name: "现代科技", slug: "cyber", description: "", previewUrl: "" },
    { id: "3", name: "极简阅读", slug: "minimal", description: "", previewUrl: "" },
    { id: "4", name: "优雅双栏", slug: "elegant-two-column", description: "", previewUrl: "" },
    { id: "5", name: "中式风格", slug: "chinese-style", description: "", previewUrl: "" },
  ];

  const themeIcons: Record<string, string> = {
    inkwell: "fa-pen-fancy",
    cyber: "fa-bolt",
    minimal: "fa-book-open",
    "elegant-two-column": "fa-columns",
    "chinese-style": "fa-torii-gate",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="切换主题"
      >
        <i className={`fa ${themeIcons[currentTheme] || "fa-palette"} text-lg`}></i>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20 overflow-hidden">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                选择主题
              </p>
              {themes.map((theme) => (
                <button
                  key={theme.slug}
                  onClick={() => {
                    setTheme(theme.slug);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentTheme === theme.slug
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <i className={`fa ${themeIcons[theme.slug] || "fa-circle"} w-4 text-center`}></i>
                  <div className="text-left">
                    <p className="font-medium">{theme.name}</p>
                    {theme.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{theme.description}</p>
                    )}
                  </div>
                  {currentTheme === theme.slug && (
                    <i className="fa fa-check ml-auto text-blue-600 dark:text-blue-400"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
