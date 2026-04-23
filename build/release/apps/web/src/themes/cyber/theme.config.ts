import { ThemeConfig } from '../types';

/**
 * Cyber (现代科技) 主题配置
 */
export const cyberTheme: ThemeConfig = {
  id: 'cyber',
  name: 'Cyber',
  description: '现代科技风格，适合技术、数码类博客',
  version: '2.0.0',
  author: 'Blog Platform',
  thumbnail: '/themes/cyber/preview.png',
  isDefault: false,
  regions: ['header', 'footer', 'sidebar', 'main', 'article'],
  settings: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    fontFamily: "'Inter', sans-serif",
    borderRadius: 'lg',
    shadowStyle: 'lg',
    layoutWidth: 'wide',
    animations: true,
    custom: {
      showDecorativeElements: false,
      useSerifFonts: false,
      neonGlow: true,
      gridBackground: true,
    },
  },
  colorSchemes: [
    {
      name: 'Dark',
      id: 'dark',
      isDark: true,
      cssVariables: {
        '--theme-primary': '#0ea5e9',
        '--theme-primary-light': '#38bdf8',
        '--theme-primary-dark': '#0284c7',
        '--theme-secondary': '#8b5cf6',
        '--theme-accent': '#06b6d4',
        '--theme-accent-hover': '#22d3ee',
        '--theme-bg': '#0f172a',
        '--theme-bg-alt': '#1e293b',
        '--theme-bg-card': '#1e293b',
        '--theme-surface': '#334155',
        '--theme-text': '#f1f5f9',
        '--theme-text-muted': 'rgba(241, 245, 249, 0.6)',
        '--theme-border': '#334155',
        '--theme-radius-card': '1rem',
        '--theme-radius-button': '0.75rem',
        '--theme-nav-bg': 'rgba(15, 23, 42, 0.85)',
        '--theme-hero-gradient': 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(6, 182, 212, 0.08) 100%)',
        '--theme-card-shadow': '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(14, 165, 233, 0.1)',
        '--theme-card-shadow-hover': '0 8px 30px rgba(14, 165, 233, 0.2), 0 0 0 1px rgba(14, 165, 233, 0.3)',
        '--theme-glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        '--theme-gradient-accent': 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
      },
    },
  ],
  components: [
    'Header',
    'Footer',
    'Sidebar',
    'ArticleCard',
    'HeroSlider',
  ],
};

export default cyberTheme;
