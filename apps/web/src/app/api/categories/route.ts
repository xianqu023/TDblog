import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';

// GET - 获取所有分类（供前台页脚使用）
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // 只获取顶级分类
      orderBy: [{ name: 'asc' }],
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: '获取分类失败' },
      { status: 500 }
    );
  }
}
