/**
 * CDN 配置和工具函数
 */

export interface CDNConfig {
  enabled: boolean;
  provider: string;
  baseUrl: string;
  imageUrl?: string;
  cssUrl?: string;
  jsUrl?: string;
  preconnect: boolean;
  imageOptimization: boolean;
  webpEnabled: boolean;
}

/**
 * 获取 CDN 配置
 */
export function getCDNConfig(): CDNConfig {
  // 从环境变量读取配置
  return {
    enabled: process.env.NEXT_PUBLIC_CDN_ENABLED === 'true',
    provider: process.env.NEXT_PUBLIC_CDN_PROVIDER || 'custom',
    baseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL || '',
    imageUrl: process.env.NEXT_PUBLIC_CDN_IMAGE_URL || '',
    cssUrl: process.env.NEXT_PUBLIC_CDN_CSS_URL || '',
    jsUrl: process.env.NEXT_PUBLIC_CDN_JS_URL || '',
    preconnect: process.env.NEXT_PUBLIC_CDN_PRECONNECT !== 'false',
    imageOptimization: process.env.NEXT_PUBLIC_CDN_IMAGE_OPTIMIZATION === 'true',
    webpEnabled: process.env.NEXT_PUBLIC_CDN_WEBP_ENABLED === 'true',
  };
}

/**
 * 检查 CDN 是否启用
 */
export function isCDNEnabled(): boolean {
  return getCDNConfig().enabled && !!getCDNConfig().baseUrl;
}

/**
 * 获取 CDN 基础 URL
 */
export function getCDNBaseUrl(): string {
  const config = getCDNConfig();
  return config.enabled && config.baseUrl ? config.baseUrl.replace(/\/$/, '') : '';
}

/**
 * 为资源 URL 添加 CDN 前缀
 */
export function withCDN(url: string | undefined | null, type?: 'image' | 'css' | 'js'): string {
  if (!url) return '';

  // 如果已经是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url;
  }

  const config = getCDNConfig();
  if (!config.enabled) {
    return url;
  }

  // 确保 URL 以 / 开头
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

  // 根据资源类型选择对应的 CDN 域名
  let cdnBase = config.baseUrl;
  if (type === 'image' && config.imageUrl) {
    cdnBase = config.imageUrl;
  } else if (type === 'css' && config.cssUrl) {
    cdnBase = config.cssUrl;
  } else if (type === 'js' && config.jsUrl) {
    cdnBase = config.jsUrl;
  }

  if (!cdnBase) {
    return url;
  }

  return `${cdnBase.replace(/\/$/, '')}${normalizedUrl}`;
}

/**
 * 为图片 URL 添加 CDN 前缀
 */
export function withImageCDN(url: string | undefined | null): string {
  return withCDN(url, 'image');
}

/**
 * 为 CSS URL 添加 CDN 前缀
 */
export function withCSSCDN(url: string | undefined | null): string {
  return withCDN(url, 'css');
}

/**
 * 为 JS URL 添加 CDN 前缀
 */
export function withJSCDN(url: string | undefined | null): string {
  return withCDN(url, 'js');
}

/**
 * 获取图片优化参数（根据 CDN 服务商）
 */
export function getImageOptimizationParams(
  width?: number,
  height?: number,
  quality?: number,
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
): string {
  const config = getCDNConfig();

  if (!config.enabled || !config.imageOptimization) {
    return '';
  }

  const params: string[] = [];

  switch (config.provider) {
    case 'aliyun':
      // 阿里云 CDN 图片处理参数
      if (width) params.push(`w_${width}`);
      if (height) params.push(`h_${height}`);
      if (quality) params.push(`q_${quality}`);
      if (format && format !== 'auto') params.push(`f_${format}`);
      return params.length > 0 ? `?x-oss-process=image/resize,${params.join(',')}` : '';

    case 'qcloud':
      // 腾讯云 CDN 图片处理参数
      if (width) params.push(`width=${width}`);
      if (height) params.push(`height=${height}`);
      if (quality) params.push(`quality=${quality}`);
      if (format && format !== 'auto') params.push(`format=${format}`);
      return params.length > 0 ? `?${params.join('&')}` : '';

    case 'cloudflare':
      // Cloudflare Images
      if (width) params.push(`width=${width}`);
      if (height) params.push(`height=${height}`);
      if (quality) params.push(`quality=${quality}`);
      if (format && format !== 'auto') params.push(`format=${format}`);
      return params.length > 0 ? `/cdn-cgi/image/${params.join(',')}` : '';

    default:
      return '';
  }
}

/**
 * 生成优化后的图片 URL
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  }
): string {
  if (!url) return '';

  const cdnUrl = withImageCDN(url);

  // 如果不是 CDN URL，直接返回原 URL
  if (cdnUrl === url) {
    return url;
  }

  const config = getCDNConfig();

  // 如果启用了 WebP 自动转换且未指定格式
  if (config.webpEnabled && (!options?.format || options.format === 'auto')) {
    options = { ...options, format: 'webp' };
  }

  const params = getImageOptimizationParams(
    options?.width,
    options?.height,
    options?.quality,
    options?.format
  );

  if (!params) {
    return cdnUrl;
  }

  // 根据服务商处理参数拼接
  if (config.provider === 'cloudflare' && params.startsWith('/cdn-cgi')) {
    // Cloudflare 参数需要插入到路径中
    const urlObj = new URL(cdnUrl);
    return `${urlObj.origin}${params}${urlObj.pathname}`;
  }

  return `${cdnUrl}${params}`;
}

/**
 * 生成 Preconnect Link HTML
 */
export function generatePreconnectLinks(): string {
  const config = getCDNConfig();

  if (!config.enabled || !config.preconnect) {
    return '';
  }

  const domains = new Set<string>();

  [config.baseUrl, config.imageUrl, config.cssUrl, config.jsUrl].forEach((url) => {
    if (url) {
      try {
        const urlObj = new URL(url);
        domains.add(urlObj.origin);
      } catch {
        // 忽略无效 URL
      }
    }
  });

  return Array.from(domains)
    .map((domain) => `<link rel="preconnect" href="${domain}" crossorigin>`)
    .join('\n');
}

/**
 * 获取 DNS Prefetch Links
 */
export function getDNSPrefetchUrls(): string[] {
  const config = getCDNConfig();

  if (!config.enabled) {
    return [];
  }

  const urls = new Set<string>();

  [config.baseUrl, config.imageUrl, config.cssUrl, config.jsUrl].forEach((url) => {
    if (url) {
      try {
        const urlObj = new URL(url);
        urls.add(urlObj.origin);
      } catch {
        // 忽略无效 URL
      }
    }
  });

  return Array.from(urls);
}
