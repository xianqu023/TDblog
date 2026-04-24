'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl, getCDNConfig } from '@/lib/cdn';

interface CDNImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * CDN 图片组件
 * 自动应用 CDN 加速和图片优化
 */
export function CDNImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  quality = 80,
  sizes,
  objectFit = 'cover',
}: CDNImageProps) {
  const config = useMemo(() => getCDNConfig(), []);

  // 生成优化后的图片 URL
  const optimizedSrc = useMemo(() => {
    if (!src) return '';

    // 如果已经是完整 URL，检查是否需要优化
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // 检查是否是当前站点 URL
      const isExternal = !src.includes(
        typeof window !== 'undefined' ? window.location.hostname : ''
      );

      if (isExternal) {
        return src; // 外部图片不处理
      }
    }

    // 应用 CDN 和图片优化
    return getOptimizedImageUrl(src, {
      width,
      height,
      quality,
      format: config.webpEnabled ? 'webp' : 'auto',
    });
  }, [src, width, height, quality, config.webpEnabled]);

  // 如果不是 CDN URL 或需要使用 Next.js Image 组件
  if (!config.enabled || !optimizedSrc) {
    return (
      <Image
        src={src || '/placeholder.png'}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={className}
        style={{ objectFit }}
        priority={priority}
        quality={quality}
        sizes={sizes}
      />
    );
  }

  // 使用普通 img 标签（CDN 图片）
  if (fill) {
    return (
      <img
        src={optimizedSrc}
        alt={alt}
        className={className}
        style={{ objectFit, width: '100%', height: '100%' }}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ objectFit }}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}

/**
 * 简单的 CDN 图片组件（使用 img 标签）
 */
export function CDNImg({
  src,
  alt,
  width,
  height,
  className,
  style,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const optimizedSrc = useMemo(() => {
    return getOptimizedImageUrl(src, {
      width,
      height,
      format: 'webp',
    });
  }, [src, width, height]);

  return (
    <img
      src={optimizedSrc || src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}
