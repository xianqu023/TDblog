/**
 * AI 功能类型定义
 */

// AI 提供商类型
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'deepseek' | 'custom';

// 图片生成提供商
export type ImageProvider = 'dall-e' | 'midjourney' | 'stable-diffusion' | 'pollinations' | 'custom';

// AI 配置
export interface AIConfig {
  // 基础配置
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  apiEndpoint?: string;
  model: string;
  temperature: number;
  maxTokens: number;

  // 图片生成配置
  imageProvider: ImageProvider;
  imageApiKey?: string;
  imageApiEndpoint?: string;
  imageModel?: string;

  // 功能开关
  features: {
    autoWrite: boolean;
    autoImage: boolean;
    autoCover: boolean;
    autoSummary: boolean;
    autoTags: boolean;
    autoSEO: boolean;
    autoInternalLink: boolean;
    autoSearchPush: boolean;
    autoTranslate: boolean;
  };

  // 写作配置
  writing: {
    defaultLanguage: string;
    defaultTone: 'professional' | 'casual' | 'technical' | 'friendly';
    minWordCount: number;
    maxWordCount: number;
    includeCodeExamples: boolean;
    includeImages: boolean;
    generateToc: boolean;
  };

  // SEO 配置
  seo: {
    generateMetaDescription: boolean;
    generateKeywords: boolean;
    optimizeTitle: boolean;
    generateStructuredData: boolean;
  };

  // 推送配置
  push: {
    baidu: boolean;
    bing: boolean;
    google: boolean;
    yandex: boolean;
    indexnow: boolean;
    indexnowKey?: string;
  };

  // 翻译配置
  translate: {
    enabled: boolean;
    targetLanguages: string[];
    autoTranslateOnPublish: boolean;
    translateTitle: boolean;
    translateContent: boolean;
    translateSummary: boolean;
    translateMeta: boolean;
  };
}

// 文章生成请求
export interface ArticleGenerateRequest {
  topic: string;
  keywords?: string[];
  category?: string;
  language?: string;
  tone?: string;
  wordCount?: number;
  includeImages?: boolean;
  includeCode?: boolean;
}

// 文章生成结果
export interface ArticleGenerateResult {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  coverImage?: string;
  images?: string[];
  metaDescription?: string;
  metaKeywords?: string;
  structuredData?: object;
  toc?: Array<{ level: number; text: string; id: string }>;
  internalLinks?: Array<{ text: string; url: string }>;
}

// 图片生成请求
export interface ImageGenerateRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  n?: number;
}

// 图片生成结果
export interface ImageGenerateResult {
  url: string;
  localPath?: string;
  prompt: string;
  revisedPrompt?: string;
}

// SEO 优化请求
export interface SEOOptimizeRequest {
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
}

// SEO 优化结果
export interface SEOOptimizeResult {
  title?: string;
  metaDescription: string;
  metaKeywords: string[];
  structuredData: object;
  suggestions: string[];
}

// 内部链接建议
export interface InternalLinkSuggestion {
  sourceText: string;
  targetArticleId: string;
  targetUrl: string;
  targetTitle: string;
  relevance: number;
}

// 搜索引擎推送结果
export interface SearchPushResult {
  engine: string;
  success: boolean;
  message?: string;
  remaining?: number;
}

// AI 任务类型
export type AITaskType = 'WRITE' | 'IMAGE' | 'SUMMARY' | 'TAGS' | 'SEO' | 'INTERNAL_LINK' | 'PUSH' | 'TRANSLATE';

// AI 任务状态
export type AITaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// AI 任务
export interface AITask {
  id: string;
  type: AITaskType;
  status: AITaskStatus;
  progress: number;
  result?: any;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

// 翻译请求
export interface TranslateRequest {
  articleId: string;
  sourceLocale: string;
  targetLocales: string[];
  translateTitle?: boolean;
  translateContent?: boolean;
  translateSummary?: boolean;
}

// 翻译结果
export interface TranslateResult {
  articleId: string;
  sourceLocale: string;
  translations: {
    locale: string;
    title: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    success: boolean;
    error?: string;
  }[];
}
