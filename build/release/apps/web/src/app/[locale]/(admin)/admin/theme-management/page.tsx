"use client";

/**
 * 主题管理页面 - 简化版本
 */

import { useState, useEffect } from "react";
import {
  Palette,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function ThemeManagementPage() {
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    // 模拟主题数据
    const mockThemes: ThemeConfig[] = [
      { id: '1', name: '极简阅读', description: '简洁的阅读体验', enabled: true },
      { id: '2', name: '中式风格', description: '传统中国风', enabled: false },
      { id: '3', name: '优雅双栏', description: '经典双栏布局', enabled: false },
    ];
    
    setThemes(mockThemes);
    setActiveTheme(mockThemes[0]);
    setLoading(false);
  }, []);

  const handleToggleTheme = (theme: ThemeConfig) => {
    console.log('切换主题:', theme.name);
  };

  const handleSaveConfig = () => {
    console.log('保存配置');
  };

  const handleResetConfig = () => {
    console.log('重置配置');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">主题管理</h1>
        <p className="text-muted-foreground">管理和配置网站主题</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              activeTheme?.id === theme.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setActiveTheme(theme)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Palette className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
              {activeTheme?.id === theme.id && (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTheme(theme);
                }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {theme.enabled ? '禁用' : '启用'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveConfig();
                }}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetConfig();
                }}
                className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeTheme && (
        <div className="mt-8 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">主题配置：{activeTheme.name}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">主题描述</label>
              <p className="text-muted-foreground">{activeTheme.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                保存配置
              </button>
              <button
                onClick={handleResetConfig}
                className="px-6 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                重置配置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
