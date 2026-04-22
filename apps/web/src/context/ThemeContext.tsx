"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  config: any;
  updateConfig: (newConfig: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载主题配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/theme-config');
        const data = await res.json();
        
        if (data.success && data.config) {
          setConfig(data.config);
        }
      } catch (err) {
        console.error('Failed to load theme config:', err);
        setError('Failed to load theme configuration');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // 更新配置
  const updateConfig = async (newConfig: any) => {
    try {
      setError(null);
      const updatedConfig = { ...config, ...newConfig };
      
      const res = await fetch('/api/theme-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: updatedConfig }),
      });

      const data = await res.json();
      
      if (data.success) {
        setConfig(updatedConfig);
      } else {
        setError('Failed to save configuration');
      }
    } catch (err) {
      console.error('Failed to update config:', err);
      setError('Failed to update configuration');
    }
  };

  return (
    <ThemeContext.Provider value={{ config, updateConfig, isLoading, error }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
