import { NextRequest, NextResponse } from 'next/server';
import { StripeProvider } from '@/lib/payments/stripe';
import { prisma } from '@blog/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const provider = new StripeProvider();
    const isValid = await provider.verifyWebhook(body, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const result = await provider.handleWebhook(event);

    if (result.orderId && result.status === 'completed') {
      // 更新支付状态
      const payment = await prisma.payment.updateMany({
        where: { providerTxId: result.transactionId },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });

      // 更新订单状态
      if (payment.count > 0) {
        const paymentRecord = await prisma.payment.findFirst({
          where: { providerTxId: result.transactionId },
          include: { 
            order: {
              include: {
                items: true,
              }
            }
          },
        });

        if (paymentRecord) {
          await prisma.order.update({
            where: { id: paymentRecord.orderId },
            data: { status: 'PAID' },
          });

          // 处理订单项
          for (const item of paymentRecord.order.items) {
            if (item.itemType === 'ARTICLE' && item.articleId) {
              await prisma.premiumAccess.create({
                data: {
                  userId: paymentRecord.order.userId,
                  articleId: item.articleId,
                  orderId: paymentRecord.orderId,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
