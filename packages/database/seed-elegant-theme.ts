import { prisma } from "./src/index";

// 主题1 - 优雅双栏博客主题
const elegantTwoColumnTheme = {
  name: "优雅双栏博客主题",
  slug: "elegant-two-column",
  description: "现代化双栏布局，丰富的小组件，强大的SEO，支持Google AdSense，符合中国人审美",
  isDefault: false,
  isActive: false,
  sortOrder: 5,
  config: {
    type: "puck",
    puckData: {
      content: [],
      root: {},
    },
    adSlots: [
      { position: "content-top", type: "custom", enabled: true },
      { position: "content-middle", type: "adsense", enabled: false },
      { position: "sidebar-top", type: "custom", enabled: true },
      { position: "sidebar-middle", type: "adsense", enabled: false },
      { position: "sidebar-bottom", type: "custom", enabled: true },
    ],
    colorScheme: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      background: "#f3f4f6",
      surface: "#ffffff",
      text: "#1f2937",
    },
    widgets: {
      showTags: true,
      showAuthor: true,
      showStats: true,
      showLinks: true,
      showCategories: true,
    },
    components: {},
  },
};

// 主题2 - 中式风格博客主题
const chineseStyleTheme = {
  name: "中式风格博客主题",
  slug: "chinese-style",
  description: "融合中国传统美学与现代Web技术，采用中国红、藏青、墨黑等经典配色，留白对称布局，轻量丝滑动效",
  isDefault: false,
  isActive: false,
  sortOrder: 6,
  config: {
    type: "puck",
    puckData: {
      content: [],
      root: {},
    },
    adSlots: [
      { position: "sidebar-top", type: "adsense", size: "300x250", enabled: false },
      { position: "sidebar-middle", type: "adsense", size: "300x600", enabled: false },
      { position: "content-middle", type: "custom", size: "728x90", enabled: true },
    ],
    colorScheme: {
      primary: "#c41e3a",
      secondary: "#1e3a5f",
      accent: "#b87333",
      background: "#f5f0e8",
      surface: "#ffffff",
      text: "#1a1a1a",
    },
    widgets: {
      showTags: true,
      showAuthor: true,
      showStats: true,
      showLinks: true,
      showCategories: true,
      showHotArticles: true,
    },
    components: {},
  },
};

// 准备种子数据
async function seedThemes() {
  console.log("🎨 开始添加主题...");

  const themes = [elegantTwoColumnTheme, chineseStyleTheme];

  for (const themeData of themes) {
    try {
      // 检查是否已存在该主题
      const existing = await prisma.theme.findUnique({
        where: { slug: themeData.slug },
      });

      if (existing) {
        console.log(`✅ 主题 "${themeData.name}" 已存在，跳过创建`);
        continue;
      }

      // 创建新主题
      const newTheme = await prisma.theme.create({
        data: themeData,
      });

      console.log(`🎉 成功创建主题: ${newTheme.name}`);
      console.log(`📋 主题ID: ${newTheme.id}`);
      console.log(`📋 主题描述: ${newTheme.description}`);
    } catch (error) {
      console.error(`❌ 主题 "${themeData.name}" 创建失败:`, error);
    }
  }
}

// 主种子函数
async function main() {
  console.log("========================================");
  console.log("博客主题系统种子");
  console.log("========================================");

  try {
    await seedThemes();
    console.log("✨ 主题种子执行完成！");
  } catch (error) {
    console.error("💥 种子执行失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果是直接运行
if (require.main === module) {
  main();
}

export { seedThemes, elegantTwoColumnTheme, chineseStyleTheme };
