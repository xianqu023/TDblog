"use client";

/**
 * SEO 组件 - 在页面中注入结构化数据和 SEO 优化
 */

import React, { useEffect } from "react";
import Script from "next/script";
import {
  generateArticleJsonLd,
  generateWebsiteJsonLd,
  generateBreadcrumbJsonLd,
  type ArticleData,
  type SEOConfig,
} from "@/lib/seo-full";

interface SEOConfigProviderProps {
  children: React.ReactNode;
  config: SEOConfig;
}

/**
 * SEO 配置提供者（可选，用于全局配置）
 */
export function SEOConfigProvider({ children, config }: SEOConfigProviderProps) {
  // 可以将 config 存入 localStorage 或全局状态
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__SEO_CONFIG__ = config;
    }
  }, [config]);

  return <>{children}</>;
}

interface ArticleJsonLdProps {
  article: ArticleData;
  config: SEOConfig;
}

/**
 * 文章结构化数据
 */
export function ArticleJsonLd({ article, config }: ArticleJsonLdProps) {
  // 生成 Article JSON-LD，article 已包含所需字段；config 目前未传入到生成函数
  const jsonLd = generateArticleJsonLd(article);

  return (
    <Script
      id="article-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  );
}

interface WebsiteJsonLdProps {
  config: SEOConfig;
}

/**
 * 网站结构化数据
 */
export function WebsiteJsonLd({ config }: WebsiteJsonLdProps) {
  const jsonLd = generateWebsiteJsonLd(config);

  return (
    <Script
      id="website-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * 面包屑导航结构化数据
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = generateBreadcrumbJsonLd(items);

  return (
    <Script
      id="breadcrumb-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  );
}

interface PerformanceScriptsProps {
  preloadImages?: string[];
  preconnectUrls?: string[];
}

/**
 * 性能优化脚本
 */
export function PerformanceScripts({
  preloadImages = [],
  preconnectUrls = [],
}: PerformanceScriptsProps) {
  return (
    <>
      {/* 预连接关键域名 */}
      {preconnectUrls.map((url) => (
        <link
          key={url}
          rel="preconnect"
          href={url}
          crossOrigin="anonymous"
        />
      ))}

      {/* 预加载关键图片 */}
      {preloadImages.map((src) => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={src}
        />
      ))}

      {/* DNS 预解析 */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </>
  );
}

interface SEOMetaTagsProps {
  botType?: "google" | "baidu" | "bing";
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * SEO Meta 标签
 */
export function SEOMetaTags({
  botType,
  noindex = false,
  nofollow = false,
}: SEOMetaTagsProps) {
  // 通用 robots meta
  const robotsContent = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
  ].join(", ");

  return (
    <>
      {/* 通用 Robots */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={noindex ? "noindex" : "index, follow, max-image-preview:large"} />
      
      {/* 针对特定搜索引擎 */}
      {botType === "google" && (
        <>
          <meta name="googlebot" content="index, follow, max-image-preview:large" />
          <meta name="google" content="notranslate" />
        </>
      )}
      
      {botType === "baidu" && (
        <>
          <meta name="baiduspider" content={noindex ? "noindex" : "index, follow"} />
          <meta name="renderer" content="webkit" />
          <meta name="force-rendering" content="webkit" />
        </>
      )}
      
      {botType === "bing" && (
        <meta name="bingbot" content={noindex ? "noindex" : "index, follow"} />
      )}

      {/* 主题颜色 */}
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f5f0e8" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1a1a1a" />
      <meta name="color-scheme" content="light dark" />

      {/* 禁用电话识别 */}
      <meta name="format-detection" content="telephone=no" />
    </>
  );
}

/**
 * 广告屏蔽组件（SEO 不抓取）
 */
interface AdNoIndexProps {
  children: React.ReactNode;
  position?: string;
  className?: string;
}

export function AdNoIndex({
  children,
  position,
  className = "",
}: AdNoIndexProps) {
  return (
    <div
      className={`ad-noindex ${className}`.trim()}
      data-ad-position={position}
      aria-hidden="true"
      data-robots="noindex"
    >
      {children}
    </div>
  );
}

/**
 * 图片优化组件（自动补全 ALT）
 */
interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  priority,
}: OptimizedImageProps) {
  // 如果没有 ALT，从文件名生成
  const generatedAlt = alt || generateAltFromFilename(src);

  return (
    <img
      src={src}
      alt={generatedAlt}
      className={className}
      width={width}
      height={height}
      loading={priority ? "eager" : loading}
      decoding="async"
    />
  );
}

/**
 * 从文件名生成 ALT 文本
 */
function generateAltFromFilename(filename: string): string {
  const name = filename.split("/").pop()?.replace(/\.[^/.]+$/, "") || "图片";
  return name
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * 全局 SEO 初始化（客户端）
 */
export function useSEOInitializer(config: SEOConfig) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 存储全局配置
    window.__SEO_CONFIG__ = config;

    // 预加载关键资源
    const preloadCriticalResources = () => {
      // 预连接 Google Fonts
      const googleFontsLink = document.createElement("link");
      googleFontsLink.rel = "preconnect";
      googleFontsLink.href = "https://fonts.googleapis.com";
      document.head.appendChild(googleFontsLink);

      const gstaticLink = document.createElement("link");
      gstaticLink.rel = "preconnect";
      gstaticLink.href = "https://fonts.gstatic.com";
      gstaticLink.crossOrigin = "anonymous";
      document.head.appendChild(gstaticLink);
    };

    preloadCriticalResources();
  }, [config]);
}

// 全局类型声明
declare global {
  interface Window {
    __SEO_CONFIG__?: SEOConfig;
  }
}

export default {
  SEOConfigProvider,
  ArticleJsonLd,
  WebsiteJsonLd,
  BreadcrumbJsonLd,
  PerformanceScripts,
  SEOMetaTags,
  AdNoIndex,
  OptimizedImage,
  useSEOInitializer,
};
