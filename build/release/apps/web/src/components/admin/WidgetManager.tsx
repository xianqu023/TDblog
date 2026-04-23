"use client";

import { useState, useCallback } from "react";
import {
  AVAILABLE_WIDGETS,
  WidgetConfig,
  PageType,
  SidebarConfig,
  DEFAULT_SIDEBAR_CONFIG,
  WidgetId,
} from "@/lib/sidebar-config";
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings2,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
} from "lucide-react";
import { saveWidgetConfig } from "@/app/actions/widget-config";

interface WidgetManagerProps {
  initialConfig?: SidebarConfig;
}

export default function WidgetManager({ initialConfig }: WidgetManagerProps) {
  const [config, setConfig] = useState<SidebarConfig>(
    initialConfig || DEFAULT_SIDEBAR_CONFIG
  );
  const [activePage, setActivePage] = useState<PageType>("home");
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const widgets = config[activePage] || [];

  const toggleWidget = useCallback(
    (widgetId: WidgetId) => {
      setConfig((prev) => ({
        ...prev,
        [activePage]: prev[activePage].map((w) =>
          w.id === widgetId ? { ...w, enabled: !w.enabled } : w
        ),
      }));
    },
    [activePage]
  );

  const moveWidget = useCallback(
    (widgetId: WidgetId, direction: "up" | "down") => {
      setConfig((prev) => {
        const pageWidgets = [...prev[activePage]];
        const index = pageWidgets.findIndex((w) => w.id === widgetId);
        if (index === -1) return prev;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= pageWidgets.length) return prev;

        // Swap
        [pageWidgets[index], pageWidgets[newIndex]] = [
          pageWidgets[newIndex],
          pageWidgets[index],
        ];

        // Update orders
        return {
          ...prev,
          [activePage]: pageWidgets.map((w, i) => ({ ...w, order: i })),
        };
      });
    },
    [activePage]
  );

  const updateWidgetSettings = useCallback(
    (widgetId: WidgetId, newSettings: Record<string, any>) => {
      setConfig((prev) => ({
        ...prev,
        [activePage]: prev[activePage].map((w) =>
          w.id === widgetId ? { ...w, settings: { ...w.settings, ...newSettings } } : w
        ),
      }));
    },
    [activePage]
  );

  const resetToDefault = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      [activePage]: DEFAULT_SIDEBAR_CONFIG[activePage].map((w) => ({ ...w })),
    }));
  }, [activePage]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveWidgetConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save widget config:", error);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const pages: { key: PageType; label: string }[] = [
    { key: "home", label: "首页" },
    { key: "articles", label: "文章列表" },
    { key: "article_detail", label: "文章详情" },
    { key: "shop", label: "商店" },
    { key: "category", label: "分类" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {pages.map((page) => (
          <button
            key={page.key}
            onClick={() => setActivePage(page.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activePage === page.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* Widget List */}
      <div className="space-y-3">
        {widgets.map((widget, index) => {
          const widgetInfo = AVAILABLE_WIDGETS[widget.id];
          if (!widgetInfo) return null;
          const Icon = widgetInfo.icon;
          const isExpanded = expandedWidget === widget.id;

          return (
            <div
              key={widget.id}
              className={`bg-white border rounded-lg transition-all ${
                !widget.enabled ? "opacity-60" : ""
              }`}
            >
              {/* Widget Header */}
              <div className="flex items-center p-4">
                {/* Drag Handle */}
                <GripVertical className="h-5 w-5 text-gray-400 mr-2 cursor-move" />

                {/* Icon */}
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                    widget.enabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{widgetInfo.name}</div>
                  <div className="text-sm text-gray-500">{widgetInfo.description}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {/* Move Up */}
                  <button
                    onClick={() => moveWidget(widget.id, "up")}
                    disabled={index === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="上移"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => moveWidget(widget.id, "down")}
                    disabled={index === widgets.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="下移"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Settings Toggle */}
                  <button
                    onClick={() => setExpandedWidget(isExpanded ? null : widget.id)}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${
                      isExpanded ? "bg-gray-100" : ""
                    }`}
                    title="设置"
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>

                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`p-2 rounded-lg ${
                      widget.enabled
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={widget.enabled ? "禁用" : "启用"}
                  >
                    {widget.enabled ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Settings */}
              {isExpanded && (
                <div className="border-t p-4 bg-gray-50">
                  <WidgetSettingsPanel
                    widgetId={widget.id}
                    settings={widget.settings}
                    onUpdate={updateWidgetSettings}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={resetToDefault}
          className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          恢复默认
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
            saved
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:opacity-50`}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : saved ? "已保存" : "保存配置"}
        </button>
      </div>
    </div>
  );
}

// Widget Settings Panel Component
function WidgetSettingsPanel({
  widgetId,
  settings,
  onUpdate,
}: {
  widgetId: WidgetId;
  settings: Record<string, any>;
  onUpdate: (widgetId: WidgetId, settings: Record<string, any>) => void;
}) {
  const widgetInfo = AVAILABLE_WIDGETS[widgetId];
  if (!widgetInfo) return null;

  const defaultSettings = widgetInfo.defaultSettings;

  const handleChange = (key: string, value: any) => {
    onUpdate(widgetId, { [key]: value });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900 mb-3">组件设置</h4>

      {Object.entries(defaultSettings).map(([key, defaultValue]) => {
        const currentValue =
          settings[key] !== undefined ? settings[key] : defaultValue;

        if (typeof defaultValue === "number") {
          return (
            <div key={key}>
              <label className="block text-xs text-gray-600 mb-1">
                {getSettingLabel(key)}
              </label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => handleChange(key, parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          );
        }

        if (typeof defaultValue === "boolean") {
          return (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentValue}
                onChange={(e) => handleChange(key, e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">{getSettingLabel(key)}</span>
            </label>
          );
        }

        return (
          <div key={key}>
            <label className="block text-xs text-gray-600 mb-1">
              {getSettingLabel(key)}
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

function getSettingLabel(key: string): string {
  const labels: Record<string, string> = {
    name: "名称",
    bio: "简介",
    articleCount: "文章数",
    viewCount: "阅读量",
    followerCount: "粉丝数",
    limit: "显示数量",
    title: "标题",
    description: "描述",
    imageUrl: "图片链接",
    linkUrl: "链接地址",
    targetDate: "目标日期",
    city: "城市",
    showCount: "显示数量",
    showEmpty: "显示空分类",
    maxDepth: "最大层级",
    style: "样式",
    showIcons: "显示图标",
    showNumber: "显示序号",
    collapseLevel: "折叠层级",
    showCover: "显示封面",
    showExcerpt: "显示摘要",
    showDate: "显示日期",
    showViews: "显示浏览量",
    showBadge: "显示标签",
    refreshInterval: "刷新间隔",
    columns: "列数",
    lightbox: "灯箱效果",
    placeholder: "占位文字",
    buttonText: "按钮文字",
    successMessage: "成功消息",
    provider: "服务商",
    platforms: "平台",
    layout: "布局",
    showLabels: "显示标签",
    showMedia: "显示媒体",
    showPrice: "显示价格",
    showButton: "显示按钮",
    showCopy: "显示复制",
    showSize: "显示大小",
    showRank: "显示排名",
    period: "周期",
    showTotal: "显示合计",
    showRating: "显示评分",
    showArticles: "显示文章",
    highlightToday: "高亮今日",
    showReplies: "显示回复",
    forumUrl: "论坛地址",
    allowMultiple: "允许多选",
    showResults: "显示结果",
    showAvatar: "显示头像",
    showArticle: "显示文章",
    autoLink: "自动链接",
    showSuggestions: "显示建议",
    searchType: "搜索类型",
    size: "尺寸",
    showTip: "显示提示",
    content: "内容",
    showLabel: "显示标签",
    minSize: "最小字号",
    maxSize: "最大字号",
    defaultSize: "默认字号",
    languages: "语言",
    feedUrl: "订阅地址",
    links: "链接",
  };
  return labels[key] || key;
}
