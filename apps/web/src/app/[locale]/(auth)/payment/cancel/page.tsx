"use client";

import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-20 w-20 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">支付已取消</h2>
        <p className="text-gray-600 mb-6">
          您的支付已取消，订单仍保留。您可以重新支付或返回。
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            重新支付
          </button>
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
