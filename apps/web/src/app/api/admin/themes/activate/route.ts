import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

/**
 * POST - 激活指定主题
 * 将指定主题设为激活状态，同时停用其他所有主题
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme slug is required",
        },
        { status: 400 }
      );
    }

    // 检查主题是否存在
    const theme = await prisma.theme.findUnique({
      where: { slug },
    });

    if (!theme) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme not found",
        },
        { status: 404 }
      );
    }

    // 事务处理：停用所有主题，然后激活指定主题
    await prisma.$transaction([
      // 停用所有主题
      prisma.theme.updateMany({
        where: {},
        data: { isActive: false },
      }),
      // 激活指定主题
      prisma.theme.update({
        where: { slug },
        data: { isActive: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "主题已激活",
      theme: {
        id: theme.id,
        slug: theme.slug,
        name: theme.name,
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Failed to activate theme:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to activate theme",
      },
      { status: 500 }
    );
  }
}
