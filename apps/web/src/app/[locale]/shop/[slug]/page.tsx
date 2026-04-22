"use client";

import { useState } from 'react';
import { ShoppingCart, Download, Star, ShoppingCart as CartIcon, Lock } from 'lucide-react';
import PaymentModal from '@/components/shared/PaymentModal';
import Script from 'next/script';

const mockProduct = {
  id: '1',
  slug: 'nextjs-tutorial-pdf',
  name: 'Next.js 完整教程 PDF',
  description: '从零基础到实战项目，包含 500+ 页详细内容，涵盖路由、数据获取、部署等核心概念。',
  price: 29.9,
  originalPrice: 59.9,
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=500&fit=crop',
  sales: 156,
  rating: 4.8,
  reviews: 42,
  fileSize: '56 MB',
  fileType: 'PDF',
  downloadLimit: 10,
  features: [
    '500+ 页详细内容',
    '从基础到高级',
    '实战项目案例',
    '持续更新',
    '源码下载',
    '专属答疑群',
  ],
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  const handleBuy = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ type: 'product', productId: mockProduct.id }],
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* JSON-LD Structured Data */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: mockProduct.name,
            description: mockProduct.description,
            image: mockProduct.image,
            offers: {
              "@type": "Offer",
              price: mockProduct.price,
              priceCurrency: "CNY",
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: mockProduct.rating,
              reviewCount: mockProduct.reviews,
            },
          })
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="rounded-xl overflow-hidden border bg-white">
            <img
              src={mockProduct.image}
              alt={mockProduct.name}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl border p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">商品包含</h3>
            <ul className="space-y-3">
              {mockProduct.features.map((feature, i) => (
                <li key={`feature-${i}`} className="flex items-center text-gray-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-3" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{mockProduct.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={`star-${i}`}
                  className={`h-5 w-5 ${i < Math.floor(mockProduct.rating) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">{mockProduct.rating} ({mockProduct.reviews} 评价)</span>
            <span className="ml-4 text-gray-500">{mockProduct.sales} 人已购买</span>
          </div>

          <p className="text-gray-600 mb-6">{mockProduct.description}</p>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-blue-600">¥{mockProduct.price}</span>
              <span className="ml-3 text-lg text-gray-400 line-through">¥{mockProduct.originalPrice}</span>
              <span className="ml-3 px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                省 ¥{(mockProduct.originalPrice - mockProduct.price).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">文件大小</div>
              <div className="font-medium">{mockProduct.fileSize}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">文件类型</div>
              <div className="font-medium">{mockProduct.fileType}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">下载次数</div>
              <div className="font-medium">{mockProduct.downloadLimit} 次</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">更新</div>
              <div className="font-medium">永久</div>
            </div>
          </div>

          {/* Actions */}
          {purchased ? (
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="h-5 w-5 mr-2" />
                立即下载
              </button>
            </div>
          ) : (
            <button
              onClick={handleBuy}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              立即购买
            </button>
          )}

          {/* Guarantee */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-blue-700">
              <Lock className="h-4 w-4 mr-2" />
              <span>安全支付 · 7天无理由退款</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && orderId && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderId={orderId}
          amount={mockProduct.price}
          currency="CNY"
          description={`购买: ${mockProduct.name}`}
          onSuccess={() => {
            setShowPayment(false);
            setPurchased(true);
          }}
        />
      )}
    </div>
  );
}
