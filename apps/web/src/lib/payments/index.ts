import { PaymentProvider, PaymentProviderType } from './types';
import { StripeProvider } from './stripe';
import { PayPalProvider } from './paypal';
import { AlipayProvider } from './alipay';
import { WechatPayProvider } from './wechat-pay';

const providers: Record<PaymentProviderType, PaymentProvider> = {
  stripe: new StripeProvider(),
  paypal: new PayPalProvider(),
  alipay: new AlipayProvider(),
  'wechat_pay': new WechatPayProvider(),
};

export function getPaymentProvider(type: PaymentProviderType): PaymentProvider {
  return providers[type];
}

export { StripeProvider, PayPalProvider, AlipayProvider, WechatPayProvider };
