import { prisma } from "@blog/database";
import { AIProviderFactory } from "../providers/factory";
import {
  AIConfig,
  TranslateRequest,
  TranslateResult,
  AITask,
} from "../types";

export class AITranslateService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * 创建翻译任务
   */
  async createTask(
    request: TranslateRequest,
    userId: string
  ): Promise<AITask> {
    const task = await prisma.aITask.create({
      data: {
        type: "TRANSLATE",
        status: "PENDING",
        progress: 0,
        params: request as any,
        userId,
        articleId: request.articleId,
      },
    });

    // 异步执行翻译
    this.processTask(task.id, request);

    return {
      id: task.id,
      type: "TRANSLATE",
      status: "PENDING",
      progress: 0,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * 处理翻译任务
   */
  private async processTask(
    taskId: string,
    request: TranslateRequest
  ): Promise<void> {
    try {
      await prisma.aITask.update({
        where: { id: taskId },
        data: { status: "PROCESSING", progress: 10 },
      });

      // 获取源文章
      const article = await prisma.article.findUnique({
        where: { id: request.articleId },
        include: {
          translations: {
            where: { locale: request.sourceLocale },
          },
          categories: true,
        },
      });

      if (!article || article.translations.length === 0) {
        throw new Error("源文章不存在或无对应语言内容");
      }

      const sourceTranslation = article.translations[0];
      const provider = AIProviderFactory.createProvider(this.config);

      const translations: TranslateResult["translations"] = [];
      const totalLocales = request.targetLocales.length;

      for (let i = 0; i < totalLocales; i++) {
        const targetLocale = request.targetLocales[i];
        const progress = 10 + Math.floor((i / totalLocales) * 80);

        await prisma.aITask.update({
          where: { id: taskId },
          data: { progress },
        });

        try {
          const translationResult: any = {
            locale: targetLocale,
            success: true,
          };

          // 翻译标题
          if (request.translateTitle !== false) {
            const titlePrompt = `Translate the following title to ${this.getLanguageName(targetLocale)}. Only return the translated text, no explanations:

${sourceTranslation.title}`;

            const titleResponse = await this.callAI(titlePrompt);
            translationResult.title = titleResponse.trim();
          } else {
            translationResult.title = sourceTranslation.title;
          }

          // 翻译内容
          if (request.translateContent !== false) {
            const contentPrompt = `Translate the following Markdown content to ${this.getLanguageName(targetLocale)}. Preserve all Markdown formatting, code blocks, and links. Only return the translated content:

${sourceTranslation.content}`;

            const contentResponse = await this.callAI(contentPrompt);
            translationResult.content = contentResponse.trim();
          } else {
            translationResult.content = sourceTranslation.content;
          }

          // 翻译摘要
          if (request.translateSummary !== false && sourceTranslation.excerpt) {
            const summaryPrompt = `Translate the following summary to ${this.getLanguageName(targetLocale)}. Only return the translated text:

${sourceTranslation.excerpt}`;

            const summaryResponse = await this.callAI(summaryPrompt);
            translationResult.excerpt = summaryResponse.trim();
          }

          // 翻译 Meta 信息
          if (sourceTranslation.metaTitle) {
            const metaTitlePrompt = `Translate the following meta title to ${this.getLanguageName(targetLocale)}. Keep it SEO-friendly and concise:

${sourceTranslation.metaTitle}`;

            const metaTitleResponse = await this.callAI(metaTitlePrompt);
            translationResult.metaTitle = metaTitleResponse.trim();
          }

          if (sourceTranslation.metaDescription) {
            const metaDescPrompt = `Translate the following meta description to ${this.getLanguageName(targetLocale)}. Keep it SEO-friendly:

${sourceTranslation.metaDescription}`;

            const metaDescResponse = await this.callAI(metaDescPrompt);
            translationResult.metaDescription = metaDescResponse.trim();
          }

          translations.push(translationResult);

          // 保存翻译到数据库
          await this.saveTranslation(request.articleId, targetLocale, translationResult);

        } catch (error) {
          translations.push({
            locale: targetLocale,
            title: sourceTranslation.title,
            content: sourceTranslation.content,
            success: false,
            error: error instanceof Error ? error.message : "翻译失败",
          });
        }
      }

      // 完成任务
      const result: TranslateResult = {
        articleId: request.articleId,
        sourceLocale: request.sourceLocale,
        translations,
      };

      await prisma.aITask.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          progress: 100,
          result: result as any,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("AI translation task failed:", error);
      await prisma.aITask.update({
        where: { id: taskId },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "未知错误",
        },
      });
    }
  }

  /**
   * 调用 AI 进行翻译
   */
  private async callAI(prompt: string): Promise<string> {
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
          max_tokens: 4000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  /**
   * 保存翻译到数据库
   */
  private async saveTranslation(
    articleId: string,
    locale: string,
    translation: any
  ): Promise<void> {
    // 检查是否已存在该语言的翻译
    const existing = await prisma.articleTranslation.findUnique({
      where: {
        articleId_locale: {
          articleId,
          locale,
        },
      },
    });

    if (existing) {
      // 更新现有翻译
      await prisma.articleTranslation.update({
        where: { id: existing.id },
        data: {
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
        },
      });
    } else {
      // 创建新翻译
      await prisma.articleTranslation.create({
        data: {
          articleId,
          locale,
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
        },
      });
    }
  }

  /**
   * 获取任务状态
   */
  async getTask(taskId: string): Promise<AITask | null> {
    const task = await prisma.aITask.findUnique({
      where: { id: taskId },
    });

    if (!task) return null;

    return {
      id: task.id,
      type: task.type as any,
      status: task.status as any,
      progress: task.progress,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    };
  }

  /**
   * 自动翻译文章（发布时调用）
   */
  async autoTranslateArticle(
    articleId: string,
    sourceLocale: string,
    userId: string
  ): Promise<AITask | null> {
    if (!this.config.translate.enabled || !this.config.translate.autoTranslateOnPublish) {
      return null;
    }

    const targetLanguages = this.config.translate.targetLanguages.filter(
      (lang) => lang !== sourceLocale
    );

    if (targetLanguages.length === 0) {
      return null;
    }

    return await this.createTask(
      {
        articleId,
        sourceLocale,
        targetLocales: targetLanguages,
        translateTitle: this.config.translate.translateTitle,
        translateContent: this.config.translate.translateContent,
        translateSummary: this.config.translate.translateSummary,
      },
      userId
    );
  }

  /**
   * 获取语言名称
   */
  private getLanguageName(locale: string): string {
    const languageMap: Record<string, string> = {
      zh: "Chinese (中文)",
      en: "English",
      ja: "Japanese (日本語)",
      ko: "Korean (한국어)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      es: "Spanish (Español)",
      ru: "Russian (Русский)",
      pt: "Portuguese (Português)",
      it: "Italian (Italiano)",
      ar: "Arabic (العربية)",
      hi: "Hindi (हिन्दी)",
      th: "Thai (ไทย)",
      vi: "Vietnamese (Tiếng Việt)",
    };

    return languageMap[locale] || locale;
  }
}
