/**
 * Robots.txt 路由
 * 
 * 访问：/robots.txt
 */

import { NextRequest } from "next/server";
import { generateRobotsTxt } from "@/lib/seo-full";

// 网站配置
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

/**
 * GET 请求 - 生成 robots.txt
 */
export async function GET(request: NextRequest) {
  try {
    const config = {
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "TDblog",
      siteUrl: SITE_URL,
    };

    // 生成 robots.txt 内容
    const robotsTxt = generateRobotsTxt(config);

    // 返回文本响应
    return new Response(robotsTxt, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400", // 缓存 24 小时
      },
    });
  } catch (error) {
    console.error("Robots.txt generation error:", error);
    
    return new Response("Error generating robots.txt", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
