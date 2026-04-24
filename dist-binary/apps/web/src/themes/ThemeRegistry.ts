import { ThemeConfig } from './types';

/**
 * 主题注册表 - 管理所有可用主题
 */
class ThemeRegistry {
  private static instance: ThemeRegistry;
  private themes: Map<string, ThemeConfig> = new Map();
  private defaultThemeId: string | null = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeRegistry {
    if (!ThemeRegistry.instance) {
      ThemeRegistry.instance = new ThemeRegistry();
    }
    return ThemeRegistry.instance;
  }

  /**
   * 注册主题
   */
  register(theme: ThemeConfig): void {
    if (this.themes.has(theme.id)) {
      console.warn(`Theme "${theme.id}" is already registered`);
      return;
    }

    this.themes.set(theme.id, theme);

    // 设置默认主题
    if (theme.isDefault || !this.defaultThemeId) {
      this.defaultThemeId = theme.id;
    }
  }

  /**
   * 批量注册主题
   */
  registerMany(themes: ThemeConfig[]): void {
    themes.forEach(theme => this.register(theme));
  }

  /**
   * 获取主题配置
   */
  getTheme(themeId: string): ThemeConfig | undefined {
    return this.themes.get(themeId);
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  /**
   * 获取默认主题
   */
  getDefaultTheme(): ThemeConfig | undefined {
    if (this.defaultThemeId) {
      return this.themes.get(this.defaultThemeId);
    }
    // 如果没有设置默认主题，返回第一个
    return this.themes.values().next().value;
  }

  /**
   * 检查主题是否存在
   */
  hasTheme(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  /**
   * 获取主题数量
   */
  getThemeCount(): number {
    return this.themes.size;
  }

  /**
   * 注销主题
   */
  unregister(themeId: string): boolean {
    if (this.themes.has(themeId)) {
      this.themes.delete(themeId);
      
      // 如果注销的是默认主题，重新设置默认主题
      if (this.defaultThemeId === themeId) {
        const firstTheme = this.themes.values().next().value;
        this.defaultThemeId = firstTheme?.id || null;
      }
      
      return true;
    }
    return false;
  }

  /**
   * 设置默认主题
   */
  setDefaultTheme(themeId: string): boolean {
    if (this.themes.has(themeId)) {
      this.defaultThemeId = themeId;
      return true;
    }
    return false;
  }

  /**
   * 获取默认主题 ID
   */
  getDefaultThemeId(): string | null {
    return this.defaultThemeId;
  }

  /**
   * 清空所有主题
   */
  clear(): void {
    this.themes.clear();
    this.defaultThemeId = null;
  }

  /**
   * 导出主题列表（用于 API）
   */
  exportThemes(): Array<{
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    thumbnail: string;
    isDefault: boolean;
    isActivated: boolean;
  }> {
    // 这里需要从数据库获取激活状态
    const activatedThemes = new Set<string>(); // TODO: 从数据库加载
    
    return this.getAllThemes().map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      version: theme.version,
      author: theme.author,
      thumbnail: theme.thumbnail,
      isDefault: theme.id === this.defaultThemeId,
      isActivated: activatedThemes.has(theme.id),
    }));
  }
}

// 导出单例
export const themeRegistry = ThemeRegistry.getInstance();

export default themeRegistry;
