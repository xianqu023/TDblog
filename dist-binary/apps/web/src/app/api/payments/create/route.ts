import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPaymentProvider } from '@/lib/payments';
import { PaymentProviderType } from '@/lib/payments/types';
import { prisma } from '@blog/database';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, orderId, amount, currency, description, itemType } = body;

    if (!provider || !orderId || !amount) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    // 验证订单
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: '订单状态异常' }, { status: 400 });
    }

    // 创建支付
    const paymentProvider = getPaymentProvider(provider as PaymentProviderType);
    const result = await paymentProvider.createPayment({
      orderId: order.orderNumber,
      amount: parseFloat(order.totalAmount.toString()),
      currency: order.currency,
      description: description || `订单 ${order.orderNumber}`,
      userId: session.user.id,
    });

    // 记录支付
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        provider: provider.toUpperCase().replace('-', '_') as any,
        providerTxId: result.paymentId,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'PENDING',
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || '创建支付失败' },
      { status: 500 }
    );
  }
}
