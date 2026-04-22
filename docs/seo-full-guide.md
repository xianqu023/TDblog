# SEO 优化完整使用指南

## 目录

1. [核心功能](#核心功能)
2. [快速开始](#快速开始)
3. [动态 Meta 标签](#动态-meta-标签)
4. [结构化数据 JSON-LD](#结构化数据-json-ld)
5. [Sitemap 自动生成](#sitemap-自动生成)
6. [Robots.txt 配置](#robotstxt-配置)
7. [图片 ALT 自动补全](#图片-alt-自动补全)
8. [广告屏蔽 SEO 抓取](#广告屏蔽-seo-抓取)
9. [Core Web Vitals 优化](#core-web-vitals-优化)
10. [百度 + 谷歌双引擎适配](#百度--谷歌双引擎适配)

---

## 核心功能

### ✅ 功能列表

- ✅ 动态生成页面 Title、Description、Canonical 链接
- ✅ 文章 JSON-LD 结构化数据
- ✅ 自动 sitemap.xml 生成
- ✅ 图片 ALT 自动补全
- ✅ 百度 + 谷歌双引擎适配
- ✅ 广告屏蔽 SEO 抓取（noindex）
- ✅ Core Web Vitals 性能优化
- ✅ 面包屑导航结构化数据
- ✅ Open Graph / Twitter Card 支持
- ✅ 搜索引擎验证标签

---

## 快速开始

### 1. 配置 SEO 参数

```typescript
// lib/seo-config.ts
import { SEOConfig } from "@/lib/seo-full";

export const SEO_CONFIG: SEOConfig = {
  siteName: "TDblog",
  siteUrl: "https://yourblog.com",
  defaultDescription: "分享技术与生活",
  defaultImage: "https://yourblog.com/og-image.jpg",
  author: "Your Name",
  social: {
    twitter: "@yourtwitter",
    weibo: "yourweibo",
    github: "yourgithub",
  },
  verification: {
    google: "google-verification-code",
    baidu: "baidu-verification-code",
    bing: "bing-verification-code",
  },
};
```

### 2. 在 Layout 中使用

```tsx
// app/[locale]/layout.tsx
import { generateFullSEOHead } from "@/lib/seo-full";
import { WebsiteJsonLd, PerformanceScripts } from "@/components/seo/SEOComponents";
import { SEO_CONFIG } from "@/lib/seo-config";

export const metadata = generateFullSEOHead("home", SEO_CONFIG).metadata;

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 性能优化脚本 */}
        <PerformanceScripts
          preloadImages={[SEO_CONFIG.defaultImage]}
          preconnectUrls={[
            "https://fonts.googleapis.com",
            "https://fonts.gstatic.com",
          ]}
        />
      </head>
      <body>
        {/* 网站结构化数据 */}
        <WebsiteJsonLd config={SEO_CONFIG} />
        {children}
      </body>
    </html>
  );
}
```

---

## 动态 Meta 标签

### 首页

```tsx
// app/[locale]/page.tsx
import { generatePageMetadata } from "@/lib/seo-full";
import { SEO_CONFIG } from "@/lib/seo-config";

export const metadata = generatePageMetadata("home", SEO_CONFIG);

export default function HomePage() {
  return <div>首页内容</div>;
}
```

### 文章详情页

```tsx
// app/[locale]/articles/[id]/page.tsx
import { generatePageMetadata, ArticleJsonLd } from "@/lib/seo-full";
import { SEO_CONFIG } from "@/lib/seo-config";

export async function generateMetadata({ params }) {
  const article = await fetchArticle(params.id);
  
  return generatePageMetadata("article", SEO_CONFIG, {
    title: article.title,
    description: article.excerpt,
    image: article.coverImage,
    canonical: `${SEO_CONFIG.siteUrl}/zh/articles/${params.id}`,
    article: {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      author: article.author,
      tags: article.tags,
    },
  });
}

export default function ArticlePage({ params }) {
  const article = await fetchArticle(params.id);
  
  return (
    <article>
      {/* 文章结构化数据 */}
      <ArticleJsonLd article={article} config={SEO_CONFIG} />
      
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
```

### 分类/标签页

```tsx
// app/[locale]/categories/[slug]/page.tsx
export const metadata = generatePageMetadata("category", SEO_CONFIG, {
  title: "技术分类",
  description: "浏览技术类文章",
  canonical: `${SEO_CONFIG.siteUrl}/categories/tech`,
});
```

---

## 结构化数据 JSON-LD

### 文章结构化数据

```tsx
import { ArticleJsonLd } from "@/components/seo/SEOComponents";

<ArticleJsonLd
  article={{
    id: "article-id",
    title: "文章标题",
    excerpt: "文章摘要",
    coverImage: "/images/cover.jpg",
    publishedAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    author: "作者名",
    tags: ["技术", "博客"],
  }}
  config={SEO_CONFIG}
/>
```

生成的 JSON-LD：

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "文章标题",
  "description": "文章摘要",
  "image": {
    "@type": "ImageObject",
    "url": "https://yourblog.com/images/cover.jpg",
    "width": 1200,
    "height": 630
  },
  "datePublished": "2024-01-01T00:00:00Z",
  "dateModified": "2024-01-02T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "publisher": {
    "@type": "Organization",
    "name": "TDblog"
  }
}
```

### 面包屑导航结构化数据

```tsx
import { BreadcrumbJsonLd } from "@/components/seo/SEOComponents";

<BreadcrumbJsonLd
  items={[
    { name: "首页", url: "https://yourblog.com" },
    { name: "技术", url: "https://yourblog.com/categories/tech" },
    { name: "文章标题", url: "https://yourblog.com/articles/article-id" },
  ]}
/>
```

---

## Sitemap 自动生成

### 访问路由

- **Google Sitemap**: `/sitemap.xml`
- **百度 Sitemap**: `/baidu-sitemap.xml`

### 自动包含

- ✅ 首页
- ✅ 所有文章页
- ✅ 分类页
- ✅ 标签页
- ✅ 归档页
- ✅ 静态页面（关于等）

### 配置优先级

```typescript
// 在 sitemap.xml/route.ts 中配置
const urls = [
  {
    url: "https://yourblog.com",
    priority: 1.0,
    changeFrequency: "daily",
  },
  {
    url: "https://yourblog.com/articles",
    priority: 0.9,
    changeFrequency: "daily",
  },
  {
    url: "https://yourblog.com/articles/article-id",
    priority: 0.6,
    changeFrequency: "monthly",
  },
];
```

### 提交到搜索引擎

#### Google Search Console

1. 访问 https://search.google.com/search-console
2. 添加网站属性
3. 提交 Sitemap: `sitemap.xml`

#### 百度站长平台

1. 访问 https://ziyuan.baidu.com/
2. 添加网站
3. 提交 Sitemap: `baidu-sitemap.xml`

---

## Robots.txt 配置

### 访问路由

`/robots.txt`

### 默认配置

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /*?*

# 广告屏蔽
Disallow: /*ad=

# 网站地图
Sitemap: https://yourblog.com/sitemap.xml
Sitemap: https://yourblog.com/baidu-sitemap.xml

# 谷歌
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# 百度
User-agent: Baiduspider
Allow: /
Crawl-delay: 2

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 1
```

---

## 图片 ALT 自动补全

### 使用 OptimizedImage 组件

```tsx
import { OptimizedImage } from "@/components/seo/SEOComponents";

// 自动从文件名生成 ALT
<OptimizedImage
  src="/images/my-article-cover.jpg"
  width={800}
  height={600}
/>
// 生成：<img alt="My Article Cover" src="..." />

// 手动指定 ALT（推荐）
<OptimizedImage
  src="/images/cover.jpg"
  alt="文章封面图片"
  width={800}
  height={600}
/>
```

### 优化 HTML 中的图片

```typescript
import { optimizeImageHtml } from "@/lib/seo-full";

const html = '<img src="/images/cover.jpg" />';
const optimized = optimizeImageHtml(html, "默认 ALT 文本");

// 结果：<img alt="Cover" src="/images/cover.jpg" />
```

---

## 广告屏蔽 SEO 抓取

### 使用 AdNoIndex 组件

```tsx
import { AdNoIndex } from "@/components/seo/SEOComponents";

<AdNoIndex position="content-top">
  {/* 广告内容 */}
  <div className="ad-container">
    <ins className="adsbygoogle" ... />
  </div>
</AdNoIndex>
```

### 生成的 HTML

```html
<div
  class="ad-noindex"
  data-ad-position="content-top"
  aria-hidden="true"
  data-robots="noindex"
>
  <!-- 广告内容 -->
</div>
```

### 使用 CSS 类屏蔽

```css
.ad-noindex {
  /* 广告样式 */
}

/* 搜索引擎不会索引此区域内容 */
```

---

## Core Web Vitals 优化

### LCP (Largest Contentful Paint) 优化

```tsx
import { PerformanceScripts } from "@/components/seo/SEOComponents";

<PerformanceScripts
  preloadImages={[
    "/images/hero-image.jpg",  // 首屏大图
    "/images/logo.png",        // Logo
  ]}
  preconnectUrls={[
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://your-cdn.com",
  ]}
/>
```

### 图片优化建议

```tsx
// ✅ 好的做法
<OptimizedImage
  src="/images/cover.jpg"
  alt="封面"
  width={1200}
  height={630}
  loading="eager"  // 首屏图片
  priority
/>

// ❌ 避免
<img src="/images/cover.jpg" />  // 缺少宽高、ALT
```

### 字体优化

```tsx
// 在 layout.tsx 中
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC"
/>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC"
  media="print"
  onLoad="this.media='all'"
/>
```

### CLS (Cumulative Layout Shift) 优化

```css
/* 为广告预留空间 */
.ad-container {
  min-height: 250px;  /* 防止布局偏移 */
}

/* 图片固定宽高比 */
.image-wrapper {
  aspect-ratio: 16 / 9;
}
```

---

## 百度 + 谷歌双引擎适配

### 特定搜索引擎 Meta 标签

```tsx
import { SEOMetaTags, getBotType } from "@/lib/seo-full";

// 检测爬虫类型
const botType = getBotType(userAgent);

// 针对特定搜索引擎优化
<SEOMetaTags botType={botType} />
```

### 百度特殊优化

```tsx
{botType === "baidu" && (
  <>
    <meta name="baiduspider" content="index, follow" />
    <meta name="renderer" content="webkit" />
    <meta name="force-rendering" content="webkit" />
    <meta name="applicable-device" content="pc,mobile" />
  </>
)}
```

### 谷歌特殊优化

```tsx
{botType === "google" && (
  <>
    <meta name="googlebot" content="index, follow, max-image-preview:large" />
    <meta name="google" content="notranslate" />
  </>
)}
```

### 百度熊掌号（可选）

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://ziyuan.baidu.com/ctx/cube/open",
      "@type": "Cube",
      "title": "文章标题",
      "description": "文章描述",
      "pubDate": "2024-01-01T00:00:00Z",
    }),
  }}
/>
```

---

## 完整示例

### 文章页面完整代码

```tsx
// app/[locale]/articles/[id]/page.tsx
import {
  generateFullSEOHead,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  AdNoIndex,
  OptimizedImage,
} from "@/lib/seo-full";
import { SEO_CONFIG } from "@/lib/seo-config";

export async function generateMetadata({ params }) {
  const article = await fetchArticle(params.id);
  
  return generateFullSEOHead("article", SEO_CONFIG, {
    title: article.title,
    description: article.excerpt,
    image: article.coverImage,
    article: {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      author: article.author,
      tags: article.tags,
    },
  }).metadata;
}

export default async function ArticlePage({ params }) {
  const article = await fetchArticle(params.id);
  
  return (
    <article>
      {/* 结构化数据 */}
      <ArticleJsonLd article={article} config={SEO_CONFIG} />
      
      {/* 面包屑导航 */}
      <BreadcrumbJsonLd
        items={[
          { name: "首页", url: SEO_CONFIG.siteUrl },
          { name: "文章", url: `${SEO_CONFIG.siteUrl}/articles` },
          { name: article.title, url: `${SEO_CONFIG.siteUrl}/articles/${article.id}` },
        ]}
      />
      
      {/* 文章封面 */}
      {article.coverImage && (
        <OptimizedImage
          src={article.coverImage}
          alt={article.title}
          width={1200}
          height={630}
          priority
        />
      )}
      
      <h1>{article.title}</h1>
      
      <div className="article-content">
        <p>{article.excerpt}</p>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
      
      {/* 广告位（SEO 屏蔽） */}
      <AdNoIndex position="content-bottom">
        <div className="ad-container">
          {/* 谷歌广告代码 */}
        </div>
      </AdNoIndex>
    </article>
  );
}
```

---

## 注意事项

1. **Canonical 链接**：确保每个页面有唯一的 canonical 链接
2. **图片 ALT**：所有图片必须有 ALT 属性
3. **广告屏蔽**：使用 `AdNoIndex` 组件包裹广告
4. **结构化数据**：文章页必须包含 Article JSON-LD
5. **Sitemap 更新**：发布新文章后自动更新 sitemap
6. **Robots.txt**：定期检查和更新
7. **性能监控**：使用 Google PageSpeed Insights 监控 Core Web Vitals

---

## 测试工具

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [百度移动友好度测试](https://ziyuan.baidu.com/college/courseinfo?id=274)
- [Schema Markup Validator](https://validator.schema.org/)
