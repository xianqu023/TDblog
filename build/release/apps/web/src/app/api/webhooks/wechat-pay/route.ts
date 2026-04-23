import { NextRequest, NextResponse } from 'next/server';
import { WechatPayProvider } from '@/lib/payments/wechat-pay';
import { prisma } from '@blog/database';

function parseXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const matches = xml.match(/<(\w+)><!\[CDATA\[([^\]]+)\]><\/\1>/g) || [];
  matches.forEach(match => {
    const keyMatch = match.match(/<(\w+)>/);
    const valueMatch = match.match(/<!\[CDATA\[([^\]]+)\]>/);
    if (keyMatch && valueMatch) {
      result[keyMatch[1]] = valueMatch[1];
    }
  });
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const data = parseXml(body);

    const provider = new WechatPayProvider();
    const isValid = await provider.verifyWebhook(data, data.sign);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const result = await provider.handleWebhook(data);

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

    const successXml = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
    return new Response(successXml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (error) {
    console.error('WeChat Pay webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
