const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultThemes = [
  {
    slug: "inkwell",
    name: "文艺复古",
    description: "温暖米色调，经典优雅风格，适合文学艺术类博客",
    previewUrl: "",
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
    slug: "cyber",
    name: "现代科技",
    description: "深色科技风，未来感设计，适合技术类博客",
    previewUrl: "",
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
    slug: "minimal",
    name: "极简阅读",
    description: "纯白极简，专注阅读体验，适合文字类博客",
    previewUrl: "",
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
];

async function seedThemes() {
  console.log('🌱 开始导入默认主题...');

  for (const theme of defaultThemes) {
    try {
      const existing = await prisma.theme.findUnique({ where: { slug: theme.slug } });
      if (existing) {
        console.log(`⏭️  主题 ${theme.slug} 已存在，跳过`);
        continue;
      }

      await prisma.theme.create({
        data: {
          name: theme.name,
          slug: theme.slug,
          description: theme.description,
          previewUrl: theme.previewUrl,
          isDefault: theme.isDefault,
          isActive: theme.isActive,
          sortOrder: theme.sortOrder,
          config: theme.config,
        },
      });
      console.log(`✅ 主题 ${theme.slug} (${theme.name}) 已创建`);
    } catch (error) {
      console.error(`❌ 创建主题 ${theme.slug} 失败:`, error.message);
    }
  }

  console.log('\n🎉 默认主题导入完成!');
  await prisma.$disconnect();
}

seedThemes().catch((error) => {
  console.error('导入失败:', error);
  process.exit(1);
});
