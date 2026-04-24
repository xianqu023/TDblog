'use client';

import { useEffect, useState, useCallback } from 'react';
import { ThemeConfig, ColorScheme } from './types';

/**
 * 主题加载器 - 负责动态加载主题配置和样式
 */
export class ThemeLoader {
  private static cache: Map<string, ThemeConfig> = new Map();

  /**
   * 动态加载主题配置
   */
  static async loadTheme(themeId: string): Promise<ThemeConfig | null> {
    // 检查缓存
    if (this.cache.has(themeId)) {
      return this.cache.get(themeId)!;
    }

    try {
      // 动态导入主题配置
      const module = await import(`@/themes/${themeId}/theme.config`);
      const themeConfig = module.default || module[`${themeId}Theme`];
      
      if (!themeConfig) {
        console.error(`Theme "${themeId}" configuration not found`);
        return null;
      }

      // 缓存主题配置
      this.cache.set(themeId, themeConfig);
      
      return themeConfig;
    } catch (error) {
      console.error(`Failed to load theme "${themeId}":`, error);
      return null;
    }
  }

  /**
   * 加载主题样式
   */
  static async loadThemeStyles(themeId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已加载
      const existingStyle = document.getElementById(`theme-style-${themeId}`);
      if (existingStyle) {
        resolve();
        return;
      }

      // 创建 link 标签
      const link = document.createElement('link');
      link.id = `theme-style-${themeId}`;
      link.rel = 'stylesheet';
      link.href = `/themes/${themeId}/styles/main.css`;
      
      link.onload = () => {
        resolve();
      };
      
      link.onerror = (error) => {
        console.error(`Failed to load theme styles for "${themeId}":`, error);
        reject(error);
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 应用主题颜色方案
   */
  static applyColorScheme(theme: ThemeConfig, colorScheme: ColorScheme): void {
    const root = document.documentElement;
    
    // 设置主题标识
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-color-scheme', colorScheme.id);
    
    // 应用 CSS 变量
    Object.entries(colorScheme.cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // 应用主题设置
    if (theme.settings) {
      if (theme.settings.borderRadius) {
        root.style.setProperty('--theme-radius-base', this.getBorderRadiusValue(theme.settings.borderRadius));
      }
      if (theme.settings.shadowStyle) {
        root.style.setProperty('--theme-shadow-base', this.getShadowValue(theme.settings.shadowStyle));
      }
    }
  }

  /**
   * 获取圆角值
   */
  private static getBorderRadiusValue(size: string): string {
    const values: Record<string, string> = {
      'none': '0',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
      'full': '9999px',
    };
    return values[size] || values['md'];
  }

  /**
   * 获取阴影值
   */
  private static getShadowValue(size: string): string {
    const values: Record<string, string> = {
      'none': 'none',
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    };
    return values[size] || values['md'];
  }

  /**
   * 清除主题样式
   */
  static clearThemeStyles(themeId: string): void {
    const existingStyle = document.getElementById(`theme-style-${themeId}`);
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  /**
   * 预加载主题资源
   */
  static async preloadTheme(themeId: string): Promise<void> {
    try {
      // 预加载主题配置
      await this.loadTheme(themeId);
      
      // 预加载主题图片资源
      const theme = this.cache.get(themeId);
      if (theme?.thumbnail) {
        const img = new Image();
        img.src = theme.thumbnail;
      }
    } catch (error) {
      console.error(`Failed to preload theme "${themeId}":`, error);
    }
  }
}

/**
 * React Hook - 使用主题加载器
 */
export function useThemeLoader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTheme = useCallback(async (themeId: string, colorSchemeId?: string) => {
    setLoading(true);
    setError(null);

    try {
      // 加载主题配置
      const theme = await ThemeLoader.loadTheme(themeId);
      
      if (!theme) {
        throw new Error(`Theme "${themeId}" not found`);
      }

      // 加载主题样式
      await ThemeLoader.loadThemeStyles(themeId);

      // 应用颜色方案
      if (colorSchemeId) {
        const colorScheme = theme.colorSchemes.find(cs => cs.id === colorSchemeId);
        if (colorScheme) {
          ThemeLoader.applyColorScheme(theme, colorScheme);
        }
      } else if (theme.colorSchemes.length > 0) {
        // 使用默认颜色方案
        ThemeLoader.applyColorScheme(theme, theme.colorSchemes[0]);
      }

      return theme;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loadTheme,
    loading,
    error,
  };
}

export default ThemeLoader;
