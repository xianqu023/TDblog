import * as paypal from '@paypal/checkout-server-sdk';
import { PaymentProvider, PaymentOrder, PaymentResult, WebhookResult } from './types';

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const mode = process.env.PAYPAL_MODE === 'production' 
    ? paypal.core.LiveEnvironment 
    : paypal.core.SandboxEnvironment;
  return new mode(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export class PayPalProvider implements PaymentProvider {
  async createPayment(order: PaymentOrder): Promise<PaymentResult> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.orderId,
          description: order.description,
          amount: {
            currency_code: order.currency.toUpperCase(),
            value: order.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?provider=paypal`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      },
    });

    const response = await client().execute(request);
    return {
      paymentUrl: response.result.links.find((link: any) => link.rel === 'approve')?.href,
      paymentId: response.result.id,
    };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    return !!payload && !!signature;
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const event = payload as { event_type: string; resource: any };

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      return {
        orderId: event.resource.supplementary_data?.related_ids?.order_id || '',
        status: 'completed',
        transactionId: event.resource.id,
        amount: parseFloat(event.resource.amount.value),
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
      const request = new paypal.payments.CapturesRefundRequest(paymentId);
      request.requestBody({
        amount: {
          value: amount.toFixed(2),
          currency_code: 'USD',
        },
      });
      await client().execute(request);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
