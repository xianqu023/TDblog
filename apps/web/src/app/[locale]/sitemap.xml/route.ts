/**
 * Sitemap 路由 - 自动生成网站地图
 * 
 * 访问：/sitemap.xml
 */

import { NextRequest } from "next/server";
import { generateSitemapXml, generateBaiduSitemapXml } from "@/lib/seo-full";
import { SEOConfig } from "@/lib/seo-full";

// 网站配置（应从环境变量或数据库读取）
const SITE_CONFIG: SEOConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "TDblog",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  defaultDescription: "TDblog 博客 - 分享技术与生活",
  defaultImage: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
  author: process.env.NEXT_PUBLIC_SITE_AUTHOR,
};

/**
 * GET 请求 - 生成 sitemap.xml
 */
export async function GET(request: NextRequest) {
  try {
    // 这里应该从数据库获取所有文章、分类、标签等
    // 示例中使用静态数据，实际使用时请替换为数据库查询
    
    const baseUrl = SITE_CONFIG.siteUrl;
    
    // 静态页面
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/zh/articles`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/tags`,
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/archives`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date().toISOString(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
    ];

    // TODO: 从数据库获取文章列表
    // const articles = await db.article.findMany({
    //   select: {
    //     id: true,
    //     updatedAt: true,
    //   },
    //   where: { published: true },
    // });
    const articles: Array<{ id: string; updatedAt: string }> = [];
    
    const articleUrls = articles.map((article) => ({
      url: `${baseUrl}/zh/articles/${article.id}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    // TODO: 从数据库获取分类列表
    const categories: Array<{ slug: string; updatedAt: string }> = [];
    
    const categoryUrls = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // TODO: 从数据库获取标签列表
    const tags: Array<{ slug: string; updatedAt: string }> = [];
    
    const tagUrls = tags.map((tag) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: tag.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // 合并所有 URL
    const allUrls = [
      ...staticUrls,
      ...articleUrls,
      ...categoryUrls,
      ...tagUrls,
    ];

    // 生成 sitemap XML
    const sitemapXml = generateSitemapXml(allUrls, SITE_CONFIG);

    // 返回 XML 响应
    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // 缓存 1 小时
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    
    return new Response("Error generating sitemap", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
