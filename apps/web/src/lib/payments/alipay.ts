import { AlipaySdk } from 'alipay-sdk';
import { PaymentProvider, PaymentOrder, PaymentResult, WebhookResult } from './types';

export class AlipayProvider implements PaymentProvider {
  private alipay: AlipaySdk | null = null;

  private getAlipay(): AlipaySdk | null {
    if (!this.alipay) {
      const appId = process.env.ALIPAY_APP_ID;
      const privateKey = process.env.ALIPAY_PRIVATE_KEY;
      if (!appId || !privateKey) {
        return null;
      }
      this.alipay = new AlipaySdk({
        appId,
        privateKey,
        alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
        gateway: 'https://openapi.alipay.com/gateway.do',
      });
    }
    return this.alipay;
  }

  async createPayment(order: PaymentOrder): Promise<PaymentResult> {
    const alipay = this.getAlipay();
    if (!alipay) {
      throw new Error('Alipay not configured');
    }
    
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?provider=alipay`;
    const notifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/alipay`;

    const url = await alipay.pageExec(
      'alipay.trade.page.pay',
      {
        bizContent: {
          out_trade_no: order.orderId,
          total_amount: order.amount.toFixed(2),
          subject: order.description,
          product_code: 'FAST_INSTANT_TRADE_PAY',
        },
        returnUrl,
        notifyUrl,
      }
    );

    return {
      paymentUrl: url as string,
      paymentId: order.orderId,
    };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    try {
      const alipay = this.getAlipay();
      if (!alipay) return false;
      const params = payload as Record<string, string>;
      return alipay.checkNotifySign(params);
    } catch {
      return false;
    }
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const data = payload as Record<string, string>;

    if (data.trade_status === 'TRADE_SUCCESS' || data.trade_status === 'TRADE_FINISHED') {
      return {
        orderId: data.out_trade_no,
        status: 'completed',
        transactionId: data.trade_no,
        amount: parseFloat(data.total_amount),
      };
    }

    return {
      orderId: '',
      status: 'pending',
      transactionId: '',
      amount: 0,
    };
  }

  async refund(paymentId: string, amount: number): Promise<{ success: boolean }> {
    try {
      const alipay = this.getAlipay();
      if (!alipay) return { success: false };
      await alipay.exec('alipay.trade.refund', {
        bizContent: {
          out_trade_no: paymentId,
          refund_amount: amount.toFixed(2),
        },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
