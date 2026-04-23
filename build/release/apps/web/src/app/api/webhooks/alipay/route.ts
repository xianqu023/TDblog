import { NextRequest, NextResponse } from 'next/server';
import { AlipayProvider } from '@/lib/payments/alipay';
import { prisma } from '@blog/database';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());

    const provider = new AlipayProvider();
    const isValid = await provider.verifyWebhook(body, '');

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const result = await provider.handleWebhook(body);

    if (result.orderId && result.status === 'completed') {
      await prisma.payment.updateMany({
        where: { providerTxId: result.transactionId },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });

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
          where: { id: paymentRecord.order.id },
          data: { status: 'PAID' },
        });

        // 处理订单项
        for (const item of paymentRecord.order.items) {
          if (item.itemType === 'ARTICLE' && item.articleId) {
            await prisma.premiumAccess.create({
              data: {
                userId: paymentRecord.order.userId,
                articleId: item.articleId,
                orderId: paymentRecord.order.id,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Alipay webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ received: true });
}
