"use client";

import { useState } from "react";
import { Save, Search, Share2, Code } from "lucide-react";

export default function SeoPage() {
  const [settings, setSettings] = useState({
    robotsTxt: `User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml`,
    googleAnalytics: "",
    googleTagManager: "",
    baiduVerify: "",
    customHead: "",
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SEO 管理</h2>
        <p className="text-gray-600 mt-1">管理网站的 SEO 配置</p>
      </div>

      <div className="space-y-6">
        {/* Sitemap Preview */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Sitemap
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">自动生成的 Sitemap 文件:</p>
            <ul className="space-y-1 text-sm">
              <li><a href="/sitemap.xml" className="text-blue-600 hover:underline">/sitemap.xml</a> - 主 Sitemap</li>
              <li><a href="/sitemap-articles.xml" className="text-blue-600 hover:underline">/sitemap-articles.xml</a> - 文章 Sitemap</li>
              <li><a href="/sitemap-tags.xml" className="text-blue-600 hover:underline">/sitemap-tags.xml</a> - 标签 Sitemap</li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-blue-600" />
            Open Graph / 社交媒体分享
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Code className="h-5 w-5 mr-2 text-blue-600" />
            统计代码 / 验证代码
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={settings.googleAnalytics}
                onChange={(e) => setSettings({ ...settings, googleAnalytics: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Tag Manager</label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                value={settings.googleTagManager}
                onChange={(e) => setSettings({ ...settings, googleTagManager: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">百度统计验证代码</label>
              <input
                type="text"
                placeholder="百度统计验证代码"
                value={settings.baiduVerify}
                onChange={(e) => setSettings({ ...settings, baiduVerify: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">robots.txt</label>
              <textarea
                value={settings.robotsTxt}
                onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Structured Data */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">结构化数据 (JSON-LD)</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "My Blog",
  "description": "一个个人博客平台",
  "url": "https://example.com",
  "publisher": {
    "@type": "Organization",
    "name": "My Blog"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
