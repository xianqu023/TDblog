import Link from 'next/link';
import { Package, Download, Calendar, DollarSign } from 'lucide-react';

const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD2026041501ABC',
    totalAmount: 29.9,
    status: 'PAID',
    createdAt: '2026-04-15',
    items: [
      { type: 'PRODUCT', product: { name: 'Next.js 完整教程 PDF' } },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD2026041202DEF',
    totalAmount: 9.9,
    status: 'PAID',
    createdAt: '2026-04-12',
    items: [
      { type: 'ARTICLE', article: { title: 'React Hooks 深入解析' } },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD2026041003GHI',
    totalAmount: 99,
    status: 'PAID',
    createdAt: '2026-04-10',
    items: [
      { type: 'MEMBERSHIP', membership: { name: '专业版' } },
    ],
  },
];

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">我的订单</h1>

        {mockOrders.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">暂无订单</h3>
            <p className="text-gray-600 mb-4">您还没有任何订单记录</p>
            <Link href="/shop" className="text-blue-600 hover:underline">
              去商城逛逛
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">订单号</div>
                    <div className="font-mono text-sm">{order.orderNumber}</div>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                    已支付
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item: any, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <span>
                          {item.product?.name || item.article?.title || item.membership?.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {order.createdAt}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-900">
                      ¥{order.totalAmount}
                    </span>
                    {order.items[0]?.type === 'PRODUCT' && (
                      <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        下载
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
