import {
  ArticleGenerateRequest,
  ArticleGenerateResult,
  ImageGenerateRequest,
  ImageGenerateResult,
  SEOOptimizeRequest,
  SEOOptimizeResult,
  AIConfig,
} from "../types";

export abstract class AIProviderBase {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  abstract generateArticle(request: ArticleGenerateRequest): Promise<ArticleGenerateResult>;
  abstract generateImage(request: ImageGenerateRequest): Promise<ImageGenerateResult>;
  abstract generateSummary(content: string, maxLength?: number): Promise<string>;
  abstract generateTags(content: string, count?: number): Promise<string[]>;
  abstract optimizeSEO(request: SEOOptimizeRequest): Promise<SEOOptimizeResult>;

  protected async callAPI(url: string, options: RequestInit): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API call failed: ${response.status} - ${error}`);
    }

    return response;
  }
}
