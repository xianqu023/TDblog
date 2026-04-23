import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";
import { themeRegistry } from "@/themes";

/**
 * GET - 获取主题列表
 * 支持查询参数：
 * - active: true - 只返回激活的主题
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    // 从数据库获取激活的主题
    const activeThemes = await prisma.theme.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const activeThemeIds = new Set(activeThemes.map((t: any) => t.themeId));

    // 从主题注册表获取所有可用主题
    const allThemes = themeRegistry.getAllThemes();
    
    // 合并数据
    const themesWithStatus = allThemes.map((theme) => {
      const dbTheme = activeThemes.find((t: any) => t.themeId === theme.id);
      return {
        ...theme,
        isActive: dbTheme?.isActive || false,
        isDefault: theme.isDefault || false,
        activatedAt: dbTheme?.activatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      themes: themesWithStatus,
      count: themesWithStatus.length,
    });
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch themes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
