import {
  User,
  TrendingUp,
  Tag,
  Megaphone,
  Clock,
  Cloud,
  Folder,
  FileText,
  List,
  Newspaper,
  Star,
  Image,
  Shuffle,
  Mail,
  Share2,
  Users,
  Rss,
  Heart,
  MailPlus,
  Gift,
  Download,
  Percent,
  ShoppingCart,
  Package,
  TrendingUp as TrendUp,
  Receipt,
  MessageCircle,
  MessageSquare,
  BarChart2,
  PenTool,
  Search,
  QrCode,
  Moon,
  Type,
  Languages,
  Calendar,
  Hash,
  ExternalLink,
} from "lucide-react";

export type WidgetId =
  | "blogger"
  | "popular"
  | "tags"
  | "ad"
  | "countdown"
  | "weather"
  | "category"
  | "pageLinks"
  | "toc"
  | "newArticles"
  | "relatedArticles"
  | "featuredPosts"
  | "randomPosts"
  | "gallery"
  | "newsletter"
  | "socialFollow"
  | "socialFeed"
  | "ctaButtons"
  | "promoProducts"
  | "coupons"
  | "downloadZone"
  | "recentComments"
  | "communityPosts"
  | "poll"
  | "guestbook"
  | "searchBox"
  | "qrCode"
  | "darkMode"
  | "fontSize"
  | "translate"
  | "miniCalendar"
  | "statistics"
  | "rssFeed"
  | "siteLinks"
  | "shoppingCart"
  | "productShowcase"
  | "hotProducts"
  | "recentOrders";

export type PageType = "home" | "articles" | "article_detail" | "shop" | "category";

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

export interface WidgetDefinition {
  id: WidgetId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "navigation" | "content" | "subscription" | "marketing" | "social" | "tools" | "info" | "ecommerce";
  defaultSettings: Record<string, any>;
}

export const AVAILABLE_WIDGETS: Record<WidgetId, WidgetDefinition> = {
  blogger: {
    id: "blogger",
    name: "博主卡片",
    description: "展示博主信息的卡片组件",
    icon: User,
    category: "content",
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
    category: "content",
    defaultSettings: {
      limit: 5,
      showViews: true,
      showDate: false,
    },
  },
  tags: {
    id: "tags",
    name: "标签云",
    description: "展示热门标签的云朵组件",
    icon: Tag,
    category: "navigation",
    defaultSettings: {
      maxTags: 20,
      colorMode: "gradient",
    },
  },
  ad: {
    id: "ad",
    name: "广告卡片",
    description: "展示广告或推广内容的卡片",
    icon: Megaphone,
    category: "marketing",
    defaultSettings: {
      title: "广告标题",
      description: "这是一个广告展示位，点击了解更多详情。",
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      linkUrl: "#",
    },
  },
  countdown: {
    id: "countdown",
    name: "倒计时卡片",
    description: "显示活动或事件倒计时的组件",
    icon: Clock,
    category: "marketing",
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
    category: "tools",
    defaultSettings: {
      city: "上海",
      showForecast: false,
    },
  },
  category: {
    id: "category",
    name: "分类目录",
    description: "展示博客文章分类目录",
    icon: Folder,
    category: "navigation",
    defaultSettings: {
      style: "tree",
      showCount: true,
      showEmpty: false,
      maxDepth: 2,
    },
  },
  pageLinks: {
    id: "pageLinks",
    name: "页面链接",
    description: "展示独立页面链接列表",
    icon: FileText,
    category: "navigation",
    defaultSettings: {
      pages: ["about", "contact", "guestbook"],
      showIcons: true,
    },
  },
  toc: {
    id: "toc",
    name: "文章目录",
    description: "显示文章目录结构，支持锚点跳转",
    icon: List,
    category: "navigation",
    defaultSettings: {
      title: "文章目录",
      showNumber: true,
      collapseLevel: 3,
    },
  },
  newArticles: {
    id: "newArticles",
    name: "最新文章",
    description: "展示最近发布的文章列表",
    icon: Newspaper,
    category: "content",
    defaultSettings: {
      limit: 5,
      showCover: true,
      showExcerpt: false,
      showDate: true,
    },
  },
  relatedArticles: {
    id: "relatedArticles",
    name: "相关文章",
    description: "展示与当前文章相关的文章",
    icon: Star,
    category: "content",
    defaultSettings: {
      limit: 5,
      algorithm: "tag",
      showCover: true,
    },
  },
  featuredPosts: {
    id: "featuredPosts",
    name: "精选文章",
    description: "展示编辑置顶的精选文章",
    icon: Star,
    category: "content",
    defaultSettings: {
      limit: 3,
      style: "card",
      showBadge: true,
    },
  },
  randomPosts: {
    id: "randomPosts",
    name: "随机文章",
    description: "随机展示文章，增加内容曝光",
    icon: Shuffle,
    category: "content",
    defaultSettings: {
      limit: 5,
      refreshInterval: 0,
    },
  },
  gallery: {
    id: "gallery",
    name: "图片画廊",
    description: "展示图片画廊/相册",
    icon: Image,
    category: "content",
    defaultSettings: {
      images: [],
      limit: 9,
      columns: 3,
      lightbox: true,
    },
  },
  newsletter: {
    id: "newsletter",
    name: "邮件订阅",
    description: "Newsletter邮件订阅表单",
    icon: MailPlus,
    category: "subscription",
    defaultSettings: {
      title: "订阅Newsletter",
      description: "订阅获取最新文章和更新通知",
      placeholder: "输入您的邮箱",
      buttonText: "订阅",
      successMessage: "订阅成功！",
      provider: "mailchimp",
    },
  },
  socialFollow: {
    id: "socialFollow",
    name: "社交关注",
    description: "展示社交媒体关注按钮",
    icon: Users,
    category: "subscription",
    defaultSettings: {
      title: "关注我",
      platforms: ["twitter", "instagram", "youtube", "wechat"],
      layout: "icon",
      showLabels: false,
    },
  },
  socialFeed: {
    id: "socialFeed",
    name: "社交动态",
    description: "展示社交媒体最新动态",
    icon: Rss,
    category: "subscription",
    defaultSettings: {
      platform: "twitter",
      limit: 5,
      showMedia: true,
    },
  },
  ctaButtons: {
    id: "ctaButtons",
    name: "CTA按钮组",
    description: "行动号召按钮（联系/购买/咨询）",
    icon: MessageCircle,
    category: "marketing",
    defaultSettings: {
      title: "联系我们",
      buttons: [
        { text: "在线客服", url: "/contact", style: "primary" },
        { text: "发送邮件", url: "mailto:example@email.com", style: "secondary" },
      ],
    },
  },
  promoProducts: {
    id: "promoProducts",
    name: "推广商品",
    description: "推广商品或服务展示",
    icon: Gift,
    category: "marketing",
    defaultSettings: {
      title: "精选推荐",
      products: [],
      showPrice: true,
      showButton: true,
      buttonText: "立即购买",
    },
  },
  coupons: {
    id: "coupons",
    name: "优惠券",
    description: "展示优惠码/折扣信息",
    icon: Percent,
    category: "marketing",
    defaultSettings: {
      title: "优惠折扣",
      coupons: [],
      showCopy: true,
    },
  },
  downloadZone: {
    id: "downloadZone",
    name: "下载专区",
    description: "文件资源下载区域",
    icon: Download,
    category: "marketing",
    defaultSettings: {
      title: "下载资源",
      files: [],
      showSize: true,
      showCount: true,
    },
  },
  recentComments: {
    id: "recentComments",
    name: "最新评论",
    description: "展示最新评论动态",
    icon: MessageSquare,
    category: "social",
    defaultSettings: {
      limit: 5,
      showAvatar: true,
      showArticle: true,
      autoLink: true,
    },
  },
  communityPosts: {
    id: "communityPosts",
    name: "社区讨论",
    description: "展示论坛/社区最新帖子",
    icon: MessageCircle,
    category: "social",
    defaultSettings: {
      title: "社区热议",
      limit: 5,
      showReplies: true,
      forumUrl: "",
    },
  },
  poll: {
    id: "poll",
    name: "投票调查",
    description: "快速投票组件",
    icon: BarChart2,
    category: "social",
    defaultSettings: {
      question: "您更喜欢哪种主题风格？",
      options: ["简约风格", "科技风格", "复古风格", "现代风格"],
      allowMultiple: false,
      showResults: true,
    },
  },
  guestbook: {
    id: "guestbook",
    name: "留言板",
    description: "访客留言展示",
    icon: PenTool,
    category: "social",
    defaultSettings: {
      title: "留言板",
      limit: 10,
      showTime: true,
      allowSubmit: true,
    },
  },
  searchBox: {
    id: "searchBox",
    name: "搜索框",
    description: "带建议补全的搜索组件",
    icon: Search,
    category: "tools",
    defaultSettings: {
      placeholder: "搜索文章...",
      showSuggestions: true,
      searchType: "articles",
    },
  },
  qrCode: {
    id: "qrCode",
    name: "二维码",
    description: "生成页面二维码方便移动端访问",
    icon: QrCode,
    category: "tools",
    defaultSettings: {
      title: "扫码关注",
      content: "",
      size: 150,
      showTip: true,
    },
  },
  darkMode: {
    id: "darkMode",
    name: "深色模式",
    description: "主题切换开关",
    icon: Moon,
    category: "tools",
    defaultSettings: {
      showLabel: true,
      position: "sidebar",
    },
  },
  fontSize: {
    id: "fontSize",
    name: "字体大小",
    description: "调整页面阅读字体大小",
    icon: Type,
    category: "tools",
    defaultSettings: {
      title: "字体大小",
      minSize: 14,
      maxSize: 22,
      defaultSize: 16,
    },
  },
  translate: {
    id: "translate",
    name: "语言翻译",
    description: "页面语言切换组件",
    icon: Languages,
    category: "tools",
    defaultSettings: {
      title: "切换语言",
      languages: ["zh", "en", "ja"],
      showLabels: true,
    },
  },
  miniCalendar: {
    id: "miniCalendar",
    name: "日历",
    description: "带文章标记的日历组件",
    icon: Calendar,
    category: "info",
    defaultSettings: {
      title: "文章日历",
      showArticles: true,
      highlightToday: true,
    },
  },
  statistics: {
    id: "statistics",
    name: "站点统计",
    description: "展示博客统计数据",
    icon: Hash,
    category: "info",
    defaultSettings: {
      title: "博客统计",
      stats: ["articles", "comments", "views", "users"],
    },
  },
  rssFeed: {
    id: "rssFeed",
    name: "RSS订阅",
    description: "RSS订阅源展示",
    icon: Rss,
    category: "info",
    defaultSettings: {
      title: "RSS订阅",
      feedUrl: "",
      limit: 10,
      showDate: true,
    },
  },
  siteLinks: {
    id: "siteLinks",
    name: "站点地图",
    description: "网站页面结构概览",
    icon: ExternalLink,
    category: "info",
    defaultSettings: {
      title: "站点地图",
      links: [],
      columns: 1,
    },
  },
  shoppingCart: {
    id: "shoppingCart",
    name: "购物车",
    description: "迷你购物车预览",
    icon: ShoppingCart,
    category: "ecommerce",
    defaultSettings: {
      title: "我的购物车",
      showItems: 3,
      showTotal: true,
    },
  },
  productShowcase: {
    id: "productShowcase",
    name: "商品展示",
    description: "精选商品展示卡片",
    icon: Package,
    category: "ecommerce",
    defaultSettings: {
      title: "热门商品",
      limit: 4,
      showPrice: true,
      showRating: true,
      layout: "grid",
    },
  },
  hotProducts: {
    id: "hotProducts",
    name: "热销排行",
    description: "销售排行榜",
    icon: TrendUp,
    category: "ecommerce",
    defaultSettings: {
      title: "热销排行",
      limit: 10,
      period: "month",
      showRank: true,
    },
  },
  recentOrders: {
    id: "recentOrders",
    name: "最新订单",
    description: "最新订单动态",
    icon: Receipt,
    category: "ecommerce",
    defaultSettings: {
      title: "最新订单",
      limit: 5,
      showAmount: true,
      anonymize: true,
    },
  },
};

export const WIDGET_CATEGORIES = {
  navigation: {
    name: "导航/目录",
    widgets: ["category", "pageLinks", "toc", "tags", "searchBox"] as WidgetId[],
  },
  content: {
    name: "内容展示",
    widgets: ["blogger", "popular", "newArticles", "relatedArticles", "featuredPosts", "randomPosts", "gallery"] as WidgetId[],
  },
  subscription: {
    name: "订阅/关注",
    widgets: ["newsletter", "socialFollow", "socialFeed"] as WidgetId[],
  },
  marketing: {
    name: "营销/转化",
    widgets: ["ad", "countdown", "ctaButtons", "promoProducts", "coupons", "downloadZone"] as WidgetId[],
  },
  social: {
    name: "互动/社区",
    widgets: ["recentComments", "communityPosts", "poll", "guestbook"] as WidgetId[],
  },
  tools: {
    name: "工具/实用",
    widgets: ["weather", "darkMode", "fontSize", "translate", "qrCode"] as WidgetId[],
  },
  info: {
    name: "信息展示",
    widgets: ["miniCalendar", "statistics", "rssFeed", "siteLinks"] as WidgetId[],
  },
  ecommerce: {
    name: "电商相关",
    widgets: ["shoppingCart", "productShowcase", "hotProducts", "recentOrders"] as WidgetId[],
  },
};

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  home: [
    { id: "blogger", enabled: true, order: 0, settings: {} },
    { id: "searchBox", enabled: true, order: 1, settings: {} },
    { id: "category", enabled: true, order: 2, settings: {} },
    { id: "newArticles", enabled: true, order: 3, settings: {} },
    { id: "popular", enabled: true, order: 4, settings: { limit: 5 } },
    { id: "tags", enabled: true, order: 5, settings: {} },
    { id: "newsletter", enabled: true, order: 6, settings: {} },
    { id: "socialFollow", enabled: true, order: 7, settings: {} },
    { id: "recentComments", enabled: false, order: 8, settings: {} },
    { id: "ad", enabled: false, order: 9, settings: {} },
    { id: "countdown", enabled: false, order: 10, settings: {} },
    { id: "darkMode", enabled: false, order: 11, settings: {} },
    { id: "qrCode", enabled: false, order: 12, settings: {} },
    { id: "weather", enabled: false, order: 13, settings: {} },
    { id: "statistics", enabled: false, order: 14, settings: {} },
  ],
  articles: [
    { id: "searchBox", enabled: true, order: 0, settings: {} },
    { id: "category", enabled: true, order: 1, settings: {} },
    { id: "popular", enabled: true, order: 2, settings: { limit: 5 } },
    { id: "tags", enabled: true, order: 3, settings: {} },
    { id: "newsletter", enabled: true, order: 4, settings: {} },
    { id: "socialFollow", enabled: true, order: 5, settings: {} },
    { id: "recentComments", enabled: false, order: 6, settings: {} },
    { id: "ad", enabled: false, order: 7, settings: {} },
  ],
  article_detail: [
    { id: "toc", enabled: true, order: 0, settings: { title: "文章目录" } },
    { id: "blogger", enabled: true, order: 1, settings: {} },
    { id: "relatedArticles", enabled: true, order: 2, settings: {} },
    { id: "tags", enabled: true, order: 3, settings: {} },
    { id: "newsletter", enabled: true, order: 4, settings: {} },
    { id: "recentComments", enabled: true, order: 5, settings: {} },
    { id: "ad", enabled: false, order: 6, settings: {} },
    { id: "ctaButtons", enabled: false, order: 7, settings: {} },
    { id: "downloadZone", enabled: false, order: 8, settings: {} },
  ],
  shop: [
    { id: "searchBox", enabled: true, order: 0, settings: {} },
    { id: "shoppingCart", enabled: true, order: 1, settings: {} },
    { id: "hotProducts", enabled: true, order: 2, settings: {} },
    { id: "coupons", enabled: true, order: 3, settings: {} },
    { id: "productShowcase", enabled: true, order: 4, settings: {} },
    { id: "recentOrders", enabled: false, order: 5, settings: {} },
    { id: "newsletter", enabled: true, order: 6, settings: {} },
    { id: "socialFollow", enabled: true, order: 7, settings: {} },
  ],
  category: [
    { id: "searchBox", enabled: true, order: 0, settings: {} },
    { id: "category", enabled: true, order: 1, settings: {} },
    { id: "featuredPosts", enabled: true, order: 2, settings: {} },
    { id: "popular", enabled: true, order: 3, settings: { limit: 5 } },
    { id: "tags", enabled: true, order: 4, settings: {} },
    { id: "newsletter", enabled: true, order: 5, settings: {} },
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

export function getWidgetsByCategory(category: keyof typeof WIDGET_CATEGORIES): WidgetId[] {
  return WIDGET_CATEGORIES[category]?.widgets || [];
}

export function getWidgetInfo(widgetId: WidgetId): WidgetDefinition | undefined {
  return AVAILABLE_WIDGETS[widgetId];
}
