"use client";

/**
 * 中式双栏主题设置页面
 * 管理中式主题的所有配置：布局、侧边组件、广告位、SEO 等
 */

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Palette,
  LayoutGrid,
  Megaphone,
  Search,
  Eye,
  EyeOff,
  Check,
  X,
  RotateCcw,
  Globe,
  Zap,
  Monitor,
  Sparkles,
  Image,
  GripVertical,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import SliderConfig from "@/components/admin/SliderConfig";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 默认主题配置
const DEFAULT_CONFIG = {
  global: {
    enabled: true,
    primaryColor: "#C41E3A",
    secondaryColor: "#1A2B48",
    backgroundColor: "#F8F5F0",
    textColor: "#1A1A1A",
    fontSize: "16px",
    fontFamily: "思源宋体，serif",
    enableAnimations: true,
  },
  layout: {
    isTwoColumn: true,
    sidebarPosition: "right" as "left" | "right",
    isStickySidebar: true,
    articleViewMode: "card" as "card" | "list",
    enableAnimations: true,
  },
  slider: {
    sliderEnable: true,
    sliderArticleCount: 3,
    adSliderRightImgUrl: undefined as string | undefined,
    adSliderRightLink: undefined as string | undefined,
    adSliderRightEnabled: true,
  } as {
    sliderEnable: boolean;
    sliderArticleCount: number;
    adSliderRightImgUrl: string | undefined;
    adSliderRightLink: string | undefined;
    adSliderRightEnabled: boolean;
  },
  sidebarWidgets: {
    searchBox: { enabled: true, order: 1, title: "搜索框" },
    authorInfo: { enabled: true, order: 2, title: "博主信息" },
    hotArticles: { enabled: true, order: 3, title: "热门文章" },
    tagCloud: { enabled: true, order: 4, title: "标签云" },
    calendarArchive: { enabled: true, order: 5, title: "日历归档" },
    announcement: { enabled: true, order: 6, title: "公告通知" },
    dailyQuote: { enabled: true, order: 7, title: "每日一句" },
    friendLinks: { enabled: true, order: 8, title: "友情链接" },
    emailSubscription: { enabled: true, order: 9, title: "邮件订阅" },
    categories: { enabled: false, order: 10, title: "分类目录" },
    latestArticles: { enabled: false, order: 11, title: "最新文章" },
    randomArticles: { enabled: false, order: 12, title: "随机推荐" },
    siteStats: { enabled: false, order: 13, title: "站点统计" },
    weatherWidget: { enabled: false, order: 14, title: "天气组件" },
    hotComments: { enabled: false, order: 15, title: "最新评论" },
    onlineTools: { enabled: false, order: 16, title: "在线工具" },
    photoGallery: { enabled: false, order: 17, title: "照片画廊" },
  },
  adSlots: {
    topBanner: { enabled: false, type: "adsense", size: "728x90", imageUrl: "", linkUrl: "" },
    sidebarTop: { enabled: false, type: "adsense", size: "300x250", imageUrl: "", linkUrl: "" },
    sidebarMiddle: { enabled: false, type: "adsense", size: "300x600", imageUrl: "", linkUrl: "" },
    articleListMiddle: { enabled: false, type: "adsense", size: "728x90", imageUrl: "", linkUrl: "" },
    articleBottom: { enabled: false, type: "adsense", size: "728x90", imageUrl: "", linkUrl: "" },
  },
  seo: {
    enableBaiduPush: true,
    enableGoogleIndex: true,
    autoSitemap: true,
    structuredData: true,
  },
};

type TabKey = "global" | "layout" | "slider" | "widgets" | "ads" | "seo";

export default function ThemeSettingsPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabKey>("global");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>("chinese-two-column");

  // 初始化组件顺序
  useEffect(() => {
    const order = Object.entries(config.sidebarWidgets)
      .sort((a, b) => (a[1]?.order || 0) - (b[1]?.order || 0))
      .map(([id]) => id);
    setWidgetOrder(order);
  }, [config.sidebarWidgets]);

  // Dnd-kit 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 拖动 8px 后激活
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 加载主题列表和配置
  useEffect(() => {
    const loadThemes = async () => {
      setLoading(true);
      try {
        // 获取所有主题
        const res = await fetch("/api/themes");
        const data = await res.json();
        
        if (data.themes) {
          setThemes(data.themes);
          
          // 找到当前激活的主题
          const activeTheme = data.themes.find((t: any) => t.isActive) || data.themes.find((t: any) => t.isDefault);
          if (activeTheme) {
            setCurrentTheme(activeTheme.slug);
            if (activeTheme.config) {
              setConfig({
                ...DEFAULT_CONFIG,
                ...activeTheme.config,
                sidebarWidgets: {
                  ...DEFAULT_CONFIG.sidebarWidgets,
                  ...(activeTheme.config.sidebarWidgets || {}),
                },
                adSlots: {
                  ...DEFAULT_CONFIG.adSlots,
                  ...(activeTheme.config.adSlots || {}),
                },
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadThemes();
  }, []);

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // 找到当前主题
      const currentThemeData = themes.find(t => t.slug === currentTheme);
      
      if (!currentThemeData) {
        setMessage({ type: "error", text: "未找到当前主题" });
        return;
      }

      // 保存主题配置
      const response = await fetch(`/api/themes/${currentThemeData.id}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "主题配置已保存并应用到所有页面" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "保存失败" });
      }
    } catch (error) {
      console.error("Save theme config error:", error);
      setMessage({ type: "error", text: "保存失败" });
    } finally {
      setSaving(false);
    }
  };

  // 重置配置
  const handleReset = () => {
    if (confirm("确定要重置为默认配置吗？")) {
      setConfig(DEFAULT_CONFIG);
      setMessage({ type: "success", text: "配置已重置" });
    }
  };

  // 更新全局配置
  const updateGlobalConfig = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        [key]: value,
      },
    }));
  };

  // 切换组件启用状态
  const toggleWidget = useCallback((widgetId: string) => {
    setConfig((prev) => {
      const widgetConfig = prev.sidebarWidgets[widgetId as keyof typeof prev.sidebarWidgets];
      return {
        ...prev,
        sidebarWidgets: {
          ...prev.sidebarWidgets,
          [widgetId]: {
            ...widgetConfig,
            enabled: !(widgetConfig?.enabled ?? false),
          },
        },
      };
    });
  }, []);

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id as string);
      const newIndex = widgetOrder.indexOf(over.id as string);
      
      const newOrder = arrayMove(widgetOrder, oldIndex, newIndex);
      setWidgetOrder(newOrder);
      
      // 更新配置中的 order 值
      setConfig((prev) => {
        const newSidebarWidgets = { ...prev.sidebarWidgets };
        newOrder.forEach((widgetId, index) => {
          const widget = newSidebarWidgets[widgetId as keyof typeof newSidebarWidgets];
          if (widget) {
            (widget as any).order = index + 1;
          }
        });
        return {
          ...prev,
          sidebarWidgets: newSidebarWidgets,
        };
      });
    }
  };

  // 更新广告位配置
  const updateAdSlot = (position: string, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      adSlots: {
        ...prev.adSlots,
        [position as keyof typeof prev.adSlots]: {
          ...prev.adSlots[position as keyof typeof prev.adSlots],
          [key]: value,
        },
      },
    }));
  };

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "global", label: "全局设置", icon: Palette },
    { key: "layout", label: "布局配置", icon: LayoutGrid },
    { key: "slider", label: "幻灯片", icon: Image },
    { key: "widgets", label: "侧边组件", icon: LayoutGrid },
    { key: "ads", label: "广告管理", icon: Megaphone },
    { key: "seo", label: "SEO 设置", icon: Search },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载主题配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 顶部标题栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">主题管理中心</h1>
                <p className="text-sm text-gray-500 mt-1">统一管理所有主题配置，实时切换预览</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                重置配置
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? "保存中..." : "一键保存"}
              </button>
            </div>
          </div>
          
          {/* 主题选择器 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">当前主题：</label>
              </div>
              <select
                value={currentTheme}
                onChange={async (e) => {
                  const selectedSlug = e.target.value;
                  const selectedTheme = themes.find(t => t.slug === selectedSlug);
                  
                  if (selectedTheme) {
                    // 激活主题
                    const res = await fetch(`/api/themes/${selectedTheme.id}/activate`, {
                      method: 'POST',
                    });
                    
                    if (res.ok) {
                      setCurrentTheme(selectedSlug);
                      setConfig({
                        ...DEFAULT_CONFIG,
                        ...selectedTheme.config,
                        sidebarWidgets: {
                          ...DEFAULT_CONFIG.sidebarWidgets,
                          ...(selectedTheme.config?.sidebarWidgets || {}),
                        },
                        adSlots: {
                          ...DEFAULT_CONFIG.adSlots,
                          ...(selectedTheme.config?.adSlots || {}),
                        },
                      });
                      setMessage({ type: "success", text: `已切换到 ${selectedTheme.name}` });
                      setTimeout(() => setMessage(null), 3000);
                    }
                  }
                }}
                className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.slug}>
                    {theme.name} {theme.isDefault && '(默认)'} {theme.isActive && '(当前)'}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                <LayoutGrid className="w-4 h-4" />
                <span>共 {themes.length} 个主题</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="px-8">
          <div
            className={`mt-6 p-5 rounded-xl flex items-center gap-3 border shadow-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="flex">
        {/* 左侧标签导航 */}
        <div className="w-72 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-[calc(100vh-220px)] py-6 px-4 sticky top-[160px] mt-6 mx-4 rounded-2xl shadow-sm">
          <div className="mb-4 px-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">配置分类</div>
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all rounded-xl mb-1 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium border border-blue-100 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.key ? "text-blue-600" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 右侧配置内容 */}
        <div className="flex-1 p-8">
          {/* 全局设置 */}
          {activeTab === "global" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-gray-200">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-md shadow-blue-500/30">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">主题全局开关</h2>
                    <p className="text-sm text-gray-500 mt-1">控制主题的基础配置和视觉效果</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">启用主题</label>
                    <button
                      onClick={() => updateGlobalConfig("enabled", !(config.global?.enabled ?? true))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.global?.enabled ? "bg-[#C41E3A]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.global?.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">主色调</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.global?.primaryColor || "#C41E3A"}
                          onChange={(e) => updateGlobalConfig("primaryColor", e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.global.primaryColor}
                          onChange={(e) => updateGlobalConfig("primaryColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">辅助色</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.global.secondaryColor}
                          onChange={(e) => updateGlobalConfig("secondaryColor", e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.global.secondaryColor}
                          onChange={(e) => updateGlobalConfig("secondaryColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">背景色</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.global.backgroundColor}
                          onChange={(e) => updateGlobalConfig("backgroundColor", e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.global.backgroundColor}
                          onChange={(e) => updateGlobalConfig("backgroundColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">文字颜色</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.global.textColor}
                          onChange={(e) => updateGlobalConfig("textColor", e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.global.textColor}
                          onChange={(e) => updateGlobalConfig("textColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
                      <select
                        value={config.global.fontSize}
                        onChange={(e) => updateGlobalConfig("fontSize", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                      >
                        <option value="14px">14px (小)</option>
                        <option value="16px">16px (标准)</option>
                        <option value="18px">18px (大)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">字体家族</label>
                      <select
                        value={config.global.fontFamily}
                        onChange={(e) => updateGlobalConfig("fontFamily", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C41E3A]"
                      >
                        <option value="system-ui">系统默认</option>
                        <option value="思源宋体，serif">思源宋体</option>
                        <option value="站酷小薇，sans-serif">站酷小薇</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700">启用动画效果</label>
                    <button
                      onClick={() => updateGlobalConfig("enableAnimations", !config.global.enableAnimations)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.global.enableAnimations ? "bg-[#C41E3A]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.global.enableAnimations ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 幻灯片配置 */}
          {activeTab === "slider" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-gray-200">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-md shadow-purple-500/30">
                    <Image className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">幻灯片配置</h2>
                    <p className="text-sm text-gray-500 mt-1">管理首页幻灯片和广告位展示</p>
                  </div>
                </div>
                <SliderConfig
                  sliderEnable={config.slider?.sliderEnable ?? true}
                  sliderArticleCount={config.slider?.sliderArticleCount ?? 3}
                  adSliderRightImgUrl={config.slider?.adSliderRightImgUrl}
                  adSliderRightLink={config.slider?.adSliderRightLink}
                  adSliderRightEnabled={config.slider?.adSliderRightEnabled ?? true}
                  onChange={(sliderConfig) => {
                    setConfig({
                      ...config,
                      slider: {
                        ...config.slider,
                        ...sliderConfig,
                        adSliderRightImgUrl: sliderConfig.adSliderRightImgUrl,
                        adSliderRightLink: sliderConfig.adSliderRightLink,
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* 布局配置 */}
          {activeTab === "layout" && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-gray-200">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-md shadow-blue-500/30">
                    <LayoutGrid className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">布局配置</h2>
                    <p className="text-sm text-gray-500 mt-1">自定义页面布局和展示方式</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">双栏布局</p>
                        <p className="text-sm text-gray-500 mt-1">启用侧边栏显示</p>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, layout: { ...config.layout, isTwoColumn: !config.layout.isTwoColumn } })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.layout.isTwoColumn ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.layout.isTwoColumn ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">侧边栏位置</p>
                        <p className="text-sm text-gray-500 mt-1">选择侧边栏在左侧或右侧</p>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, layout: { ...config.layout, sidebarPosition: !config.layout.sidebarPosition || config.layout.sidebarPosition === "right" ? "left" : "right" } })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.layout.sidebarPosition === "right" ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.layout.sidebarPosition === "right" ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">粘性侧边栏</p>
                        <p className="text-sm text-gray-500 mt-1">滚动时侧边栏固定</p>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, layout: { ...config.layout, isStickySidebar: !config.layout.isStickySidebar } })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.layout.isStickySidebar ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.layout.isStickySidebar ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">文章视图模式</p>
                        <p className="text-sm text-gray-500 mt-1">卡片视图或列表视图</p>
                      </div>
                      <select
                        value={config.layout.articleViewMode}
                        onChange={(e) => setConfig({ ...config, layout: { ...config.layout, articleViewMode: e.target.value as "card" | "list" } })}
                        className="px-3 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="card">卡片视图</option>
                        <option value="list">列表视图</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">启用动画</p>
                        <p className="text-sm text-gray-500 mt-1">页面过渡和悬停动画</p>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, layout: { ...config.layout, enableAnimations: !config.layout.enableAnimations } })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.layout.enableAnimations ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.layout.enableAnimations ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 侧边组件 */}
          {activeTab === "widgets" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-4 mb-8 pb-5 border-b border-gray-200">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-md shadow-green-500/30">
                  <LayoutGrid className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">侧边栏组件管理</h2>
                  <p className="text-sm text-gray-500 mt-1">拖拽排序，勾选启用/禁用组件</p>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={widgetOrder}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-4">
                    {widgetOrder.map((widgetId) => {
                      const widgetConfig = config.sidebarWidgets[widgetId as keyof typeof config.sidebarWidgets];
                      return (
                        <SortableWidgetItem
                          key={widgetId}
                          widgetId={widgetId}
                          widgetConfig={widgetConfig}
                          onToggle={toggleWidget}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* 广告管理 */}
          {activeTab === "ads" && (
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-gray-200">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-md shadow-yellow-500/30">
                    <Megaphone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">广告位管理</h2>
                    <p className="text-sm text-gray-500 mt-1">配置 5 个广告位的展示</p>
                  </div>
                </div>

                {Object.entries(config.adSlots).map(([key, slot]) => (
                  <div key={key} className="p-4 border border-gray-200 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{key}</p>
                        <p className="text-sm text-gray-500">尺寸：{slot.size}</p>
                      </div>
                      <button
                        onClick={() => setConfig({
                          ...config,
                          adSlots: {
                            ...config.adSlots,
                            [key]: { ...slot, enabled: !slot.enabled },
                          },
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          slot.enabled ? "bg-[#C41E3A]" : "bg-gray-200"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          slot.enabled ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                    {slot.enabled && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">广告类型</label>
                          <select
                            value={slot.type}
                            onChange={(e) => setConfig({
                              ...config,
                              adSlots: {
                                ...config.adSlots,
                                [key]: { ...slot, type: e.target.value },
                              },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                          >
                            <option value="adsense">AdSense</option>
                            <option value="image">图片广告</option>
                            <option value="custom">自定义</option>
                          </select>
                        </div>
                        {slot.type === "image" && (
                          <>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                              <input
                                type="text"
                                value={slot.imageUrl || ""}
                                onChange={(e) => setConfig({
                                  ...config,
                                  adSlots: {
                                    ...config.adSlots,
                                    [key]: { ...slot, imageUrl: e.target.value },
                                  },
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">链接 URL</label>
                              <input
                                type="text"
                                value={slot.linkUrl || ""}
                                onChange={(e) => setConfig({
                                  ...config,
                                  adSlots: {
                                    ...config.adSlots,
                                    [key]: { ...slot, linkUrl: e.target.value },
                                  },
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="https://example.com"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO 设置 */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8 pb-5 border-b border-gray-200">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-md shadow-indigo-500/30">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">SEO 配置</h2>
                    <p className="text-sm text-gray-500 mt-1">优化搜索引擎收录</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(config.seo).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#C41E3A] transition-all">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {key === "enableBaiduPush" && "🔍 百度推送"}
                          {key === "enableGoogleIndex" && "🌐 Google 索引"}
                          {key === "autoSitemap" && "🗺️ 自动生成站点地图"}
                          {key === "structuredData" && "📊 结构化数据"}
                        </p>
                      </div>
                      <button
                        onClick={() => setConfig({
                          ...config,
                          seo: {
                            ...config.seo,
                            [key]: !value,
                          },
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? "bg-gradient-to-r from-[#C41E3A] to-red-600" : "bg-gray-200"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 可排序的 Widget 项组件
function SortableWidgetItem({
  widgetId,
  widgetConfig,
  onToggle,
}: {
  widgetId: string;
  widgetConfig: any;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widgetId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        isDragging 
          ? "border-blue-400 shadow-md bg-blue-50" 
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* 复选框 */}
      <input
        type="checkbox"
        checked={widgetConfig?.enabled ?? false}
        onChange={() => onToggle(widgetId)}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />

      {/* 标题 */}
      <span className={`text-sm font-medium flex-1 ${
        widgetConfig?.enabled ? "text-gray-900" : "text-gray-400 line-through"
      }`}>{widgetConfig.title}</span>

      {/* 状态图标 */}
      <div className="flex items-center gap-2">
        {widgetConfig?.enabled ? (
          <Eye className="w-5 h-5 text-green-600" />
        ) : (
          <EyeOff className="w-5 h-5 text-gray-400" />
        )}
        <span className="text-xs text-gray-500">优先级：{widgetConfig.order}</span>
      </div>
    </div>
  );
}
