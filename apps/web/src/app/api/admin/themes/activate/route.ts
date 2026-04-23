import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";
import { ThemeLoader } from "@/themes";

/**
 * POST - 激活指定主题
 * 将指定主题设为激活状态，同时停用其他所有主题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeId } = body;

    if (!themeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme ID is required",
        },
        { status: 400 }
      );
    }

    // 验证主题是否存在
    const themeConfig = await ThemeLoader.loadTheme(themeId);
    
    if (!themeConfig) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme not found",
        },
        { status: 404 }
      );
    }

    // 检查是否已激活
    const existingTheme = await prisma.theme.findFirst({
      where: { themeId },
    });

    if (existingTheme && existingTheme.isActive) {
      return NextResponse.json({
        success: true,
        message: "Theme is already active",
        theme: {
          id: existingTheme.id,
          themeId: existingTheme.themeId,
          isActive: true,
        },
      });
    }

    // 事务处理：停用所有主题，然后激活指定主题
    await prisma.$transaction([
      // 停用所有主题
      prisma.theme.updateMany({
        where: {},
        data: { isActive: false },
      }),
      // 激活指定主题（如果不存在则创建）
      prisma.theme.upsert({
        where: { themeId },
        create: {
          themeId,
          slug: themeId,
          name: themeConfig.name,
          description: themeConfig.description,
          version: themeConfig.version,
          author: themeConfig.author,
          thumbnail: themeConfig.thumbnail,
          config: {},
          isActive: true,
          isDefault: themeConfig.isDefault || false,
        },
        update: {
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Theme activated successfully",
      theme: {
        id: themeId,
        name: themeConfig.name,
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Failed to activate theme:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to activate theme",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
