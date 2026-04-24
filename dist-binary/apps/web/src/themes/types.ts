/**
 * 主题配置接口定义
 */
export interface ThemeConfig {
  /** 主题唯一标识 */
  id: string;
  
  /** 主题名称 */
  name: string;
  
  /** 主题描述 */
  description: string;
  
  /** 主题版本 */
  version: string;
  
  /** 主题作者 */
  author: string;
  
  /** 主题预览图 */
  thumbnail: string;
  
  /** 是否是默认主题 */
  isDefault?: boolean;
  
  /** 主题支持的区域 */
  regions: Array<'header' | 'footer' | 'sidebar' | 'main' | 'article'>;
  
  /** 主题配置项 */
  settings: ThemeSettings;
  
  /** 主题颜色方案 */
  colorSchemes: ColorScheme[];
  
  /** 依赖的组件 */
  components: string[];
}

/**
 * 主题设置接口
 */
export interface ThemeSettings {
  /** 主色调 */
  primaryColor?: string;
  
  /** 次色调 */
  secondaryColor?: string;
  
  /** 强调色 */
  accentColor?: string;
  
  /** 背景色 */
  backgroundColor?: string;
  
  /** 文字颜色 */
  textColor?: string;
  
  /** 字体族 */
  fontFamily?: string;
  
  /** 圆角大小 */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /** 阴影风格 */
  shadowStyle?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /** 布局宽度 */
  layoutWidth?: 'narrow' | 'normal' | 'wide' | 'full';
  
  /** 动画效果 */
  animations?: boolean;
  
  /** 自定义配置项 */
  custom?: Record<string, any>;
}

/**
 * 颜色方案接口
 */
export interface ColorScheme {
  /** 方案名称 */
  name: string;
  
  /** 方案标识 */
  id: string;
  
  /** 是否是暗色模式 */
  isDark: boolean;
  
  /** CSS 变量定义 */
  cssVariables: Record<string, string>;
}
