import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; provider?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">支付成功!</h2>
        <p className="text-gray-600 mb-6">
          您的订单已支付成功，现在可以访问购买的内容。
        </p>
        {searchParams.session_id && (
          <p className="text-sm text-gray-500 mb-4">
            交易号: {searchParams.session_id}
          </p>
        )}
        <div className="space-y-3">
          <Link
            href="/articles"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            查看文章
          </Link>
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
