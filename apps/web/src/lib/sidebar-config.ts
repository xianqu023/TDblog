import {
  User,
  TrendingUp,
  Tag,
  Megaphone,
  Clock,
  Cloud,
} from "lucide-react";

export type WidgetId =
  | "blogger"
  | "popular"
  | "tags"
  | "ad"
  | "countdown"
  | "weather";

export type PageType = "home" | "articles" | "article_detail";

export interface WidgetConfig {
  id: WidgetId;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

export interface PageWidgetConfig {
  [key: string]: WidgetConfig[];
}

export interface SidebarConfig {
  [pageType: string]: WidgetConfig[];
}

export const AVAILABLE_WIDGETS: Record<
  WidgetId,
  {
    id: WidgetId;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultSettings: Record<string, any>;
  }
> = {
  blogger: {
    id: "blogger",
    name: "博主卡片",
    description: "展示博主信息的卡片组件",
    icon: User,
    defaultSettings: {
      name: "博主名称",
      bio: "热爱技术，热爱生活。在这里分享我的学习笔记和心得体会。",
      articleCount: 128,
      viewCount: 56800,
      followerCount: 2580,
    },
  },
  popular: {
    id: "popular",
    name: "热门文章",
    description: "展示阅读量最高的文章列表",
    icon: TrendingUp,
    defaultSettings: {
      limit: 5,
    },
  },
  tags: {
    id: "tags",
    name: "标签云",
    description: "展示热门标签的云朵组件",
    icon: Tag,
    defaultSettings: {},
  },
  ad: {
    id: "ad",
    name: "广告卡片",
    description: "展示广告或推广内容的卡片",
    icon: Megaphone,
    defaultSettings: {
      title: "广告标题",
      description: "这是一个广告展示位，点击了解更多详情。",
      imageUrl:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      linkUrl: "#",
    },
  },
  countdown: {
    id: "countdown",
    name: "倒计时卡片",
    description: "显示活动或事件倒计时的组件",
    icon: Clock,
    defaultSettings: {
      title: "活动倒计时",
      description: "距离新年还有",
      targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
    },
  },
  weather: {
    id: "weather",
    name: "天气卡片",
    description: "显示当前城市天气信息的组件",
    icon: Cloud,
    defaultSettings: {
      city: "上海",
    },
  },
};

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  home: [
    { id: "blogger", enabled: true, order: 0, settings: {} },
    { id: "popular", enabled: true, order: 1, settings: { limit: 5 } },
    { id: "tags", enabled: true, order: 2, settings: {} },
    { id: "ad", enabled: true, order: 3, settings: {} },
    { id: "countdown", enabled: false, order: 4, settings: {} },
    { id: "weather", enabled: false, order: 5, settings: {} },
  ],
  articles: [
    { id: "popular", enabled: true, order: 0, settings: { limit: 5 } },
    { id: "tags", enabled: true, order: 1, settings: {} },
    { id: "blogger", enabled: true, order: 2, settings: {} },
    { id: "ad", enabled: true, order: 3, settings: {} },
    { id: "countdown", enabled: false, order: 4, settings: {} },
    { id: "weather", enabled: false, order: 5, settings: {} },
  ],
  article_detail: [
    { id: "blogger", enabled: true, order: 0, settings: {} },
    { id: "popular", enabled: true, order: 1, settings: { limit: 5 } },
    { id: "tags", enabled: true, order: 2, settings: {} },
    { id: "ad", enabled: true, order: 3, settings: {} },
    { id: "countdown", enabled: false, order: 4, settings: {} },
    { id: "weather", enabled: false, order: 5, settings: {} },
  ],
};

export function getDefaultConfig(pageType: PageType): WidgetConfig[] {
  return DEFAULT_SIDEBAR_CONFIG[pageType] || [];
}

export function mergeWidgetSettings(
  widgetId: WidgetId,
  customSettings: Record<string, any> = {}
): Record<string, any> {
  const widget = AVAILABLE_WIDGETS[widgetId];
  if (!widget) return {};

  return {
    ...widget.defaultSettings,
    ...customSettings,
  };
}
