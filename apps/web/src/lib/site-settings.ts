import { prisma } from "@blog/database";

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
}

/**
 * 获取站点基本设置
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  // 构建时使用环境变量，避免连接数据库
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return {
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "My Blog",
      siteDescription: "一个个人博客平台",
      logoUrl: "",
    };
  }

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["siteName", "siteDescription", "logoUrl"],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return {
      siteName: settingsMap["siteName"] || process.env.NEXT_PUBLIC_SITE_NAME || "My Blog",
      siteDescription: settingsMap["siteDescription"] || "一个个人博客平台",
      logoUrl: settingsMap["logoUrl"] || "",
    };
  } catch (error) {
    // 构建时静默失败，使用环境变量作为降级方案
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return {
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || "My Blog",
        siteDescription: "一个个人博客平台",
        logoUrl: "",
      };
    }
    console.error("Failed to get site settings:", error);
    return {
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "My Blog",
      siteDescription: "一个个人博客平台",
      logoUrl: "",
    };
  }
}
