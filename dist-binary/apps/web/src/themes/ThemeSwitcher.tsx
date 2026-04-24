'use client';

import { useState, useEffect } from 'react';
import { ThemeLoader, themeRegistry } from '@/themes';
import { ThemeConfig } from '@/themes/types';
import { Palette } from 'lucide-react';

/**
 * 主题切换器组件
 * 允许用户在运行时切换主题和颜色方案
 */
export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [currentColorScheme, setCurrentColorScheme] = useState<string>('');

  useEffect(() => {
    // 加载所有主题
    const allThemes = themeRegistry.getAllThemes();
    setThemes(allThemes);

    // 获取当前主题
    const savedTheme = localStorage.getItem('selected-theme') || 'inkwell';
    setCurrentTheme(savedTheme);

    // 获取当前颜色方案
    const savedScheme = localStorage.getItem('color-scheme') || 'light';
    setCurrentColorScheme(savedScheme);
  }, []);

  const handleThemeChange = async (themeId: string) => {
    try {
      // 加载新主题
      const theme = await ThemeLoader.loadTheme(themeId);
      
      if (!theme) {
        throw new Error(`Theme "${themeId}" not found`);
      }

      // 加载主题样式
      await ThemeLoader.loadThemeStyles(themeId);

      // 应用默认颜色方案
      const colorScheme = theme.colorSchemes[0];
      if (colorScheme) {
        ThemeLoader.applyColorScheme(theme, colorScheme);
        localStorage.setItem('color-scheme', colorScheme.id);
        setCurrentColorScheme(colorScheme.id);
      }

      // 保存用户选择
      localStorage.setItem('selected-theme', themeId);
      setCurrentTheme(themeId);

      // 关闭面板
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  };

  const handleColorSchemeChange = async (schemeId: string) => {
    try {
      const theme = await ThemeLoader.loadTheme(currentTheme);
      
      if (!theme) {
        throw new Error('Current theme not loaded');
      }

      const colorScheme = theme.colorSchemes.find(cs => cs.id === schemeId);
      
      if (colorScheme) {
        ThemeLoader.applyColorScheme(theme, colorScheme);
        localStorage.setItem('color-scheme', schemeId);
        setCurrentColorScheme(schemeId);
      }
    } catch (error) {
      console.error('Failed to change color scheme:', error);
    }
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className="relative">
      {/* 切换按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* 主题选择面板 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Theme Settings
            </h3>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {/* 主题列表 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Theme
              </h4>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      currentTheme === theme.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {theme.thumbnail && (
                        <img
                          src={theme.thumbnail}
                          alt={theme.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {theme.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {theme.description}
                        </div>
                      </div>
                      {currentTheme === theme.id && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色方案 */}
            {currentThemeData && currentThemeData.colorSchemes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Color Scheme
                </h4>
                <div className="space-y-2">
                  {currentThemeData.colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => handleColorSchemeChange(scheme.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        currentColorScheme === scheme.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full border-2 ${
                            scheme.isDark ? 'bg-gray-900' : 'bg-gray-100'
                          } border-gray-300 dark:border-gray-600`}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {scheme.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {scheme.isDark ? 'Dark mode' : 'Light mode'}
                          </div>
                        </div>
                        {currentColorScheme === scheme.id && (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
