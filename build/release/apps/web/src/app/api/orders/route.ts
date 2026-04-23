import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@blog/database';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true },
              },
              article: {
                select: { id: true, slug: true },
                include: {
                  translations: {
                    where: { locale: 'zh' },
                    select: { title: true },
                  },
                },
              },
              membership: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: error.message || '获取订单失败' },
      { status: 500 }
    );
  }
}
