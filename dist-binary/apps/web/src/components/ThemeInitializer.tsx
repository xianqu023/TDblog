"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem("blog-theme") || "inkwell";
    const root = document.documentElement;
    root.setAttribute("data-theme", saved);

    const themes: Record<string, any> = {
      inkwell: {
        colors: {
          primary: "#1A2456", primaryLight: "#2a3a7a", primaryDark: "#0f1740",
          secondary: "#5D4037", accent: "#B71C1C", accentHover: "#d32f2f",
          bg: "#F5F2E9", bgAlt: "#EDE8D8", bgCard: "#F5F2E9", surface: "#FFFFFF",
          text: "#1A2456", textMuted: "rgba(26, 36, 86, 0.7)", border: "#E8DCCA",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Playfair Display', serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "0.5rem", button: "0.375rem" },
      },
      cyber: {
        colors: {
          primary: "#0ea5e9", primaryLight: "#38bdf8", primaryDark: "#0284c7",
          secondary: "#8b5cf6", accent: "#06b6d4", accentHover: "#22d3ee",
          bg: "#0f172a", bgAlt: "#1e293b", bgCard: "#1e293b", surface: "#334155",
          text: "#f1f5f9", textMuted: "rgba(241, 245, 249, 0.6)", border: "#334155",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "1rem", button: "0.75rem" },
      },
      minimal: {
        colors: {
          primary: "#111827", primaryLight: "#1f2937", primaryDark: "#030712",
          secondary: "#6b7280", accent: "#2563eb", accentHover: "#3b82f6",
          bg: "#ffffff", bgAlt: "#f9fafb", bgCard: "#ffffff", surface: "#ffffff",
          text: "#111827", textMuted: "rgba(17, 24, 39, 0.6)", border: "#e5e7eb",
        },
        fonts: { sans: "'Inter', sans-serif", serif: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
        radius: { card: "0", button: "0" },
      },
    };

    const theme = themes[saved];
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVar, value as string);
      });

      root.style.setProperty("--theme-font-sans", theme.fonts.sans);
      root.style.setProperty("--theme-font-serif", theme.fonts.serif);
      root.style.setProperty("--theme-font-mono", theme.fonts.mono);
      root.style.setProperty("--theme-radius-card", theme.radius.card);
      root.style.setProperty("--theme-radius-button", theme.radius.button);
    }
  }, []);

  return null;
}
