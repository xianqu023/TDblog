import crypto from 'crypto';
import { PaymentProvider, PaymentOrder, PaymentResult, WebhookResult } from './types';

export class WechatPayProvider implements PaymentProvider {
  private appId: string;
  private mchId: string;
  private apiKey: string;

  constructor() {
    this.appId = process.env.WECHAT_PAY_APP_ID || '';
    this.mchId = process.env.WECHAT_PAY_MCH_ID || '';
    this.apiKey = process.env.WECHAT_PAY_API_KEY || '';
  }

  private sign(params: Record<string, string>): string {
    const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    const signStr = `${sorted}&key=${this.apiKey}`;
    return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
  }

  async createPayment(order: PaymentOrder): Promise<PaymentResult> {
    const notifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/wechat-pay`;
    const tradeNo = `WX${order.orderId}`;

    const params: Record<string, string> = {
      appid: this.appId,
      mch_id: this.mchId,
      nonce_str: crypto.randomBytes(16).toString('hex'),
      body: order.description,
      out_trade_no: tradeNo,
      total_fee: Math.round(order.amount * 100).toString(),
      spbill_create_ip: '127.0.0.1',
      notify_url: notifyUrl,
      trade_type: 'NATIVE',
    };

    params.sign = this.sign(params);

    const xmlBody = this.buildXml(params);

    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      body: xmlBody,
    });

    const text = await response.text();
    const parsed = this.parseXml(text);

    if (parsed.return_code === 'SUCCESS' && parsed.result_code === 'SUCCESS') {
      return {
        qrCode: parsed.code_url,
        paymentId: tradeNo,
      };
    }

    throw new Error(parsed.err_code_des || '微信支付下单失败');
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    const data = payload as Record<string, string>;
    const receivedSign = data.sign;
    const { sign, ...rest } = data;
    const expectedSign = this.sign(rest);
    return receivedSign === expectedSign;
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const data = payload as Record<string, string>;

    if (data.return_code === 'SUCCESS' && data.result_code === 'SUCCESS') {
      return {
        orderId: data.out_trade_no?.replace('WX', '') || '',
        status: 'completed',
        transactionId: data.transaction_id,
        amount: parseInt(data.total_fee) / 100,
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
    return { success: false }; // 需要证书，简化实现
  }

  private buildXml(params: Record<string, string>): string {
    let xml = '<xml>';
    for (const [key, value] of Object.entries(params)) {
      xml += `<${key}><![CDATA[${value}]]></${key}>`;
    }
    xml += '</xml>';
    return xml;
  }

  private parseXml(xml: string): Record<string, string> {
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
}
