'use client';

import { useEffect, useState } from 'react';
import { ThemeLoader, themeRegistry } from '@/themes';
import { ThemeConfig } from '@/themes/types';

interface ThemeInitializerProps {
  children: React.ReactNode;
  defaultThemeId?: string;
}

/**
 * 主题初始化组件
 * 在应用启动时加载并应用主题
 */
export default function ThemeInitializer({ 
  children, 
  defaultThemeId = 'inkwell' 
}: ThemeInitializerProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initTheme() {
      try {
        // 从 localStorage 获取用户选择的主题
        const savedThemeId = localStorage.getItem('selected-theme') || defaultThemeId;
        
        // 加载主题配置
        const loadedTheme = await ThemeLoader.loadTheme(savedThemeId);
        
        if (loadedTheme) {
          setTheme(loadedTheme);
          
          // 加载主题样式
          await ThemeLoader.loadThemeStyles(savedThemeId);
          
          // 获取颜色方案（从 localStorage 或默认）
          const savedScheme = localStorage.getItem('color-scheme') || 'light';
          const colorScheme = loadedTheme.colorSchemes.find(cs => cs.id === savedScheme) 
            || loadedTheme.colorSchemes[0];
          
          // 应用颜色方案
          if (colorScheme) {
            ThemeLoader.applyColorScheme(loadedTheme, colorScheme);
          }
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error);
        
        // 回退到默认主题
        const defaultTheme = themeRegistry.getDefaultTheme();
        if (defaultTheme) {
          setTheme(defaultTheme);
        }
      } finally {
        setIsLoaded(true);
      }
    }

    initTheme();
  }, [defaultThemeId]);

  // 主题加载期间显示占位符
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme-initialized="true">
      {children}
    </div>
  );
}
