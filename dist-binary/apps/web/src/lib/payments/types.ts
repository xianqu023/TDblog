/**
 * 支付系统抽象层
 */

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  userId: string;
}

export interface PaymentResult {
  paymentUrl?: string;
  qrCode?: string;
  clientSecret?: string;
  paymentId: string;
}

export interface WebhookResult {
  orderId: string;
  status: 'completed' | 'failed' | 'pending';
  transactionId: string;
  amount: number;
}

export interface PaymentProvider {
  createPayment(order: PaymentOrder): Promise<PaymentResult>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
  handleWebhook(payload: unknown): Promise<WebhookResult>;
  refund(paymentId: string, amount: number): Promise<{ success: boolean }>;
}

export type PaymentProviderType = 'stripe' | 'paypal' | 'alipay' | 'wechat_pay';
