import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';
import { prisma } from '@blog/database';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  filePath: string | null;
  fileSize: bigint | null;
  downloadLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products?status=active`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    const data = await response.json();
    
    if (!data.success || !data.products) return [];
    
    return data.products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">商城</h1>
        <p className="text-gray-600">优质技术资源，助你成长</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">所有分类</option>
            <option value="pdf">PDF 教程</option>
            <option value="video">视频教程</option>
            <option value="template">模板代码</option>
          </select>
          <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="newest">最新</option>
            <option value="popular">最热</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-white/50" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                  ¥{product.price}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description || '暂无描述'}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    {product.downloadLimit || '无限制'} 下载
                  </span>
                  <span className="text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无商品</h3>
          <p className="text-gray-500">商城暂无商品，请稍后查看</p>
        </div>
      )}
    </div>
  );
}
