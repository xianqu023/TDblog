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
    console.error("Failed to get site settings:", error);
    return {
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "My Blog",
      siteDescription: "一个个人博客平台",
      logoUrl: "",
    };
  }
}
