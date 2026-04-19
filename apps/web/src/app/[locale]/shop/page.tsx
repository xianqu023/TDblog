import Link from 'next/link';
import { Search, Filter, ShoppingBag } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    slug: 'nextjs-tutorial-pdf',
    name: 'Next.js 完整教程 PDF',
    description: '从零基础到实战项目，包含 500+ 页详细内容',
    price: 29.9,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    sales: 156,
    rating: 4.8,
  },
  {
    id: '2',
    slug: 'react-component-library',
    name: 'React 组件库模板',
    description: '50+ 高质量组件，开箱即用，支持 TypeScript',
    price: 49.9,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    sales: 89,
    rating: 4.6,
  },
  {
    id: '3',
    slug: 'typescript-course',
    name: 'TypeScript 实战课程',
    description: '10 小时视频教程，含项目实战',
    price: 99.9,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
    sales: 234,
    rating: 4.9,
  },
  {
    id: '4',
    slug: 'mysql-optimization-guide',
    name: 'MySQL 性能优化指南',
    description: '实战优化技巧，索引优化、查询优化',
    price: 19.9,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
    sales: 78,
    rating: 4.5,
  },
  {
    id: '5',
    slug: 'docker-k8s-guide',
    name: 'Docker & K8s 完整指南',
    description: '容器化部署全套方案',
    price: 79.9,
    image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop',
    sales: 145,
    rating: 4.7,
  },
  {
    id: '6',
    slug: 'ai-python-course',
    name: 'Python 人工智能入门',
    description: '机器学习基础，深度学习实战',
    price: 59.9,
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222846cc?w=400&h=300&fit=crop',
    sales: 198,
    rating: 4.8,
  },
];

export default function ShopPage() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                ¥{product.price}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  {product.sales} 销量
                </span>
                <span className="text-yellow-500">★ {product.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
