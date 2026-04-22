import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

/**
 * GET - 获取主题列表
 * 支持查询参数：
 * - active: true - 只返回激活的主题
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    let themes;
    if (activeOnly) {
      themes = await prisma.theme.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      themes = await prisma.theme.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      themes: themes,
    });
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch themes",
      },
      { status: 500 }
    );
  }
}
