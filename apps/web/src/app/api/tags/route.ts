import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';

// GET - 获取所有标签（带文章计数）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const tags = await prisma.tag.findMany({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        articles: {
          select: {
            articleId: true,
          },
        },
      },
    });

    // 添加文章计数
    const tagsWithCount = tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      _count: {
        articles: tag.articles.length,
      },
    }));

    // 按文章数量排序并限制数量
    const sortedTags = tagsWithCount
      .sort((a: any, b: any) => b._count.articles - a._count.articles)
      .slice(0, limit);

    return NextResponse.json({ success: true, data: sortedTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', message: '获取标签失败' },
      { status: 500 }
    );
  }
}
