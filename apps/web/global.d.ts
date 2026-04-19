declare module 'bcryptjs';

declare module 'alipay-sdk' {
  export class AlipaySdk {
    constructor(config: { appId: string; privateKey: string; alipayPublicKey?: string; gateway?: string; });
    exec(method: string, params: { bizContent: Record<string, any>; [key: string]: any; }): Promise<any>;
    pageExec(method: string, params: { bizContent: Record<string, any>; [key: string]: any; }, httpMethod?: 'GET' | 'POST'): string;
    checkNotifySign(params: any): boolean;
  }
}

declare module '@paypal/checkout-server-sdk';
declare module 'wechat-pay';
