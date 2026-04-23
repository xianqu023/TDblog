import { AIProviderBase } from "./base";
import {
  ArticleGenerateRequest,
  ArticleGenerateResult,
  ImageGenerateRequest,
  ImageGenerateResult,
  SEOOptimizeRequest,
  SEOOptimizeResult,
} from "../types";

export class OpenAIProvider extends AIProviderBase {
  private baseURL: string;
  private apiKey: string;

  constructor(config: any) {
    super(config);
    this.baseURL = config.apiEndpoint || "https://api.openai.com/v1";
    this.apiKey = config.apiKey;
  }

  async generateArticle(request: ArticleGenerateRequest): Promise<ArticleGenerateResult> {
    const systemPrompt = this.buildArticleSystemPrompt(request);
    const userPrompt = this.buildArticleUserPrompt(request);

    const response = await this.callAPI(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    return this.parseArticleResponse(content, request);
  }

  async generateImage(request: ImageGenerateRequest): Promise<ImageGenerateResult> {
    const imageApiKey = this.config.imageApiKey || this.apiKey;

    const response = await this.callAPI(`${this.baseURL}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${imageApiKey}`,
      },
      body: JSON.stringify({
        model: this.config.imageModel || "dall-e-3",
        prompt: request.prompt,
        size: request.size || "1024x1024",
        quality: "standard",
        n: request.n || 1,
      }),
    });

    const data = await response.json();
    const imageUrl = data.data[0]?.url || "";
    const revisedPrompt = data.data[0]?.revised_prompt || request.prompt;

    return {
      url: imageUrl,
      prompt: request.prompt,
      revisedPrompt,
    };
  }

  async generateSummary(content: string, maxLength: number = 200): Promise<string> {
    const prompt = `请为以下文章生成一个简洁的摘要，不超过 ${maxLength} 个字符：

${content.substring(0, 3000)}

请直接返回摘要内容，不要添加任何前缀或说明。`;

    const response = await this.callAPI(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: maxLength * 2,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "";
  }

  async generateTags(content: string, count: number = 5): Promise<string[]> {
    const prompt = `请从以下文章中提取 ${count} 个关键词作为标签，以 JSON 数组格式返回：

${content.substring(0, 3000)}

格式示例：["标签1", "标签2", "标签3"]`;

    const response = await this.callAPI(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const content_text = data.choices[0]?.message?.content || "[]";

    try {
      const match = content_text.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // fallback to split by comma
      return content_text.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean);
    }

    return [];
  }

  async optimizeSEO(request: SEOOptimizeRequest): Promise<SEOOptimizeResult> {
    const prompt = `请为以下文章进行 SEO 优化分析：

标题：${request.title}
内容：${request.content.substring(0, 2000)}
${request.summary ? `摘要：${request.summary}` : ""}
${request.tags ? `现有标签：${request.tags.join(", ")}` : ""}

请返回以下内容的 JSON 格式：
{
  "metaDescription": "SEO 友好的 meta description（150-160字符）",
  "metaKeywords": ["关键词1", "关键词2", "关键词3"],
  "structuredData": { "@context": "https://schema.org", "@type": "Article", ... },
  "suggestions": ["SEO 建议1", "SEO 建议2"]
}`;

    const response = await this.callAPI(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const content_text = data.choices[0]?.message?.content || "{}";

    try {
      const match = content_text.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        return {
          metaDescription: result.metaDescription || "",
          metaKeywords: result.metaKeywords || [],
          structuredData: result.structuredData || {},
          suggestions: result.suggestions || [],
        };
      }
    } catch (e) {
      console.error("Failed to parse SEO response:", e);
    }

    return {
      metaDescription: request.content.substring(0, 160),
      metaKeywords: request.tags || [],
      structuredData: {},
      suggestions: ["请手动优化 SEO 内容"],
    };
  }

  private buildArticleSystemPrompt(request: ArticleGenerateRequest): string {
    const toneMap: Record<string, string> = {
      professional: "专业正式",
      casual: "轻松随意",
      technical: "技术深度",
      friendly: "友好亲切",
    };

    const tone = toneMap[request.tone || this.config.writing.defaultTone] || "专业正式";
    const language = request.language || this.config.writing.defaultLanguage;

    return `你是一位专业的内容创作助手。请用${tone}的语气，以${language === "zh" ? "中文" : language === "en" ? "英文" : "日文"}撰写文章。

要求：
1. 文章结构清晰，包含引言、正文和结论
2. 使用 Markdown 格式
3. ${this.config.writing.generateToc ? "包含目录结构" : ""}
4. ${this.config.writing.includeCodeExamples ? "适当插入代码示例" : ""}
5. ${this.config.writing.includeImages ? "在合适位置标注图片插入点 [IMAGE: 图片描述]" : ""}

请返回以下格式的 JSON：
{
  "title": "文章标题",
  "content": "Markdown 格式的完整文章内容",
  "summary": "文章摘要",
  "tags": ["标签1", "标签2"],
  "toc": [{"level": 1, "text": "标题", "id": "anchor"}]
}`;
  }

  private buildArticleUserPrompt(request: ArticleGenerateRequest): string {
    return `主题：${request.topic}
${request.keywords ? `关键词：${request.keywords.join(", ")}` : ""}
${request.category ? `分类：${request.category}` : ""}
字数要求：${request.wordCount || this.config.writing.maxWordCount} 字左右`;
  }

  private parseArticleResponse(content: string, request: ArticleGenerateRequest): ArticleGenerateResult {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const result = JSON.parse(match[0]);
        return {
          title: result.title || request.topic,
          content: result.content || content,
          summary: result.summary || "",
          tags: result.tags || [],
          toc: result.toc || [],
        };
      }
    } catch (e) {
      console.error("Failed to parse article response:", e);
    }

    // Fallback: return raw content
    return {
      title: request.topic,
      content,
      summary: "",
      tags: [],
    };
  }
}
