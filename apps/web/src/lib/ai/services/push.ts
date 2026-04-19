import { prisma } from "@blog/database";
import { AIConfig, SearchPushResult } from "../types";

export class SearchPushService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * 推送文章到搜索引擎
   */
  async pushArticle(
    articleId: string,
    engines?: ("baidu" | "bing" | "google" | "yandex")[]
  ): Promise<SearchPushResult[]> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        translations: true,
      },
    });

    if (!article || article.status !== "PUBLISHED") {
      throw new Error("文章不存在或未发布");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const articleUrl = `${siteUrl}/articles/${article.slug}`;

    const results: SearchPushResult[] = [];
    const targetEngines = engines || this.getEnabledEngines();

    for (const engine of targetEngines) {
      try {
        const result = await this.pushToEngine(engine, articleUrl);
        results.push(result);
      } catch (error) {
        results.push({
          engine,
          success: false,
          message: error instanceof Error ? error.message : "推送失败",
        });
      }
    }

    return results;
  }

  /**
   * 批量推送文章
   */
  async batchPush(
    articleIds: string[],
    engines?: ("baidu" | "bing" | "google" | "yandex")[]
  ): Promise<{ articleId: string; results: SearchPushResult[] }[]> {
    const results = [];

    for (const articleId of articleIds) {
      try {
        const pushResults = await this.pushArticle(articleId, engines);
        results.push({ articleId, results: pushResults });
      } catch (error) {
        results.push({
          articleId,
          results: [
            {
              engine: "unknown",
              success: false,
              message: error instanceof Error ? error.message : "推送失败",
            },
          ],
        });
      }
    }

    return results;
  }

  /**
   * 获取启用的搜索引擎
   */
  private getEnabledEngines(): ("baidu" | "bing" | "google" | "yandex")[] {
    const engines: ("baidu" | "bing" | "google" | "yandex")[] = [];

    if (this.config.push.baidu) engines.push("baidu");
    if (this.config.push.bing) engines.push("bing");
    if (this.config.push.google) engines.push("google");
    if (this.config.push.yandex) engines.push("yandex");

    return engines;
  }

  /**
   * 推送到指定搜索引擎
   */
  private async pushToEngine(
    engine: string,
    url: string
  ): Promise<SearchPushResult> {
    switch (engine) {
      case "baidu":
        return this.pushToBaidu(url);
      case "bing":
        return this.pushToBing(url);
      case "google":
        return this.pushToGoogle(url);
      case "yandex":
        return this.pushToYandex(url);
      default:
        throw new Error(`不支持的搜索引擎: ${engine}`);
    }
  }

  /**
   * 推送到百度
   */
  private async pushToBaidu(url: string): Promise<SearchPushResult> {
    const token = process.env.BAIDU_PUSH_TOKEN;
    if (!token) {
      return {
        engine: "baidu",
        success: false,
        message: "百度推送 Token 未配置",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const site = new URL(siteUrl).hostname;

    try {
      const response = await fetch(
        `http://data.zz.baidu.com/urls?site=${site}&token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: url,
        }
      );

      const data = await response.json();

      if (data.success) {
        return {
          engine: "baidu",
          success: true,
          message: `成功推送，今日剩余 ${data.remain} 条额度`,
          remaining: data.remain,
        };
      } else {
        return {
          engine: "baidu",
          success: false,
          message: data.message || "推送失败",
        };
      }
    } catch (error) {
      return {
        engine: "baidu",
        success: false,
        message: error instanceof Error ? error.message : "网络错误",
      };
    }
  }

  /**
   * 推送到必应 (IndexNow)
   */
  private async pushToBing(url: string): Promise<SearchPushResult> {
    const key = this.config.push.indexnowKey || process.env.INDEXNOW_KEY;
    if (!key) {
      return {
        engine: "bing",
        success: false,
        message: "IndexNow Key 未配置",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

    try {
      const response = await fetch("https://api.indexnow.org/IndexNow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: new URL(siteUrl).hostname,
          key,
          urlList: [url],
        }),
      });

      if (response.status === 200) {
        return {
          engine: "bing",
          success: true,
          message: "成功推送到必应搜索",
        };
      } else {
        const text = await response.text();
        return {
          engine: "bing",
          success: false,
          message: `推送失败: ${text}`,
        };
      }
    } catch (error) {
      return {
        engine: "bing",
        success: false,
        message: error instanceof Error ? error.message : "网络错误",
      };
    }
  }

  /**
   * 推送到 Google
   */
  private async pushToGoogle(url: string): Promise<SearchPushResult> {
    // Google Indexing API 需要 OAuth2 认证
    // 这里提供一个基本的实现框架
    const credentials = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!credentials) {
      return {
        engine: "google",
        success: false,
        message: "Google Indexing API 凭证未配置",
      };
    }

    try {
      // TODO: 实现 Google Indexing API 调用
      // 需要使用 googleapis 库和 OAuth2 认证
      return {
        engine: "google",
        success: false,
        message: "Google 推送功能开发中",
      };
    } catch (error) {
      return {
        engine: "google",
        success: false,
        message: error instanceof Error ? error.message : "推送失败",
      };
    }
  }

  /**
   * 推送到 Yandex
   */
  private async pushToYandex(url: string): Promise<SearchPushResult> {
    // Yandex 也支持 IndexNow 协议
    const key = this.config.push.indexnowKey || process.env.INDEXNOW_KEY;
    if (!key) {
      return {
        engine: "yandex",
        success: false,
        message: "IndexNow Key 未配置",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

    try {
      const response = await fetch("https://yandex.com/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: new URL(siteUrl).hostname,
          key,
          urlList: [url],
        }),
      });

      if (response.status === 200) {
        return {
          engine: "yandex",
          success: true,
          message: "成功推送到 Yandex 搜索",
        };
      } else {
        const text = await response.text();
        return {
          engine: "yandex",
          success: false,
          message: `推送失败: ${text}`,
        };
      }
    } catch (error) {
      return {
        engine: "yandex",
        success: false,
        message: error instanceof Error ? error.message : "网络错误",
      };
    }
  }

  /**
   * 生成 IndexNow Key 文件
   */
  async generateIndexNowKeyFile(): Promise<string> {
    const key = this.config.push.indexnowKey || process.env.INDEXNOW_KEY;
    if (!key) {
      throw new Error("IndexNow Key 未配置");
    }

    // 返回 Key 文件内容
    return key;
  }
}
