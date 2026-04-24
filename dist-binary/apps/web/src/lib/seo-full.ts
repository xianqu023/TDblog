export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultDescription: string;
  defaultImage?: string;
  author?: string;
}

// 文章数据结构（用于结构化数据 JSON-LD 的输入）
export interface ArticleData {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}

interface SEOMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  author?: string;
}

export function generateSEO(
  themeConfig: any,
  meta: SEOMeta,
  siteConfig: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logo?: string;
  }
) {
  const { title, description, keywords, image, type = 'website' } = meta;
  const fullTitle = `${title} - ${siteConfig.siteName}`;

  return {
    // 基础 Meta 标签
    title: fullTitle,
    description,
    keywords: keywords || '博客，技术，生活，分享',
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      type,
      locale: 'zh_CN',
      siteName: siteConfig.siteName,
      ...(image && { images: [image] }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(image && { image: image }),
    },

    // 结构化数据 (JSON-LD)
    structuredData: generateStructuredData(meta, siteConfig, themeConfig),
  };
}

function generateStructuredData(
  meta: SEOMeta,
  siteConfig: any,
  themeConfig: any
) {
  const structuredData: any[] = [];

  // 网站结构化数据
  structuredData.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.siteName,
    "description": siteConfig.siteDescription,
    "url": siteConfig.siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteConfig.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  // 文章结构化数据
  if (meta.type === 'article') {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": meta.title,
      "description": meta.description,
      "image": meta.image,
      "datePublished": meta.publishedTime,
      "author": {
        "@type": "Person",
        "name": meta.author || siteConfig.siteName
      },
      "publisher": {
        "@type": "Organization",
        "name": siteConfig.siteName,
        "logo": {
          "@type": "ImageObject",
          "url": siteConfig.logo
        }
      }
    });
  }

  return structuredData;
}

// 生成 Sitemap
export function generateSitemap(
  articles: Array<{ slug: string; updatedAt?: string }>,
  categories: Array<{ slug: string }>,
  tags: Array<{ slug: string }>
): string;
// 兼容旧 API：接受 URL 数组
export function generateSitemap(
  urls: Array<{ url: string; lastModified?: string; changeFrequency?: string; priority?: number }>,
  config?: SEOConfig
): string;
export function generateSitemap(
  articlesOrUrls: any,
  categoriesOrConfig?: any,
  tags?: Array<{ slug: string }>
): string {
  // 检测调用方式：如果是数组且第一个元素有 url 属性，则是旧 API 调用
  if (Array.isArray(articlesOrUrls) && articlesOrUrls.length > 0 && articlesOrUrls[0]?.url) {
    const urls = articlesOrUrls as Array<{ url: string; lastModified?: string; changeFrequency?: string; priority?: number }>;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const today = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    urls.forEach(item => {
      sitemap += `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified || today}</lastmod>
    ${item.changeFrequency ? `<changefreq>${item.changeFrequency}</changefreq>` : ''}
    ${item.priority !== undefined ? `<priority>${item.priority}</priority>` : ''}
  </url>
`;
    });

    sitemap += `</urlset>`;
    return sitemap;
  }

  // 新 API 调用
  const articles = articlesOrUrls as Array<{ slug: string; updatedAt?: string }>;
  const categories = categoriesOrConfig || [];
  const tagsArray = tags || [];
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const today = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // 文章
  articles.forEach(article => {
    sitemap += `  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // 分类
  categories.forEach((category: { slug: string }) => {
    sitemap += `  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  // 标签
  tagsArray.forEach((tag: { slug: string }) => {
    sitemap += `  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;
  return sitemap;
}

// 别名，兼容旧的 API
export const generateSitemapXml = generateSitemap;
export const generateBaiduSitemapXml = (urls: string[]) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const today = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  urls.forEach(url => {
    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>
`;
  });

  sitemap += `</urlset>`;
  return sitemap;
};
export const generateRobotsTxt = (config?: { siteUrl?: string }) => {
  const siteUrl = config?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`;
};

// 百度推送
export async function submitToBaidu(urls: string[]) {
  const token = process.env.BAIDU_PUSH_TOKEN;
  if (!token) return;

  try {
    const response = await fetch(`http://data.zz.baidu.com/urls?site=${process.env.NEXT_PUBLIC_SITE_URL}&token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(urls),
    });
    const result = await response.json();
    console.log('Baidu push result:', result);
  } catch (error) {
    console.error('Failed to submit to Baidu:', error);
  }
}

// 生成页面 Metadata（兼容旧 API）
export function generatePageMetadata(
  type: string,
  config: SEOConfig,
  options?: {
    title?: string;
    description?: string;
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
  }
) {
  const { title, description, canonical, noindex, nofollow } = options || {};
  
  return {
    title: {
      default: config.siteName,
      template: `%s - ${config.siteName}`,
    },
    description: description || config.defaultDescription,
    metadataBase: new URL(config.siteUrl),
    alternates: {
      canonical: canonical || '/',
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
      },
    },
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      locale: 'zh_CN',
      url: canonical || config.siteUrl,
      title: title || config.siteName,
      description: description || config.defaultDescription,
      siteName: config.siteName,
      images: [config.defaultImage || `${config.siteUrl}/og.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || config.siteName,
      description: description || config.defaultDescription,
      images: [config.defaultImage || `${config.siteUrl}/og.jpg`],
    },
  };
}

// JSON-LD 结构化数据生成（兼容旧 API）
export function generateArticleJsonLd(article: ArticleData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": {
      "@type": "Person",
      "name": article.author || "Unknown",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

export function generateWebsiteJsonLd(config: {
  siteName: string;
  siteUrl: string;
  description?: string;
  logo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.siteName,
    "url": config.siteUrl,
    "description": config.description || config.siteName,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${config.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    ...(config.logo && {
      "image": config.logo,
    }),
  };
}

export function generateBreadcrumbJsonLd(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}
