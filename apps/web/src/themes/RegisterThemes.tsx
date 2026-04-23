'use client';

import { useEffect } from 'react';
import { themeRegistry } from './ThemeRegistry';
import { inkwellTheme, cyberTheme, chineseTwoColumnTheme } from './index';

/**
 * 主题注册组件
 * 在应用启动时注册所有可用主题
 */
export default function RegisterThemes() {
  useEffect(() => {
    // 注册所有主题
    themeRegistry.registerMany([inkwellTheme, cyberTheme, chineseTwoColumnTheme]);
    
    console.log('✅ 主题注册完成');
    console.log(`   - Inkwell`);
    console.log(`   - Cyber`);
    console.log(`   - Chinese Two-Column (中式双栏)`);
    console.log(`   共 ${themeRegistry.getThemeCount()} 个主题`);
  }, []);

  return null;
}
