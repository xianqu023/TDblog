import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

// PUT - 更新主题配置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: {
        config: body,
      },
    });

    return NextResponse.json({
      success: true,
      theme: updatedTheme,
    });
  } catch (error) {
    console.error('更新主题配置失败:', error);
    return NextResponse.json(
      { error: '更新主题配置失败' },
      { status: 500 }
    );
  }
}
