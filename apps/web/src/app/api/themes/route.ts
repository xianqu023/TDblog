import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

// GET - 获取所有主题
export async function GET(request: NextRequest) {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { sortOrder: 'asc' },
      ],
    });

    return NextResponse.json({
      themes,
    });
  } catch (error) {
    console.error('获取主题失败:', error);
    return NextResponse.json(
      { error: '获取主题失败' },
      { status: 500 }
    );
  }
}
