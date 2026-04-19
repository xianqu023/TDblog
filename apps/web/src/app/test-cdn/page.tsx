'use client';

import { useState, useEffect } from 'react';
import { 
  withCDN, 
  withImageCDN, 
  getOptimizedImageUrl, 
  getCDNConfig,
  isCDNEnabled 
} from '@/lib/cdn';
import { CDNImage, CDNImg } from '@/components/shared/CDNImage';

export default function TestCDNPage() {
  const [config, setConfig] = useState<any>(null);
  const [testUrl, setTestUrl] = useState('/uploads/test-image.jpg');

  useEffect(() => {
    // 读取 CDN 配置
    const cdnConfig = getCDNConfig();
    setConfig(cdnConfig);
  }, []);

  if (!config) {
    return <div className="p-8">加载中...</div>;
  }

  const testCases = [
    {
      name: '基础 URL',
      original: testUrl,
      result: withCDN(testUrl),
    },
    {
      name: '图片 URL',
      original: testUrl,
      result: withImageCDN(testUrl),
    },
    {
      name: 'CSS URL',
      original: '/css/style.css',
      result: withCDN('/css/style.css', 'css'),
    },
    {
      name: 'JS URL',
      original: '/js/app.js',
      result: withCDN('/js/app.js', 'js'),
    },
    {
      name: '优化图片 (800x600)',
      original: testUrl,
      result: getOptimizedImageUrl(testUrl, { width: 800, height: 600 }),
    },
    {
      name: '优化图片 (WebP)',
      original: testUrl,
      result: getOptimizedImageUrl(testUrl, { format: 'webp' }),
    },
    {
      name: '外部 URL (不应改变)',
      original: 'https://example.com/image.jpg',
      result: withCDN('https://example.com/image.jpg'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CDN 功能测试</h1>

        {/* CDN 配置状态 */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">CDN 配置状态</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">CDN 启用状态</span>
              <div className={`text-lg font-medium ${isCDNEnabled() ? 'text-green-600' : 'text-red-600'}`}>
                {isCDNEnabled() ? '✅ 已启用' : '❌ 未启用'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">服务商</span>
              <div className="text-lg font-medium text-gray-900">{config.provider}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">基础域名</span>
              <div className="text-sm font-medium text-gray-900 break-all">{config.baseUrl || '未配置'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">图片域名</span>
              <div className="text-sm font-medium text-gray-900 break-all">{config.imageUrl || '使用基础域名'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">WebP 支持</span>
              <div className={`text-lg font-medium ${config.webpEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {config.webpEnabled ? '✅ 已启用' : '❌ 未启用'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">图片优化</span>
              <div className={`text-lg font-medium ${config.imageOptimization ? 'text-green-600' : 'text-gray-600'}`}>
                {config.imageOptimization ? '✅ 已启用' : '❌ 未启用'}
              </div>
            </div>
          </div>
        </div>

        {/* URL 转换测试 */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">URL 转换测试</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              测试 URL
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">测试项</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原始 URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">转换结果</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {testCases.map((test, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 break-all max-w-xs">{test.original}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 break-all max-w-xs">{test.result}</td>
                    <td className="px-4 py-3">
                      {test.result !== test.original ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">已转换</span>
                      ) : test.original.startsWith('http') ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">外部URL</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">未转换</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 组件测试 */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">组件测试</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">CDNImage 组件</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <CDNImage
                  src="/uploads/test.jpg"
                  alt="Test"
                  width={200}
                  height={150}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">CDNImg 组件</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <CDNImg
                  src="/uploads/test.jpg"
                  alt="Test"
                  width={200}
                  height={150}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 环境变量说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">环境变量配置</h2>
          <p className="text-sm text-blue-700 mb-4">
            要启用 CDN 功能，请在 <code>.env.local</code> 文件中添加以下配置：
          </p>
          <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto">
{`# CDN 配置
NEXT_PUBLIC_CDN_ENABLED=true
NEXT_PUBLIC_CDN_PROVIDER=custom
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.example.com
NEXT_PUBLIC_CDN_IMAGE_URL=https://img.example.com
NEXT_PUBLIC_CDN_WEBP_ENABLED=true
NEXT_PUBLIC_CDN_IMAGE_OPTIMIZATION=true`}
          </pre>
        </div>
      </div>
    </div>
  );
}
