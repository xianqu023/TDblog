/**
 * Safari 浏览器检测工具
 * 提供 Safari 特定的功能检测和兼容性处理
 */

export interface SafariFeatures {
  isSafari: boolean;
  isIOS: boolean;
  isMacOS: boolean;
  safariVersion: number | null;
  supportsSticky: boolean;
  supportsIntersectionObserver: boolean;
}

/**
 * 检测 Safari 浏览器
 */
export function detectSafari(): SafariFeatures {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor || "";
  
  // Safari 检测（排除 Chrome、Android 等）
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  
  // iOS 检测
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                (isSafari && /Macintosh/i.test(userAgent) && 'ontouchend' in document);
  
  // macOS 检测
  const isMacOS = /Macintosh/i.test(userAgent) && !isIOS;
  
  // Safari 版本检测
  let safariVersion: number | null = null;
  const versionMatch = userAgent.match(/Version\/(\d+)/i);
  if (versionMatch) {
    safariVersion = parseInt(versionMatch[1], 10);
  }
  
  // Sticky 定位支持检测
  const supportsSticky = CSS.supports('position', 'sticky') || 
                         CSS.supports('position', '-webkit-sticky');
  
  // Intersection Observer 支持检测
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  
  return {
    isSafari,
    isIOS,
    isMacOS,
    safariVersion,
    supportsSticky,
    supportsIntersectionObserver,
  };
}

/**
 * Safari 浏览器优化配置
 */
export interface SafariOptimizationConfig {
  enableStickyFallback: boolean;
  enableTouchOptimizations: boolean;
  enableFontOptimizations: boolean;
  enableAnimationOptimizations: boolean;
}

/**
 * 获取 Safari 优化配置
 */
export function getSafariOptimizations(features: SafariFeatures): SafariOptimizationConfig {
  const config: SafariOptimizationConfig = {
    enableStickyFallback: features.isSafari && (!features.supportsSticky || (features.safariVersion !== null && features.safariVersion < 14)),
    enableTouchOptimizations: features.isIOS,
    enableFontOptimizations: features.isSafari,
    enableAnimationOptimizations: features.isSafari,
  };
  
  return config;
}

/**
 * 应用 Safari 特定的样式修复
 */
export function applySafariFixes(element: HTMLElement | null, features: SafariFeatures): void {
  if (!element || !features.isSafari) return;
  
  // Sticky 定位修复
  if (features.safariVersion !== null && features.safariVersion < 14) {
    element.style.position = '-webkit-sticky';
    element.style.position = 'sticky';
  }
  
  // 硬件加速修复
  if (features.safariVersion !== null && features.safariVersion < 15) {
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
  }
}

/**
 * 监听 Safari 浏览器特性变化
 */
export function onSafariFeatureChange(
  callback: (features: SafariFeatures) => void,
  interval = 1000
): () => void {
  let lastFeatures = detectSafari();
  
  const checkInterval = setInterval(() => {
    const currentFeatures = detectSafari();
    
    // 检测特性变化
    if (JSON.stringify(currentFeatures) !== JSON.stringify(lastFeatures)) {
      callback(currentFeatures);
      lastFeatures = currentFeatures;
    }
  }, interval);
  
  return () => clearInterval(checkInterval);
}

/**
 * Safari 专用的滚动优化
 */
export function optimizeScrollForSafari(features: SafariFeatures): void {
  if (!features.isSafari) return;
  
  // 平滑滚动优化
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // 滚动性能优化
  const scrollableElements = document.querySelectorAll('[style*="overflow"]');
  scrollableElements.forEach((el) => {
    (el as HTMLElement).style.setProperty('-webkit-overflow-scrolling', 'touch');
  });
}

/**
 * Safari 专用的动画优化
 */
export function optimizeAnimationsForSafari(features: SafariFeatures): void {
  if (!features.isSafari) return;
  
  // 添加 GPU 加速类
  const animatedElements = document.querySelectorAll('.transition, .transform, .animate-*');
  animatedElements.forEach((el) => {
    (el as HTMLElement).style.transform = 'translateZ(0)';
    (el as HTMLElement).style.backfaceVisibility = 'hidden';
    (el as HTMLElement).style.perspective = '1000px';
  });
}

/**
 * 获取 Safari 版本特定的 CSS 类
 */
export function getSafariVersionClasses(features: SafariFeatures): string {
  const classes: string[] = [];
  
  if (features.isSafari) {
    classes.push('is-safari');
  }
  
  if (features.isIOS) {
    classes.push('is-ios');
  }
  
  if (features.isMacOS) {
    classes.push('is-macos');
  }
  
  if (features.safariVersion) {
    classes.push(`safari-${features.safariVersion}`);
  }
  
  if (!features.supportsSticky) {
    classes.push('no-sticky-support');
  }
  
  return classes.join(' ');
}
