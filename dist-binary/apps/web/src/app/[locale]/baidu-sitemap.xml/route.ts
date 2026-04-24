/**
 * 百度 Sitemap 路由
 * 
 * 访问：/baidu-sitemap.xml
 */

import { NextRequest } from "next/server";
import { generateBaiduSitemapXml } from "@/lib/seo-full";

// 网站配置
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

/**
 * GET 请求 - 生成百度 sitemap.xml
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取所有 URL
    // 示例中使用静态数据
    
    const baseUrl = SITE_URL;
    
    // 静态页面
    const staticUrls = [
      baseUrl,
      `${baseUrl}/zh/articles`,
      `${baseUrl}/categories`,
      `${baseUrl}/tags`,
      `${baseUrl}/archives`,
      `${baseUrl}/about`,
    ];

    // TODO: 从数据库获取文章列表
    const articles: string[] = [];
    // const articles = await db.article.findMany({
    //   select: { id: true },
    //   where: { published: true },
    // }).then(arts => arts.map(a => `${baseUrl}/zh/articles/${a.id}`));

    // TODO: 从数据库获取分类列表
    const categories: string[] = [];
    
    // TODO: 从数据库获取标签列表
    const tags: string[] = [];

    // 合并所有 URL
    const allUrls = [
      ...staticUrls,
      ...articles,
      ...categories,
      ...tags,
    ];

    // 生成百度 sitemap XML
    const sitemapXml = generateBaiduSitemapXml(allUrls);

    // 返回 XML 响应
    return new Response(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // 缓存 1 小时
      },
    });
  } catch (error) {
    console.error("Baidu Sitemap generation error:", error);
    
    return new Response("Error generating baidu sitemap", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
