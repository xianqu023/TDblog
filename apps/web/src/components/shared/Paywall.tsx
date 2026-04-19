"use client";

import { useState } from 'react';
import { Lock, CreditCard } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface PaywallProps {
  articleId: string;
  articleTitle: string;
  price: number;
  isUnlocked: boolean;
  onUnlock?: () => void;
}

export default function Paywall({
  articleId,
  articleTitle,
  price,
  isUnlocked,
  onUnlock,
}: PaywallProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleBuy = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ type: 'article', articleId }],
        }),
      });

      const order = await response.json();
      if (order.id) {
        setOrderId(order.id);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
    }
  };

  if (isUnlocked) {
    return null;
  }

  return (
    <>
      <div className="relative my-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-center">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">付费内容</h3>
        <p className="text-gray-600 mb-4">购买后阅读全文</p>
        <div className="text-3xl font-bold text-blue-600 mb-4">
          ¥{price.toFixed(2)}
        </div>
        <button
          onClick={handleBuy}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          立即购买
        </button>
      </div>

      {showPayment && orderId && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderId={orderId}
          amount={price}
          currency="CNY"
          description={`付费文章: ${articleTitle}`}
          onSuccess={() => {
            setShowPayment(false);
            onUnlock?.();
          }}
        />
      )}
    </>
  );
}
