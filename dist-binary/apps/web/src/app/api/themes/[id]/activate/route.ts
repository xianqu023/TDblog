import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

// POST - 激活主题
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 开启事务
    await prisma.$transaction(async (tx: any) => {
      // 1. 将所有主题设为非激活
      await tx.theme.updateMany({
        data: { isActive: false },
      });

      // 2. 激活指定主题
      await tx.theme.update({
        where: { id },
        data: { isActive: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: '主题已激活',
    });
  } catch (error) {
    console.error('激活主题失败:', error);
    return NextResponse.json(
      { error: '激活主题失败' },
      { status: 500 }
    );
  }
}
