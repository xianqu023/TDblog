import Stripe from 'stripe';
import { PaymentProvider, PaymentOrder, PaymentResult, WebhookResult } from './types';

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe | null = null;
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  private getStripe(): Stripe | null {
    if (!this.stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return null;
      }
      this.stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.basil' as any });
    }
    return this.stripe;
  }

  async createPayment(order: PaymentOrder): Promise<PaymentResult> {
    const stripe = this.getStripe();
    if (!stripe) {
      throw new Error('Stripe not configured');
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: order.description,
            },
            unit_amount: Math.round(order.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
      metadata: {
        orderId: order.orderId,
        userId: order.userId,
      },
    });

    return {
      paymentUrl: session.url || undefined,
      clientSecret: session.client_secret || undefined,
      paymentId: session.id,
    };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    try {
      const stripe = this.getStripe();
      if (!stripe) return false;
      stripe.webhooks.constructEvent(
        payload as string,
        signature,
        this.webhookSecret
      );
      return true;
    } catch {
      return false;
    }
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const event = payload as Stripe.Event;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        orderId: session.metadata?.orderId || '',
        status: 'completed',
        transactionId: session.id,
        amount: (session.amount_total || 0) / 100,
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
      const stripe = this.getStripe();
      if (!stripe) return { success: false };
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      if (paymentIntent.latest_charge) {
        await stripe.refunds.create({
          charge: paymentIntent.latest_charge as string,
          amount: Math.round(amount * 100),
        });
        return { success: true };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }
}
