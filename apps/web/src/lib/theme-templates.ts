/**
 * 主题模板定义
 * 定义所有可用的主题模板及其配置
 */

export interface ThemeTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  previewImage?: string;
  features: string[];
  category: "modern" | "classic" | "minimal" | "creative";
  isDefault?: boolean;
}

/**
 * 所有可用的主题模板
 */
export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: "default",
    name: "默认主题",
    slug: "default",
    description: "TDblog 默认主题，简洁实用的单栏布局",
    features: ["简洁布局", "响应式设计", "侧边栏组件", "广告位支持"],
    category: "minimal",
    isDefault: true,
  },
  {
    id: "elegant-two-column",
    name: "优雅双栏",
    slug: "elegant-two-column",
    description: "现代化的双栏布局，适合内容丰富的博客",
    features: ["双栏布局", "特色轮播", "分类展示", "标签云", "友情链接"],
    category: "modern",
  },
  {
    id: "chinese-two-column",
    name: "中式双栏",
    slug: "chinese-two-column",
    description: "融合中国传统美学元素的双栏布局主题",
    features: ["中国风设计", "古典配色", "双栏布局", "13 个侧边栏组件", "5 个广告位", "SEO 优化"],
    category: "classic",
  },
];

/**
 * 主题分类
 */
export const THEME_CATEGORIES = [
  { id: "all", name: "全部", count: THEME_TEMPLATES.length },
  { id: "modern", name: "现代风格", count: THEME_TEMPLATES.filter(t => t.category === "modern").length },
  { id: "classic", name: "经典风格", count: THEME_TEMPLATES.filter(t => t.category === "classic").length },
  { id: "minimal", name: "极简风格", count: THEME_TEMPLATES.filter(t => t.category === "minimal").length },
  { id: "creative", name: "创意风格", count: THEME_TEMPLATES.filter(t => t.category === "creative").length },
];

/**
 * 获取主题模板详情
 */
export function getThemeTemplate(slug: string): ThemeTemplate | undefined {
  return THEME_TEMPLATES.find(t => t.slug === slug);
}

/**
 * 获取所有主题模板
 */
export function getAllThemeTemplates(): ThemeTemplate[] {
  return THEME_TEMPLATES;
}

/**
 * 获取默认主题模板
 */
export function getDefaultThemeTemplate(): ThemeTemplate {
  return THEME_TEMPLATES.find(t => t.isDefault) || THEME_TEMPLATES[0];
}
