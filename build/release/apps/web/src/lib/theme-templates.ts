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
    id: "elegant-two-column",
    name: "优雅双栏",
    slug: "elegant-two-column",
    description: "现代化的双栏布局，适合内容丰富的博客",
    features: ["双栏布局", "特色轮播", "分类展示", "标签云", "友情链接"],
    category: "modern",
    isDefault: true,
  },
  {
    id: "chinese-two-column",
    name: "中式双栏",
    slug: "chinese-two-column",
    description: "融合中国传统美学元素的双栏布局主题",
    features: ["中国风设计", "古典配色", "双栏布局", "13 个侧边栏组件", "5 个广告位", "SEO 优化"],
    category: "classic",
  },
  {
    id: "minimal",
    name: "极简阅读",
    slug: "minimal",
    description: "纯白极简设计，专注阅读体验，适合文字类博客",
    features: ["极简布局", "专注阅读", "快速加载", "响应式设计"],
    category: "minimal",
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
