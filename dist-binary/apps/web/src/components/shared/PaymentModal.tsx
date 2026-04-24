"use client";

import { useState } from 'react';
import { X, CreditCard, DollarSign, Wallet, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  onSuccess?: () => void;
}

const paymentMethods = [
  {
    id: 'stripe',
    name: '信用卡 (Stripe)',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: DollarSign,
    description: '使用 PayPal 账户支付',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'alipay',
    name: '支付宝',
    icon: Wallet,
    description: '支付宝扫码支付',
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'wechat_pay',
    name: '微信支付',
    icon: Smartphone,
    description: '微信扫码支付',
    color: 'from-green-500 to-green-600',
  },
];

export default function PaymentModal({
  isOpen,
  onClose,
  orderId,
  amount,
  currency,
  description,
  onSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePayment = async (method: string) => {
    setProcessing(true);
    setError('');
    setSelectedMethod(method);

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: method,
          orderId,
          amount,
          currency,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建支付失败');
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.qrCode) {
        // 显示二维码（简化实现）
        alert(`请扫码支付：${data.qrCode}`);
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">选择支付方式</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="p-4 bg-gray-50">
          <div className="text-3xl font-bold text-center text-gray-900">
            ¥{amount.toFixed(2)}
          </div>
          <p className="text-sm text-center text-gray-500 mt-1">{description}</p>
        </div>

        {/* Payment Methods */}
        <div className="p-4 space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => handlePayment(method.id)}
                disabled={processing}
                className="w-full flex items-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-br ${method.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
                {processing && selectedMethod === method.id && (
                  <div className="ml-auto">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t text-center text-sm text-gray-500">
          安全支付保障 · 支持退款
        </div>
      </div>
    </div>
  );
}
