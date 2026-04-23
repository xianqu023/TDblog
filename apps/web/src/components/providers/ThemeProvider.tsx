"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface ThemeConfig {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    accentHover: string;
    bg: string;
    bgAlt: string;
    bgCard: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
  radius: {
    card: string;
    button: string;
  };
}

interface ThemeContextType {
  currentTheme: string;
  themeConfig: ThemeConfig | null;
  setTheme: (slug: string) => void;
  availableThemes: { id: string; name: string; slug: string; description: string; previewUrl: string }[];
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "inkwell",
  themeConfig: null,
  setTheme: () => {},
  availableThemes: [],
});

export function useTheme() {
  return useContext(ThemeContext);
}

const defaultThemes: Record<string, ThemeConfig> = {
  "elegant-two-column": {
    colors: {
      primary: "#3b82f6",
      primaryLight: "#60a5fa",
      primaryDark: "#2563eb",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      accentHover: "#f472b6",
      bg: "#f3f4f6",
      bgAlt: "#e5e7eb",
      bgCard: "#ffffff",
      surface: "#ffffff",
      text: "#1f2937",
      textMuted: "rgba(31, 41, 55, 0.7)",
      border: "#e5e7eb",
    },
    fonts: {
      sans: "'Inter', sans-serif",
      serif: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    radius: {
      card: "0.75rem",
      button: "0.5rem",
    },
  },
  "chinese-two-column": {
    colors: {
      primary: "#c41e3a",
      primaryLight: "#e8475f",
      primaryDark: "#9b1b30",
      secondary: "#1e3a5f",
      accent: "#b87333",
      accentHover: "#d49155",
      bg: "#f5f0e8",
      bgAlt: "#e8e0d0",
      bgCard: "#ffffff",
      surface: "#ffffff",
      text: "#1a1a1a",
      textMuted: "rgba(26, 26, 26, 0.7)",
      border: "#e5e5e5",
    },
    fonts: {
      sans: "'Noto Sans SC', sans-serif",
      serif: "'Noto Serif SC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    radius: {
      card: "0.75rem",
      button: "0.5rem",
    },
  },
  minimal: {
    colors: {
      primary: "#111827",
      primaryLight: "#1f2937",
      primaryDark: "#030712",
      secondary: "#6b7280",
      accent: "#2563eb",
      accentHover: "#3b82f6",
      bg: "#ffffff",
      bgAlt: "#f9fafb",
      bgCard: "#ffffff",
      surface: "#ffffff",
      text: "#111827",
      textMuted: "rgba(17, 24, 39, 0.6)",
      border: "#e5e7eb",
    },
    fonts: {
      sans: "'Inter', sans-serif",
      serif: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    radius: {
      card: "0",
      button: "0",
    },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 初始化时就从localStorage读取主题，避免闪烁
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("blog-theme");
      return saved || "elegant-two-column";
    }
    return "elegant-two-column";
  };

  const [currentTheme, setCurrentTheme] = useState(getInitialTheme());
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [availableThemes, setAvailableThemes] = useState<ThemeContextType["availableThemes"]>([]);

  useEffect(() => {
    // 应用初始主题
    applyTheme(currentTheme);
    
    // 如果没有保存的主题，从API获取激活的主题
    if (!localStorage.getItem("blog-theme")) {
      fetchActiveTheme();
    }
    fetchAvailableThemes();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const res = await fetch("/api/theme-config");
      const data = await res.json();
      if (data.success && data.config) {
        // 从中式主题配置中提取主题信息
        const themeSlug = "chinese-two-column";
        applyTheme(themeSlug);
        localStorage.setItem("blog-theme", themeSlug);
      }
    } catch (error) {
      console.error('Failed to fetch active theme:', error);
    }
  };

  const fetchAvailableThemes = async () => {
    try {
      const res = await fetch("/api/admin/themes?active=true");
      const data = await res.json();
      if (data.success && data.themes) {
        setAvailableThemes(data.themes.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description || "",
          previewUrl: t.previewUrl || "",
        })));
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      setAvailableThemes([
        { id: "1", name: "优雅双栏", slug: "elegant-two-column", description: "现代化双栏布局", previewUrl: "" },
        { id: "2", name: "中式风格", slug: "chinese-two-column", description: "中国传统美学", previewUrl: "" },
        { id: "3", name: "极简阅读", slug: "minimal", description: "纯白极简，专注阅读", previewUrl: "" },
      ]);
    }
  };

  const applyTheme = useCallback((slug: string) => {
    const config = defaultThemes[slug];
    if (!config) return;

    setCurrentTheme(slug);
    setThemeConfig(config);

    const root = document.documentElement;
    root.setAttribute("data-theme", slug);

    Object.entries(config.colors).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    root.style.setProperty("--theme-font-sans", config.fonts.sans);
    root.style.setProperty("--theme-font-serif", config.fonts.serif);
    root.style.setProperty("--theme-font-mono", config.fonts.mono);
    root.style.setProperty("--theme-radius-card", config.radius.card);
    root.style.setProperty("--theme-radius-button", config.radius.button);

    localStorage.setItem("blog-theme", slug);
    
    // 触发自定义事件，通知其他组件主题已更改
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: slug } }));
  }, []);

  const setTheme = useCallback((slug: string) => {
    applyTheme(slug);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}
