"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Globe, Mail, CreditCard, Search, Bell, LayoutGrid, HardDrive, X, Cloud } from "lucide-react";
import WidgetManager from "@/components/admin/WidgetManager";

type TabKey = "general" | "seo" | "cdn" | "payment" | "notification" | "widgets" | "storage";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState({
    siteName: "My Blog",
    siteDescription: "一个个人博客平台",
    siteKeywords: "博客,技术,分享",
    logoUrl: "",
    defaultLocale: "zh",
    postsPerPage: "10",
    seoTitle: "My Blog - 个人博客平台",
    seoDescription: "分享技术、生活与思考的个人博客平台",
    seoKeywords: "博客,技术,分享,教程",
    seoEnabled: true,
    sitemapEnabled: true,
    ogEnabled: true,
    stripeEnabled: false,
    paypalEnabled: false,
    alipayEnabled: false,
    wechatPayEnabled: false,
    // 存储设置
    storageDriver: "local",
    storageLocalPath: "./uploads",
    storageLocalUrl: "/uploads",
    storageS3Region: "us-east-1",
    storageS3Bucket: "",
    storageS3AccessKey: "",
    storageS3SecretKey: "",
    storageS3Endpoint: "",
    storageOssRegion: "oss-cn-hangzhou",
    storageOssBucket: "",
    storageOssAccessKey: "",
    storageOssSecretKey: "",
    uploadMaxSize: "100",
    uploadOrganizeByDate: true,
    uploadUniqueFilename: true,
    // CDN 设置
    cdnEnabled: false,
    cdnProvider: "custom",
    cdnBaseUrl: "",
    cdnImageUrl: "",
    cdnCssUrl: "",
    cdnJsUrl: "",
    cdnPreconnect: true,
    cdnImageOptimization: false,
    cdnWebpEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings((prev) => ({
              ...prev,
              ...data.data,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "general", label: "基本设置", icon: Globe },
    { key: "seo", label: "SEO 设置", icon: Search },
    { key: "cdn", label: "CDN 加速", icon: Cloud },
    { key: "storage", label: "存储设置", icon: HardDrive },
    { key: "payment", label: "支付设置", icon: CreditCard },
    { key: "notification", label: "通知设置", icon: Bell },
    { key: "widgets", label: "小工具管理", icon: LayoutGrid },
  ];

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "设置已保存" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "保存失败" });
      }
    } catch (error) {
      console.error("Save settings error:", error);
      setMessage({ type: "error", text: "保存失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "请上传图片文件" });
      return;
    }

    // 验证文件大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "图片大小不能超过 2MB" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          logoUrl: data.data.url,
        }));
        setMessage({ type: "success", text: "Logo 上传成功" });
      } else {
        setMessage({ type: "error", text: data.message || "上传失败" });
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      setMessage({ type: "error", text: "上传失败" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({
      ...prev,
      logoUrl: "",
    }));
    setMessage({ type: "success", text: "Logo 已移除" });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">网站设置</h2>
        <p className="text-gray-600 mt-1">管理网站的各项配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    activeTab === tab.key
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">基本设置</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网站名称
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网站描述
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    网站关键词
                  </label>
                  <input
                    type="text"
                    value={settings.siteKeywords}
                    onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认语言
                    </label>
                    <select
                      value={settings.defaultLocale}
                      onChange={(e) => setSettings({ ...settings, defaultLocale: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      每页文章数
                    </label>
                    <input
                      type="number"
                      value={settings.postsPerPage}
                      onChange={(e) => setSettings({ ...settings, postsPerPage: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    网站 Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {settings.logoUrl ? (
                      <div className="relative">
                        <img
                          src={settings.logoUrl}
                          alt="Logo"
                          className="h-16 w-16 object-contain rounded-lg border"
                        />
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">
                          {settings.siteName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <label className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {settings.logoUrl ? "更换 Logo" : "上传 Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {uploading && (
                      <span className="text-sm text-gray-500">上传中...</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    建议尺寸：200x200 像素，支持 JPG、PNG、GIF 格式，最大 2MB
                  </p>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">SEO 设置</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO 标题
                  </label>
                  <input
                    type="text"
                    value={settings.seoTitle}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">建议长度 50-60 个字符</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO 描述
                  </label>
                  <textarea
                    value={settings.seoDescription}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">建议长度 150-160 个字符</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO 关键词
                  </label>
                  <input
                    type="text"
                    value={settings.seoKeywords}
                    onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.seoEnabled}
                      onChange={(e) => setSettings({ ...settings, seoEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">启用 SEO 优化</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.sitemapEnabled}
                      onChange={(e) => setSettings({ ...settings, sitemapEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">自动生成 Sitemap</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.ogEnabled}
                      onChange={(e) => setSettings({ ...settings, ogEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">启用 Open Graph</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "cdn" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">CDN 加速设置</h3>
                <p className="text-sm text-gray-600">
                  配置 CDN 加速可以提升网站访问速度，减轻服务器压力。支持自定义 CDN 或主流云服务商。
                </p>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">启用 CDN 加速</div>
                      <div className="text-sm text-gray-500">开启后静态资源将通过 CDN 分发</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.cdnEnabled}
                      onChange={(e) => setSettings({ ...settings, cdnEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                {settings.cdnEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CDN 服务商
                      </label>
                      <select
                        value={settings.cdnProvider}
                        onChange={(e) => setSettings({ ...settings, cdnProvider: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="custom">自定义 CDN</option>
                        <option value="aliyun">阿里云 CDN</option>
                        <option value="qcloud">腾讯云 CDN</option>
                        <option value="cloudflare">Cloudflare</option>
                        <option value="aws">AWS CloudFront</option>
                        <option value="baidu">百度云加速</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CDN 基础域名
                      </label>
                      <input
                        type="text"
                        value={settings.cdnBaseUrl}
                        onChange={(e) => setSettings({ ...settings, cdnBaseUrl: e.target.value })}
                        placeholder="https://cdn.example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        静态资源（CSS/JS/图片等）的 CDN 加速域名
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          图片 CDN 域名
                        </label>
                        <input
                          type="text"
                          value={settings.cdnImageUrl}
                          onChange={(e) => setSettings({ ...settings, cdnImageUrl: e.target.value })}
                          placeholder="https://img.example.com"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CSS CDN 域名
                        </label>
                        <input
                          type="text"
                          value={settings.cdnCssUrl}
                          onChange={(e) => setSettings({ ...settings, cdnCssUrl: e.target.value })}
                          placeholder="https://css.example.com"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        JS CDN 域名
                      </label>
                      <input
                        type="text"
                        value={settings.cdnJsUrl}
                        onChange={(e) => setSettings({ ...settings, cdnJsUrl: e.target.value })}
                        placeholder="https://js.example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">高级设置</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.cdnPreconnect}
                            onChange={(e) => setSettings({ ...settings, cdnPreconnect: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">启用 DNS 预解析 (Preconnect)</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.cdnImageOptimization}
                            onChange={(e) => setSettings({ ...settings, cdnImageOptimization: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">启用图片自动优化</span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.cdnWebpEnabled}
                            onChange={(e) => setSettings({ ...settings, cdnWebpEnabled: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">自动转换为 WebP 格式</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">配置说明</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>CDN 域名需要提前在服务商处配置好并指向源站</li>
                        <li>建议开启 HTTPS，确保 CDN 域名支持 SSL</li>
                        <li>修改 CDN 配置后可能需要清除浏览器缓存才能生效</li>
                        <li>如果留空特定资源域名，将使用基础 CDN 域名</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">支付设置</h3>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Stripe</div>
                        <div className="text-sm text-gray-500">国际信用卡支付</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.stripeEnabled}
                        onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    {settings.stripeEnabled && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Stripe Secret Key"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Webhook Secret"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">PayPal</div>
                        <div className="text-sm text-gray-500">PayPal 支付</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.paypalEnabled}
                        onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    {settings.paypalEnabled && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Client ID"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Client Secret"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">支付宝</div>
                        <div className="text-sm text-gray-500">支付宝支付</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.alipayEnabled}
                        onChange={(e) => setSettings({ ...settings, alipayEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    {settings.alipayEnabled && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="App ID"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Private Key"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">微信支付</div>
                        <div className="text-sm text-gray-500">微信支付</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.wechatPayEnabled}
                        onChange={(e) => setSettings({ ...settings, wechatPayEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    {settings.wechatPayEnabled && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="App ID"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="MCH ID"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notification" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">通知设置</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    管理员邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">新用户注册通知</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">支付成功通知</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">会员到期提醒</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">存储设置</h3>
                <p className="text-sm text-gray-600">
                  配置文件上传存储方式，支持本地存储、AWS S3 和阿里云 OSS。
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    存储驱动
                  </label>
                  <select
                    value={settings.storageDriver}
                    onChange={(e) => setSettings({ ...settings, storageDriver: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="local">本地存储</option>
                    <option value="s3">AWS S3 / MinIO</option>
                    <option value="oss">阿里云 OSS</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    修改存储驱动后需要重启服务才能生效
                  </p>
                </div>

                {/* 本地存储配置 */}
                {settings.storageDriver === "local" && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-gray-900">本地存储配置</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        存储路径
                      </label>
                      <input
                        type="text"
                        value={settings.storageLocalPath}
                        onChange={(e) => setSettings({ ...settings, storageLocalPath: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        访问 URL
                      </label>
                      <input
                        type="text"
                        value={settings.storageLocalUrl}
                        onChange={(e) => setSettings({ ...settings, storageLocalUrl: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* S3 配置 */}
                {settings.storageDriver === "s3" && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-gray-900">S3 配置</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Region
                        </label>
                        <input
                          type="text"
                          value={settings.storageS3Region}
                          onChange={(e) => setSettings({ ...settings, storageS3Region: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bucket
                        </label>
                        <input
                          type="text"
                          value={settings.storageS3Bucket}
                          onChange={(e) => setSettings({ ...settings, storageS3Bucket: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Key ID
                      </label>
                      <input
                        type="text"
                        value={settings.storageS3AccessKey}
                        onChange={(e) => setSettings({ ...settings, storageS3AccessKey: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secret Access Key
                      </label>
                      <input
                        type="password"
                        value={settings.storageS3SecretKey}
                        onChange={(e) => setSettings({ ...settings, storageS3SecretKey: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endpoint (可选，用于 MinIO)
                      </label>
                      <input
                        type="text"
                        value={settings.storageS3Endpoint}
                        onChange={(e) => setSettings({ ...settings, storageS3Endpoint: e.target.value })}
                        placeholder="http://localhost:9000"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* OSS 配置 */}
                {settings.storageDriver === "oss" && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-gray-900">阿里云 OSS 配置</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Region
                        </label>
                        <input
                          type="text"
                          value={settings.storageOssRegion}
                          onChange={(e) => setSettings({ ...settings, storageOssRegion: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bucket
                        </label>
                        <input
                          type="text"
                          value={settings.storageOssBucket}
                          onChange={(e) => setSettings({ ...settings, storageOssBucket: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Key ID
                      </label>
                      <input
                        type="text"
                        value={settings.storageOssAccessKey}
                        onChange={(e) => setSettings({ ...settings, storageOssAccessKey: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Key Secret
                      </label>
                      <input
                        type="password"
                        value={settings.storageOssSecretKey}
                        onChange={(e) => setSettings({ ...settings, storageOssSecretKey: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">上传设置</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        最大文件大小 (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.uploadMaxSize}
                        onChange={(e) => setSettings({ ...settings, uploadMaxSize: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.uploadOrganizeByDate}
                        onChange={(e) => setSettings({ ...settings, uploadOrganizeByDate: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">按日期组织文件</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.uploadUniqueFilename}
                        onChange={(e) => setSettings({ ...settings, uploadUniqueFilename: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">生成唯一文件名</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "widgets" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">侧边栏小工具管理</h3>
                <p className="text-sm text-gray-600">
                  配置各个页面侧边栏显示的小工具，可以调整显示顺序、启用或关闭，以及自定义每个小工具的设置项。
                </p>
                <WidgetManager />
              </div>
            )}

            {/* Message */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "保存中..." : "保存设置"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
