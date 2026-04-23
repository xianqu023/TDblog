/**
 * 主题配置 API
 * 用于读取和保存主题配置到数据库
 */

import { NextRequest } from "next/server";
import { prisma } from "@blog/database";

/**
 * GET - 读取主题配置
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const themeSlug = searchParams.get("theme") || "default";

    // 从数据库读取主题配置
    const theme = await prisma.theme.findUnique({
      where: { slug: themeSlug },
    });

    if (!theme) {
      // 返回默认配置
      return Response.json({
        success: true,
        data: getDefaultThemeConfig(),
      });
    }

    return Response.json({
      success: true,
      data: theme.config,
    });
  } catch (error) {
    console.error("Failed to load theme config:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to load theme config",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 保存主题配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeSlug, config, name } = body;

    if (!config) {
      return Response.json(
        {
          success: false,
          error: "Config is required",
        },
        { status: 400 }
      );
    }

    const slug = themeSlug || "default";
    const themeName = name || "默认主题";

    // 检查主题是否存在
    const existingTheme = await prisma.theme.findUnique({
      where: { slug },
    });

    if (existingTheme) {
      // 更新现有主题配置
      await prisma.theme.update({
        where: { slug },
        data: {
          config,
          name: themeName,
          updatedAt: new Date(),
        },
      });
    } else {
      // 创建新主题
      await prisma.theme.create({
        data: {
          themeId: slug,
          slug,
          name: themeName,
          config,
          isDefault: slug === "default",
          isActive: true,
        },
      });
    }

    return Response.json({
      success: true,
      message: "主题配置已保存",
    });
  } catch (error) {
    console.error("Failed to save theme config:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to save theme config",
      },
      { status: 500 }
    );
  }
}

/**
 * 获取默认主题配置
 */
function getDefaultThemeConfig() {
  return {
    // 全局设置
    global: {
      enabled: true,
      primaryColor: "#c41e3a",
      secondaryColor: "#1e3a5f",
      backgroundColor: "#f5f0e8",
      textColor: "#1a1a1a",
      fontSize: "16px",
      fontFamily: "system-ui",
      enableAnimations: true,
    },
    // 侧边栏组件
    sidebarWidgets: {
      searchBox: { enabled: true, sortOrder: 1 },
      authorInfo: { enabled: true, sortOrder: 2 },
      categories: { enabled: true, sortOrder: 3 },
      tagCloud: { enabled: true, sortOrder: 4 },
      hotArticles: { enabled: true, sortOrder: 5 },
      latestArticles: { enabled: false, sortOrder: 6 },
      randomArticles: { enabled: false, sortOrder: 7 },
      archives: { enabled: true, sortOrder: 8 },
      friendLinks: { enabled: true, sortOrder: 9 },
      siteStats: { enabled: true, sortOrder: 10 },
      subscribe: { enabled: true, sortOrder: 11 },
      weather: { enabled: false, sortOrder: 12 },
      notice: { enabled: false, sortOrder: 13 },
    },
    // 首页视图
    homeView: {
      defaultView: "mixed",
      allowViewToggle: true,
      cardView: {
        showCoverImage: true,
        showExcerpt: true,
        excerptMaxLines: 2,
        showTags: true,
        maxTags: 3,
        showAuthor: true,
        showDate: true,
        showViews: true,
        cardsPerRow: 2,
      },
      listView: {
        showThumbnail: true,
        thumbnailWidth: 128,
        showExcerpt: true,
        excerptMaxLength: 100,
        showTags: true,
        showAuthor: true,
        showDate: true,
        showViews: true,
      },
      mixedView: {
        firstArticleStyle: "featured",
        staggeredLayout: true,
        specialArticleInterval: 5,
      },
    },
    // 广告位配置
    adPositions: {
      contentTop: {
        enabled: false,
        adType: "none", // none, code, image, text
        adCode: "",
        adImageUrl: "",
        adLinkUrl: "",
        adAltText: "",
        responsive: true,
      },
      contentMiddle: {
        enabled: false,
        adType: "none",
        adCode: "",
        adImageUrl: "",
        adLinkUrl: "",
        adAltText: "",
        responsive: true,
        articleInterval: 3,
      },
      contentBottom: {
        enabled: false,
        adType: "none",
        adCode: "",
        adImageUrl: "",
        adLinkUrl: "",
        adAltText: "",
        responsive: true,
      },
      sidebarTop: {
        enabled: false,
        adType: "none",
        adCode: "",
        adImageUrl: "",
        adLinkUrl: "",
        adAltText: "",
        responsive: true,
      },
      sidebarBottom: {
        enabled: false,
        adType: "none",
        adCode: "",
        adImageUrl: "",
        adLinkUrl: "",
        adAltText: "",
        responsive: true,
      },
    },
    // SEO 设置
    seo: {
      enabled: true,
      googleSiteVerification: "",
      baiduSiteVerification: "",
      bingSiteVerification: "",
      enableSitemap: true,
      enableRobots: true,
    },
    // 动画设置
    animations: {
      scrollReveal: true,
      cardHover: true,
      buttonRipple: true,
      staggerAnimation: true,
    },
  };
}
