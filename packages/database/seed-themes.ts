import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultThemes = [
  {
    name: "文艺复古",
    slug: "inkwell",
    description: "温暖米色调，经典优雅风格，适合文学艺术类博客",
    isDefault: true,
    isActive: true,
    sortOrder: 0,
    config: {
      colors: {
        primary: "#1A2456",
        primaryLight: "#2a3a7a",
        primaryDark: "#0f1740",
        secondary: "#5D4037",
        accent: "#B71C1C",
        accentHover: "#d32f2f",
        bg: "#F5F2E9",
        bgAlt: "#EDE8D8",
        bgCard: "#F5F2E9",
        surface: "#FFFFFF",
        text: "#1A2456",
        textMuted: "rgba(26, 36, 86, 0.7)",
        border: "#E8DCCA",
      },
      fonts: {
        sans: "'Inter', sans-serif",
        serif: "'Playfair Display', serif",
        mono: "'JetBrains Mono', monospace",
      },
      radius: { card: "0.5rem", button: "0.375rem" },
    },
  },
  {
    name: "现代科技",
    slug: "cyber",
    description: "深色科技风，未来感设计，适合技术类博客",
    isDefault: false,
    isActive: true,
    sortOrder: 1,
    config: {
      colors: {
        primary: "#0ea5e9",
        primaryLight: "#38bdf8",
        primaryDark: "#0284c7",
        secondary: "#8b5cf6",
        accent: "#06b6d4",
        accentHover: "#22d3ee",
        bg: "#0f172a",
        bgAlt: "#1e293b",
        bgCard: "#1e293b",
        surface: "#334155",
        text: "#f1f5f9",
        textMuted: "rgba(241, 245, 249, 0.6)",
        border: "#334155",
      },
      fonts: {
        sans: "'Inter', sans-serif",
        serif: "'Inter', sans-serif",
        mono: "'JetBrains Mono', monospace",
      },
      radius: { card: "1rem", button: "0.75rem" },
    },
  },
  {
    name: "极简阅读",
    slug: "minimal",
    description: "纯白极简，专注阅读体验，适合文字类博客",
    isDefault: false,
    isActive: true,
    sortOrder: 2,
    config: {
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
      radius: { card: "0", button: "0" },
    },
  },
  {
    name: "优雅双栏",
    slug: "elegant-two-column",
    description: "现代化双栏布局，丰富的小组件，强大的SEO，支持Google AdSense",
    isDefault: false,
    isActive: true,
    sortOrder: 3,
    config: {
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
      radius: { card: "0.75rem", button: "0.5rem" },
    },
  },
  {
    name: "中式风格",
    slug: "chinese-style",
    description: "融合中国传统美学，中国红/藏青/墨黑配色，留白对称布局",
    isDefault: false,
    isActive: true,
    sortOrder: 4,
    config: {
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
      radius: { card: "0.75rem", button: "0.5rem" },
    },
  },
];

async function seedThemes() {
  console.log("Seeding themes...");

  for (const theme of defaultThemes) {
    const existing = await prisma.theme.findUnique({
      where: { slug: theme.slug },
    });

    if (existing) {
      console.log(`Theme "${theme.name}" already exists, skipping...`);
      continue;
    }

    await prisma.theme.create({
      data: theme,
    });

    console.log(`Created theme: ${theme.name}`);
  }

  console.log("Themes seeded successfully!");
}

seedThemes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
