import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@blog/database';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '订单项为空' }, { status: 400 });
    }

    // 计算总价
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (item.type === 'article' && item.articleId) {
        const article = await prisma.article.findUnique({
          where: { id: item.articleId },
          select: { premiumPrice: true },
        });
        if (article?.premiumPrice) {
          totalAmount += parseFloat(article.premiumPrice.toString());
          orderItems.push({
            articleId: item.articleId,
            itemType: 'ARTICLE' as const,
            price: article.premiumPrice,
          });
        }
      } else if (item.type === 'product' && item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { price: true },
        });
        if (product) {
          totalAmount += parseFloat(product.price.toString());
          orderItems.push({
            productId: item.productId,
            itemType: 'PRODUCT' as const,
            price: product.price,
          });
        }
      } else if (item.type === 'membership' && item.membershipId) {
        const membership = await prisma.membership.findUnique({
          where: { id: item.membershipId },
          select: { price: true },
        });
        if (membership) {
          totalAmount += parseFloat(membership.price.toString());
          orderItems.push({
            membershipId: item.membershipId,
            itemType: 'MEMBERSHIP' as const,
            price: membership.price,
          });
        }
      }
    }

    // 创建订单
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        totalAmount,
        currency: 'CNY',
        items: {
          create: orderItems.map((item: any) => ({
            ...item,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || '创建订单失败' },
      { status: 500 }
    );
  }
}
