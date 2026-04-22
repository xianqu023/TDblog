import Link from 'next/link';
import { Package, Download, Calendar } from 'lucide-react';

interface OrderItem {
  id: string;
  itemType: string;
  price: number;
  product?: { id: string; name: string; slug: string } | null;
  article?: { id: string; slug: string; translations: Array<{ title: string }> } | null;
  membership?: { id: string; name: string } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/orders`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    const data = await response.json();
    
    if (!data.success || !data.orders) return [];
    
    return data.orders;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">我的订单</h1>

        {orders.length === 0 ? (
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
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">订单号</div>
                    <div className="font-mono text-sm">{order.orderNumber}</div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'PAID' ? '已支付' :
                     order.status === 'PENDING' ? '待支付' :
                     order.status === 'CANCELLED' ? '已取消' : order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <span>
                          {item.product?.name || 
                           item.article?.translations?.[0]?.title || 
                           item.membership?.name || '未知商品'}
                        </span>
                      </div>
                      <span className="font-medium">¥{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-gray-900">
                      ¥{order.totalAmount}
                    </span>
                    {order.items.some(item => item.itemType === 'PRODUCT' && order.status === 'PAID') && (
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
