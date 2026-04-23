import { ThemeConfig } from '../types';

/**
 * 中式双栏主题配置
 * 融合中国传统美学，中国红/藏青/墨黑配色，留白对称布局
 */
export const chineseTwoColumnTheme: ThemeConfig = {
  id: 'chinese-two-column',
  name: '中式风格',
  description: '融合中国传统美学，中国红/藏青/墨黑配色，留白对称布局',
  version: '1.0.0',
  author: 'Blog Platform',
  thumbnail: '/themes/chinese-two-column/preview.png',
  isDefault: true,
  regions: ['header', 'footer', 'sidebar', 'main', 'article'],
  settings: {
    primaryColor: '#c41e3a', // 中国红
    secondaryColor: '#1e3a5f', // 藏青
    accentColor: '#b87333', // 铜色
    backgroundColor: '#f5f0e8', // 米白
    textColor: '#1a1a1a', // 墨黑
    fontFamily: "'Noto Serif SC', 'Noto Sans SC', serif",
    borderRadius: 'md',
    shadowStyle: 'md',
    layoutWidth: 'wide',
    animations: true,
    custom: {
      showDecorativeElements: true,
      useSerifFonts: true,
      chineseStyle: true,
      showRedAccents: true,
    },
  },
  colorSchemes: [
    {
      name: 'Light',
      id: 'light',
      isDark: false,
      cssVariables: {
        '--theme-primary': '#c41e3a',
        '--theme-primary-light': '#e8475f',
        '--theme-primary-dark': '#9b1b30',
        '--theme-secondary': '#1e3a5f',
        '--theme-accent': '#b87333',
        '--theme-accent-hover': '#d49155',
        '--theme-bg': '#f5f0e8',
        '--theme-bg-alt': '#e8e0d0',
        '--theme-bg-card': '#ffffff',
        '--theme-surface': '#ffffff',
        '--theme-text': '#1a1a1a',
        '--theme-text-muted': 'rgba(26, 26, 26, 0.7)',
        '--theme-border': '#e5e5e5',
        '--theme-nav-bg': '#ffffff',
        '--theme-card-shadow': '0 2px 8px rgba(0, 0, 0, 0.08)',
        '--theme-card-shadow-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
    {
      name: 'Dark',
      id: 'dark',
      isDark: true,
      cssVariables: {
        '--theme-primary': '#e8475f',
        '--theme-primary-light': '#f06070',
        '--theme-primary-dark': '#c41e3a',
        '--theme-secondary': '#2d4a6f',
        '--theme-accent': '#d49155',
        '--theme-accent-hover': '#e0a060',
        '--theme-bg': '#1a1a1a',
        '--theme-bg-alt': '#242424',
        '--theme-bg-card': '#2a2a2a',
        '--theme-surface': '#333333',
        '--theme-text': '#e5e5e5',
        '--theme-text-muted': 'rgba(229, 229, 229, 0.7)',
        '--theme-border': '#3a3a3a',
        '--theme-nav-bg': '#242424',
        '--theme-card-shadow': '0 2px 8px rgba(0, 0, 0, 0.3)',
        '--theme-card-shadow-hover': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  ],
  components: [
    'Header',
    'Footer',
    'Sidebar',
    'ArticleCard',
    'ArticleList',
    'TagCloud',
    'AuthorCard',
    'HotArticles',
    'CalendarArchive',
    'FriendLinks',
  ],
};

export default chineseTwoColumnTheme;
