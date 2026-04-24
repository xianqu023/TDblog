/**
 * 主题模块统一导出
 */

// 类型定义
export * from './types';

// 主题加载器
export { ThemeLoader, useThemeLoader } from './ThemeLoader';

// 主题注册表
export { themeRegistry } from './ThemeRegistry';

// 主题配置
export { inkwellTheme } from './inkwell/theme.config';
export { cyberTheme } from './cyber/theme.config';
export { chineseTwoColumnTheme } from './chinese-two-column/theme.config';

// TODO: 添加更多主题
// export { minimalTheme } from './minimal/theme.config';
// export { elegantTheme } from './elegant/theme.config';
