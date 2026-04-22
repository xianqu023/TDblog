import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

// 默认中式主题配置
const DEFAULT_CONFIG = {
  layout: {
    isTwoColumn: true,
    sidebarPosition: "right" as "left" | "right",
    isStickySidebar: true,
    articleViewMode: "card" as "card" | "list",
    enableAnimations: true,
  },
  sidebarWidgets: {
    searchBox: { enabled: true, order: 1, title: "搜索框" },
    authorInfo: { enabled: true, order: 2, title: "博主信息" },
    hotArticles: { enabled: true, order: 3, title: "热门文章" },
    tagCloud: { enabled: true, order: 4, title: "标签云" },
    calendarArchive: { enabled: true, order: 5, title: "日历归档" },
    announcement: { enabled: true, order: 6, title: "公告通知" },
    dailyQuote: { enabled: true, order: 7, title: "每日一句" },
    friendLinks: { enabled: true, order: 8, title: "友情链接" },
    emailSubscription: { enabled: true, order: 9, title: "邮件订阅" },
    categories: { enabled: false, order: 10, title: "分类目录" },
    latestArticles: { enabled: false, order: 11, title: "最新文章" },
    randomArticles: { enabled: false, order: 12, title: "随机推荐" },
    siteStats: { enabled: false, order: 13, title: "站点统计" },
    weatherWidget: { enabled: false, order: 14, title: "天气组件" },
    hotComments: { enabled: false, order: 15, title: "最新评论" },
    onlineTools: { enabled: false, order: 16, title: "在线工具" },
    photoGallery: { enabled: false, order: 17, title: "照片画廊" },
  },
  adSlots: {
    topBanner: { enabled: false, type: "adsense", size: "728x90", imageUrl: "", linkUrl: "" },
    sidebarTop: { enabled: false, type: "adsense", size: "300x250", imageUrl: "", linkUrl: "" },
    sidebarMiddle: { enabled: false, type: "adsense", size: "300x600", imageUrl: "", linkUrl: "" },
    articleListMiddle: { enabled: false, type: "adsense", size: "728x90", imageUrl: "", linkUrl: "" },
    articleBottom: { enabled: false, type: "adsense", size: "728x90", imageUrl: "", linkUrl: "" },
  },
  seo: {
    enableBaiduPush: true,
    enableGoogleIndex: true,
    autoSitemap: true,
    structuredData: true,
  },
};

/**
 * GET - 获取中式主题配置
 */
export async function GET(request: NextRequest) {
  try {
    const activeTheme = await prisma.theme.findFirst({
      where: { isActive: true },
    });

    if (!activeTheme) {
      return NextResponse.json({
        success: true,
        config: DEFAULT_CONFIG,
      });
    }

    // 如果是中式主题，返回配置（合并默认配置确保完整性）
    if (activeTheme.slug === 'chinese-two-column') {
      const storedConfig = activeTheme.config as any || {};
      // 合并默认配置，确保所有字段都存在
      const config = {
        ...DEFAULT_CONFIG,
        ...storedConfig,
        layout: {
          ...DEFAULT_CONFIG.layout,
          ...(storedConfig.layout || {}),
        },
        sidebarWidgets: {
          ...DEFAULT_CONFIG.sidebarWidgets,
          ...(storedConfig.sidebarWidgets || {}),
        },
        adSlots: {
          ...DEFAULT_CONFIG.adSlots,
          ...(storedConfig.adSlots || {}),
        },
        seo: {
          ...DEFAULT_CONFIG.seo,
          ...(storedConfig.seo || {}),
        },
      };
      return NextResponse.json({
        success: true,
        config,
      });
    }

    return NextResponse.json({
      success: true,
      config: DEFAULT_CONFIG,
    });
  } catch (error) {
    console.error("Failed to fetch theme config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch theme config" },
      { status: 500 }
    );
  }
}

/**
 * POST - 保存中式主题配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Config is required" },
        { status: 400 }
      );
    }

    // 确保中式主题存在
    let theme = await prisma.theme.findUnique({
      where: { slug: 'chinese-two-column' },
    });

    if (!theme) {
      theme = await prisma.theme.create({
        data: {
          slug: 'chinese-two-column',
          name: '中式双栏主题',
          description: '中式国风双栏博客主题，支持 13 个侧边栏组件和 5 个广告位',
          isActive: false,
          isDefault: false,
          config: config as any,
        },
      });
    } else {
      // 更新配置
      theme = await prisma.theme.update({
        where: { slug: 'chinese-two-column' },
        data: {
          config: config as any,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: theme.config,
    });
  } catch (error) {
    console.error("Failed to save theme config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save theme config" },
      { status: 500 }
    );
  }
}
