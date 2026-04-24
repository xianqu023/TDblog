import { AIConfig } from './types';

/**
 * 获取 AI 配置
 */
export function getAIConfig(): AIConfig {
  return {
    enabled: process.env.AI_ENABLED === 'true',
    provider: (process.env.AI_PROVIDER as any) || 'openai',
    apiKey: process.env.AI_API_KEY || '',
    apiEndpoint: process.env.AI_API_ENDPOINT,
    model: process.env.AI_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4000', 10),

    imageProvider: (process.env.AI_IMAGE_PROVIDER as any) || 'dall-e',
    imageApiKey: process.env.AI_IMAGE_API_KEY,
    imageApiEndpoint: process.env.AI_IMAGE_API_ENDPOINT,
    imageModel: process.env.AI_IMAGE_MODEL,

    features: {
      autoWrite: process.env.AI_FEATURE_WRITE === 'true',
      autoImage: process.env.AI_FEATURE_IMAGE === 'true',
      autoCover: process.env.AI_FEATURE_COVER === 'true',
      autoSummary: process.env.AI_FEATURE_SUMMARY === 'true',
      autoTags: process.env.AI_FEATURE_TAGS === 'true',
      autoSEO: process.env.AI_FEATURE_SEO === 'true',
      autoInternalLink: process.env.AI_FEATURE_INTERNAL_LINK === 'true',
      autoSearchPush: process.env.AI_FEATURE_SEARCH_PUSH === 'true',
      autoTranslate: process.env.AI_FEATURE_TRANSLATE === 'true',
    },

    writing: {
      defaultLanguage: process.env.AI_WRITING_LANGUAGE || 'zh',
      defaultTone: (process.env.AI_WRITING_TONE as any) || 'professional',
      minWordCount: parseInt(process.env.AI_WRITING_MIN_WORDS || '1000', 10),
      maxWordCount: parseInt(process.env.AI_WRITING_MAX_WORDS || '5000', 10),
      includeCodeExamples: process.env.AI_WRITING_CODE === 'true',
      includeImages: process.env.AI_WRITING_IMAGES === 'true',
      generateToc: process.env.AI_WRITING_TOC !== 'false',
    },

    seo: {
      generateMetaDescription: process.env.AI_SEO_DESCRIPTION !== 'false',
      generateKeywords: process.env.AI_SEO_KEYWORDS !== 'false',
      optimizeTitle: process.env.AI_SEO_TITLE === 'true',
      generateStructuredData: process.env.AI_SEO_STRUCTURED !== 'false',
    },

    push: {
      baidu: process.env.AI_PUSH_BAIDU === 'true',
      bing: process.env.AI_PUSH_BING === 'true',
      google: process.env.AI_PUSH_GOOGLE === 'true',
      yandex: process.env.AI_PUSH_YANDEX === 'true',
      indexnow: process.env.AI_PUSH_INDEXNOW === 'true',
      indexnowKey: process.env.AI_PUSH_INDEXNOW_KEY,
    },

    translate: {
      enabled: process.env.AI_TRANSLATE_ENABLED === 'true',
      targetLanguages: process.env.AI_TRANSLATE_LANGUAGES?.split(',') || ['en', 'ja'],
      autoTranslateOnPublish: process.env.AI_TRANSLATE_AUTO !== 'false',
      translateTitle: process.env.AI_TRANSLATE_TITLE !== 'false',
      translateContent: process.env.AI_TRANSLATE_CONTENT !== 'false',
      translateSummary: process.env.AI_TRANSLATE_SUMMARY !== 'false',
      translateMeta: process.env.AI_TRANSLATE_META !== 'false',
    },
  };
}

/**
 * 验证 AI 配置是否有效
 */
export function validateAIConfig(config: AIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.enabled) {
    return { valid: true, errors: [] };
  }

  if (!config.apiKey) {
    errors.push('AI API Key 未配置');
  }

  if (config.features.autoImage || config.features.autoCover) {
    if (config.imageProvider !== 'dall-e' && !config.imageApiKey) {
      errors.push('图片生成 API Key 未配置');
    }
  }

  if (config.push.indexnow && !config.push.indexnowKey) {
    errors.push('IndexNow Key 未配置');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 默认 AI 配置（用于数据库初始化）
 */
export const defaultAIConfig: AIConfig = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 4000,

  imageProvider: 'dall-e',

  features: {
    autoWrite: true,
    autoImage: true,
    autoCover: true,
    autoSummary: true,
    autoTags: true,
    autoSEO: true,
    autoInternalLink: true,
    autoSearchPush: true,
    autoTranslate: true,
  },

  writing: {
    defaultLanguage: 'zh',
    defaultTone: 'professional',
    minWordCount: 1000,
    maxWordCount: 3000,
    includeCodeExamples: true,
    includeImages: true,
    generateToc: true,
  },

  seo: {
    generateMetaDescription: true,
    generateKeywords: true,
    optimizeTitle: false,
    generateStructuredData: true,
  },

  push: {
    baidu: false,
    bing: false,
    google: false,
    yandex: false,
    indexnow: false,
  },

  translate: {
    enabled: false,
    targetLanguages: ['en', 'ja'],
    autoTranslateOnPublish: true,
    translateTitle: true,
    translateContent: true,
    translateSummary: true,
    translateMeta: true,
  },
};
