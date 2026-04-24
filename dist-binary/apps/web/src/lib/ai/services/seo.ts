import { prisma } from "@blog/database";
import { AIProviderFactory } from "../providers/factory";
import {
  AIConfig,
  SEOOptimizeRequest,
  SEOOptimizeResult,
  InternalLinkSuggestion,
} from "../types";

export class AISEOService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * SEO 优化文章
   */
  async optimizeArticle(request: SEOOptimizeRequest): Promise<SEOOptimizeResult> {
    const provider = AIProviderFactory.createProvider(this.config);
    return await provider.optimizeSEO(request);
  }

  /**
   * 生成文章摘要
   */
  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const provider = AIProviderFactory.createProvider(this.config);
    return await provider.generateSummary(content, maxLength);
  }

  /**
   * 生成文章标签
   */
  async generateTags(content: string, count: number = 5): Promise<string[]> {
    const provider = AIProviderFactory.createProvider(this.config);
    return await provider.generateTags(content, count);
  }

  /**
   * 优化文章标题
   */
  async optimizeTitle(title: string, content: string): Promise<string> {
    const provider = AIProviderFactory.createProvider(this.config);

    const prompt = `请优化以下文章标题，使其更具吸引力和 SEO 友好：

原标题：${title}
文章内容：${content.substring(0, 1000)}

要求：
1. 保持原标题的核心意思
2. 增加吸引力和点击率
3. 包含关键词
4. 长度控制在 30-60 个字符

请直接返回优化后的标题，不要添加任何说明。`;

    const response = await fetch(
      `${this.config.apiEndpoint || "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 100,
        }),
      }
    );

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || title;
  }

  /**
   * 生成结构化数据 (JSON-LD)
   */
  async generateStructuredData(
    article: {
      title: string;
      content: string;
      author: string;
      publishedAt: Date;
      updatedAt?: Date;
      coverImage?: string;
    }
  ): Promise<object> {
    const provider = AIProviderFactory.createProvider(this.config);

    const request: SEOOptimizeRequest = {
      title: article.title,
      content: article.content,
    };

    const result = await provider.optimizeSEO(request);
    return result.structuredData;
  }

  /**
   * 获取内部链接建议
   */
  async suggestInternalLinks(
    articleId: string,
    content: string,
    maxLinks: number = 5
  ): Promise<InternalLinkSuggestion[]> {
    // 获取所有已发布的文章
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: articleId },
      },
      include: {
        translations: {
          select: {
            title: true,
            locale: true,
          },
        },
      },
    });

    // 提取文章中的关键概念
    const provider = AIProviderFactory.createProvider(this.config);

    const prompt = `请从以下文章中提取 ${maxLinks} 个关键概念或主题，这些概念可以用来链接到其他相关文章：

${content.substring(0, 2000)}

请以 JSON 数组格式返回：
["概念1", "概念2", "概念3"]`;

    const response = await fetch(
      `${this.config.apiEndpoint || "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();
    const content_text = data.choices[0]?.message?.content || "[]";

    let concepts: string[] = [];
    try {
      const match = content_text.match(/\[[\s\S]*\]/);
      if (match) {
        concepts = JSON.parse(match[0]);
      }
    } catch {
      concepts = content_text.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean);
    }

    // 匹配相关文章
    const suggestions: InternalLinkSuggestion[] = [];

    for (const concept of concepts.slice(0, maxLinks)) {
      // 查找包含该概念的文章
      const matchingArticles = (articles as any[]).filter((article: any) =>
        (article.translations as any[]).some(
          (t: any) =>
            t.title.toLowerCase().includes(concept.toLowerCase()) ||
            concept.toLowerCase().includes(t.title.toLowerCase())
        )
      );

      if (matchingArticles.length > 0) {
        const bestMatch = matchingArticles[0];
        const translation = bestMatch.translations[0];

        suggestions.push({
          sourceText: concept,
          targetArticleId: bestMatch.id,
          targetUrl: `/articles/${bestMatch.slug}`,
          targetTitle: translation?.title || bestMatch.slug,
          relevance: 0.8,
        });
      }
    }

    return suggestions;
  }

  /**
   * 批量优化文章 SEO
   */
  async batchOptimize(
    articleIds: string[],
    options: {
      generateSummary?: boolean;
      generateTags?: boolean;
      optimizeSEO?: boolean;
    }
  ): Promise<{ articleId: string; success: boolean; error?: string }[]> {
    const results = [];

    for (const articleId of articleIds) {
      try {
        const article = await prisma.article.findUnique({
          where: { id: articleId },
          include: {
            translations: true,
          },
        });

        if (!article) {
          results.push({ articleId, success: false, error: "文章不存在" });
          continue;
        }

        const translation = article.translations[0];
        if (!translation) {
          results.push({ articleId, success: false, error: "文章无内容" });
          continue;
        }

        const updateData: any = {};

        if (options.generateSummary) {
          const summary = await this.generateSummary(translation.content, 200);
          updateData.excerpt = summary;
        }

        if (options.generateTags) {
          const tags = await this.generateTags(translation.content, 5);
          // TODO: 创建或关联标签
        }

        if (options.optimizeSEO) {
          const seoResult = await this.optimizeArticle({
            title: translation.title,
            content: translation.content,
            summary: translation.excerpt || undefined,
          });

          updateData.metaDescription = seoResult.metaDescription;
          updateData.metaKeywords = seoResult.metaKeywords.join(", ");
        }

        // 更新文章
        await prisma.articleTranslation.update({
          where: { id: translation.id },
          data: updateData,
        });

        results.push({ articleId, success: true });
      } catch (error) {
        results.push({
          articleId,
          success: false,
          error: error instanceof Error ? error.message : "优化失败",
        });
      }
    }

    return results;
  }
}
