"use client";

import { useState, useEffect } from "react";
import { Save, Bot, Image, FileText, Tags, Search, Link, Globe, Sparkles, Check, AlertCircle, Languages } from "lucide-react";
import { AIConfig, AIProvider, ImageProvider } from "@/lib/ai/types";
import { defaultAIConfig } from "@/lib/ai/config";

type TabKey = "general" | "features" | "writing" | "seo" | "push" | "translate";

export default function AIConfigPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [config, setConfig] = useState<AIConfig>(defaultAIConfig);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/ai/config");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.config) {
            setConfig(data.config);
          }
        }
      } catch (error) {
        console.error("Failed to load AI config:", error);
      }
    };

    loadConfig();
  }, []);

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "general", label: "基础配置", icon: Bot },
    { key: "features", label: "功能开关", icon: Sparkles },
    { key: "writing", label: "写作配置", icon: FileText },
    { key: "seo", label: "SEO 配置", icon: Search },
    { key: "push", label: "推送配置", icon: Globe },
    { key: "translate", label: "翻译配置", icon: Languages },
  ];

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    setValidationErrors([]);

    try {
      // 先验证配置
      const validateRes = await fetch("/api/ai/config/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const validateData = await validateRes.json();

      if (!validateData.valid) {
        setValidationErrors(validateData.errors);
        setLoading(false);
        return;
      }

      // 保存配置
      const response = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "AI 配置保存成功！" });
      } else {
        setMessage({ type: "error", text: data.message || "保存失败" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "保存时发生错误" });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig((prev) => {
      const keys = path.split(".");
      const newConfig = { ...prev };
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 功能配置</h1>
          <p className="mt-1 text-sm text-gray-500">配置 AI 提供商、功能开关和自动化选项</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? "保存中..." : "保存配置"}
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* 验证错误 */}
      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
            <AlertCircle className="w-4 h-4" />
            配置验证失败
          </h4>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 标签页内容 */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* 基础配置 */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <input
                type="checkbox"
                id="enabled"
                checked={config.enabled}
                onChange={(e) => updateConfig("enabled", e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="enabled" className="font-medium text-gray-900 cursor-pointer">
                  启用 AI 功能
                </label>
                <p className="text-sm text-gray-500">开启后可以使用所有 AI 自动化功能</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI 提供商</label>
                <select
                  value={config.provider}
                  onChange={(e) => updateConfig("provider", e.target.value as AIProvider)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="openai">OpenAI (GPT-4/GPT-3.5)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="azure">Azure OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模型</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => updateConfig("model", e.target.value)}
                  placeholder="gpt-4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => updateConfig("apiKey", e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">您的 API Key 将被安全存储，不会显示在界面上</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">API 端点 (可选)</label>
                <input
                  type="text"
                  value={config.apiEndpoint || ""}
                  onChange={(e) => updateConfig("apiEndpoint", e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">温度 (Temperature)</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => updateConfig("temperature", parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>精确 (0)</span>
                  <span>{config.temperature}</span>
                  <span>创意 (2)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大 Token 数</label>
                <input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => updateConfig("maxTokens", parseInt(e.target.value))}
                  min="100"
                  max="8000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 图片生成配置 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" />
                图片生成配置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图片提供商</label>
                  <select
                    value={config.imageProvider}
                    onChange={(e) => updateConfig("imageProvider", e.target.value as ImageProvider)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="dall-e">DALL-E (OpenAI)</option>
                    <option value="midjourney">Midjourney</option>
                    <option value="stable-diffusion">Stable Diffusion</option>
                    <option value="pollinations">Pollinations.ai (免费)</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图片模型 (可选)</label>
                  <input
                    type="text"
                    value={config.imageModel || ""}
                    onChange={(e) => updateConfig("imageModel", e.target.value)}
                    placeholder="dall-e-3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图片 API Key (可选)</label>
                  <input
                    type="password"
                    value={config.imageApiKey || ""}
                    onChange={(e) => updateConfig("imageApiKey", e.target.value)}
                    placeholder="如果与主 API Key 不同请填写"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图片 API 端点 (可选)</label>
                  <input
                    type="text"
                    value={config.imageApiEndpoint || ""}
                    onChange={(e) => updateConfig("imageApiEndpoint", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 功能开关 */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI 功能开关</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "autoWrite", label: "自动写作", desc: "根据主题自动生成完整文章", icon: FileText },
                { key: "autoImage", label: "AI 配图", desc: "为文章自动生成插图", icon: Image },
                { key: "autoCover", label: "自动封面", desc: "为文章生成封面图片", icon: Image },
                { key: "autoSummary", label: "自动摘要", desc: "自动生成文章摘要", icon: FileText },
                { key: "autoTags", label: "自动标签", desc: "自动提取关键词生成标签", icon: Tags },
                { key: "autoSEO", label: "SEO 优化", desc: "自动优化 SEO 元数据", icon: Search },
                { key: "autoInternalLink", label: "内部链接", desc: "自动推荐内部链接", icon: Link },
                { key: "autoSearchPush", label: "搜索推送", desc: "自动推送到搜索引擎", icon: Globe },
                { key: "autoTranslate", label: "自动翻译", desc: "文章发布时自动翻译为多语言", icon: Languages },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.key}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={feature.key}
                      checked={config.features[feature.key as keyof typeof config.features]}
                      onChange={(e) => updateConfig(`features.${feature.key}`, e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor={feature.key} className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        {feature.label}
                      </label>
                      <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 写作配置 */}
        {activeTab === "writing" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">写作风格配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">默认语言</label>
                <select
                  value={config.writing.defaultLanguage}
                  onChange={(e) => updateConfig("writing.defaultLanguage", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">写作语气</label>
                <select
                  value={config.writing.defaultTone}
                  onChange={(e) => updateConfig("writing.defaultTone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="professional">专业正式</option>
                  <option value="casual">轻松随意</option>
                  <option value="technical">技术深度</option>
                  <option value="friendly">友好亲切</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最小字数</label>
                <input
                  type="number"
                  value={config.writing.minWordCount}
                  onChange={(e) => updateConfig("writing.minWordCount", parseInt(e.target.value))}
                  min="100"
                  max="5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大字数</label>
                <input
                  type="number"
                  value={config.writing.maxWordCount}
                  onChange={(e) => updateConfig("writing.maxWordCount", parseInt(e.target.value))}
                  min="500"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="includeCodeExamples"
                  checked={config.writing.includeCodeExamples}
                  onChange={(e) => updateConfig("writing.includeCodeExamples", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="includeCodeExamples" className="font-medium text-gray-900 cursor-pointer">
                    包含代码示例
                  </label>
                  <p className="text-sm text-gray-500">技术类文章自动插入代码示例</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={config.writing.includeImages}
                  onChange={(e) => updateConfig("writing.includeImages", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="includeImages" className="font-medium text-gray-900 cursor-pointer">
                    文章中插入图片
                  </label>
                  <p className="text-sm text-gray-500">在文章内容中自动插入相关图片</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="generateToc"
                  checked={config.writing.generateToc}
                  onChange={(e) => updateConfig("writing.generateToc", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="generateToc" className="font-medium text-gray-900 cursor-pointer">
                    生成目录
                  </label>
                  <p className="text-sm text-gray-500">为文章自动生成目录结构</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO 配置 */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO 优化配置</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="generateMetaDescription"
                  checked={config.seo.generateMetaDescription}
                  onChange={(e) => updateConfig("seo.generateMetaDescription", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="generateMetaDescription" className="font-medium text-gray-900 cursor-pointer">
                    自动生成 Meta Description
                  </label>
                  <p className="text-sm text-gray-500">根据文章内容生成 SEO 友好的描述</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="generateKeywords"
                  checked={config.seo.generateKeywords}
                  onChange={(e) => updateConfig("seo.generateKeywords", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="generateKeywords" className="font-medium text-gray-900 cursor-pointer">
                    自动生成 Meta Keywords
                  </label>
                  <p className="text-sm text-gray-500">提取文章关键词作为 meta keywords</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="optimizeTitle"
                  checked={config.seo.optimizeTitle}
                  onChange={(e) => updateConfig("seo.optimizeTitle", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="optimizeTitle" className="font-medium text-gray-900 cursor-pointer">
                    优化文章标题
                  </label>
                  <p className="text-sm text-gray-500">使用 AI 优化标题使其更具吸引力</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="generateStructuredData"
                  checked={config.seo.generateStructuredData}
                  onChange={(e) => updateConfig("seo.generateStructuredData", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="generateStructuredData" className="font-medium text-gray-900 cursor-pointer">
                    生成结构化数据
                  </label>
                  <p className="text-sm text-gray-500">自动生成 JSON-LD 结构化数据</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 推送配置 */}
        {activeTab === "push" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">搜索引擎推送配置</h3>
            <p className="text-sm text-gray-500 mb-4">文章发布时自动推送到以下搜索引擎，加快收录速度</p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="pushBaidu"
                  checked={config.push.baidu}
                  onChange={(e) => updateConfig("push.baidu", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="pushBaidu" className="font-medium text-gray-900 cursor-pointer">
                    百度推送
                  </label>
                  <p className="text-sm text-gray-500">推送到百度搜索，需要配置百度站长平台 Token</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="pushBing"
                  checked={config.push.bing}
                  onChange={(e) => updateConfig("push.bing", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="pushBing" className="font-medium text-gray-900 cursor-pointer">
                    必应推送 (IndexNow)
                  </label>
                  <p className="text-sm text-gray-500">使用 IndexNow 协议推送到必应搜索</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="pushGoogle"
                  checked={config.push.google}
                  onChange={(e) => updateConfig("push.google", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="pushGoogle" className="font-medium text-gray-900 cursor-pointer">
                    Google 推送
                  </label>
                  <p className="text-sm text-gray-500">使用 Google Indexing API 推送</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="pushYandex"
                  checked={config.push.yandex}
                  onChange={(e) => updateConfig("push.yandex", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="pushYandex" className="font-medium text-gray-900 cursor-pointer">
                    Yandex 推送
                  </label>
                  <p className="text-sm text-gray-500">推送到俄罗斯 Yandex 搜索引擎</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="pushIndexnow"
                  checked={config.push.indexnow}
                  onChange={(e) => updateConfig("push.indexnow", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="pushIndexnow" className="font-medium text-gray-900 cursor-pointer">
                    IndexNow 通用推送
                  </label>
                  <p className="text-sm text-gray-500">使用 IndexNow 协议推送到所有支持的搜索引擎</p>
                </div>
              </div>
            </div>

            {config.push.indexnow && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">IndexNow Key</label>
                <input
                  type="text"
                  value={config.push.indexnowKey || ""}
                  onChange={(e) => updateConfig("push.indexnowKey", e.target.value)}
                  placeholder="输入您的 IndexNow Key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">在 IndexNow.org 注册获取 Key</p>
              </div>
            )}
          </div>
        )}

        {/* 翻译配置 */}
        {activeTab === "translate" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <input
                type="checkbox"
                id="translateEnabled"
                checked={config.translate.enabled}
                onChange={(e) => updateConfig("translate.enabled", e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="translateEnabled" className="font-medium text-gray-900 cursor-pointer">
                  启用 AI 自动翻译
                </label>
                <p className="text-sm text-gray-500">文章发布时自动翻译为多种语言</p>
              </div>
            </div>

            {config.translate.enabled && (
              <>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="autoTranslateOnPublish"
                    checked={config.translate.autoTranslateOnPublish}
                    onChange={(e) => updateConfig("translate.autoTranslateOnPublish", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="autoTranslateOnPublish" className="font-medium text-gray-900 cursor-pointer">
                      发布时自动翻译
                    </label>
                    <p className="text-sm text-gray-500">文章发布时自动触发翻译任务</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">目标语言</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { code: "en", name: "英语 (English)" },
                      { code: "ja", name: "日语 (日本語)" },
                      { code: "ko", name: "韩语 (한국어)" },
                      { code: "fr", name: "法语 (Français)" },
                      { code: "de", name: "德语 (Deutsch)" },
                      { code: "es", name: "西班牙语 (Español)" },
                      { code: "ru", name: "俄语 (Русский)" },
                      { code: "pt", name: "葡萄牙语 (Português)" },
                      { code: "it", name: "意大利语 (Italiano)" },
                      { code: "ar", name: "阿拉伯语 (العربية)" },
                      { code: "hi", name: "印地语 (हिन्दी)" },
                      { code: "th", name: "泰语 (ไทย)" },
                      { code: "vi", name: "越南语 (Tiếng Việt)" },
                    ].map((lang) => (
                      <label
                        key={lang.code}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={config.translate.targetLanguages.includes(lang.code)}
                          onChange={(e) => {
                            const newLanguages = e.target.checked
                              ? [...config.translate.targetLanguages, lang.code]
                              : config.translate.targetLanguages.filter((l) => l !== lang.code);
                            updateConfig("translate.targetLanguages", newLanguages);
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900">翻译内容</h4>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="translateTitle"
                      checked={config.translate.translateTitle}
                      onChange={(e) => updateConfig("translate.translateTitle", e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="translateTitle" className="font-medium text-gray-900 cursor-pointer">
                        翻译标题
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="translateContent"
                      checked={config.translate.translateContent}
                      onChange={(e) => updateConfig("translate.translateContent", e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="translateContent" className="font-medium text-gray-900 cursor-pointer">
                        翻译正文内容
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="translateSummary"
                      checked={config.translate.translateSummary}
                      onChange={(e) => updateConfig("translate.translateSummary", e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="translateSummary" className="font-medium text-gray-900 cursor-pointer">
                        翻译摘要
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="translateMeta"
                      checked={config.translate.translateMeta}
                      onChange={(e) => updateConfig("translate.translateMeta", e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <label htmlFor="translateMeta" className="font-medium text-gray-900 cursor-pointer">
                        翻译 SEO 元数据
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
