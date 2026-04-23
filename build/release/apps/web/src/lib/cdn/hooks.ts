'use client';

import { useMemo } from 'react';
import { withCDN, withImageCDN, getOptimizedImageUrl, getCDNConfig } from './index';

/**
 * 使用 CDN 的 Hook
 */
export function useCDN() {
  const config = useMemo(() => getCDNConfig(), []);

  return {
    config,
    isEnabled: config.enabled && !!config.baseUrl,
    withCDN: (url: string | undefined | null, type?: 'image' | 'css' | 'js') =>
      withCDN(url, type),
    withImageCDN: (url: string | undefined | null) => withImageCDN(url),
    getOptimizedImageUrl: (
      url: string | undefined | null,
      options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'webp' | 'jpeg' | 'png' | 'auto';
      }
    ) => getOptimizedImageUrl(url, options),
  };
}

/**
 * 使用图片 CDN 的 Hook
 */
export function useImageCDN() {
  const { config } = useCDN();

  return useMemo(
    () => ({
      getUrl: (url: string | undefined | null) => withImageCDN(url),
      getOptimizedUrl: (
        url: string | undefined | null,
        options?: {
          width?: number;
          height?: number;
          quality?: number;
          format?: 'webp' | 'jpeg' | 'png' | 'auto';
        }
      ) => getOptimizedImageUrl(url, options),
      supportsOptimization: config.imageOptimization,
      supportsWebP: config.webpEnabled,
    }),
    [config]
  );
}
