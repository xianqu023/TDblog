import { StorageConfig, StorageDriverType } from './types';

/**
 * 存储配置
 * 从环境变量读取配置
 */

export const storageConfig: StorageConfig = {
  driver: (process.env.STORAGE_DRIVER as StorageDriverType) || 'local',

  // 本地存储配置
  local: {
    basePath: process.env.STORAGE_LOCAL_PATH || './uploads',
    baseUrl: process.env.STORAGE_LOCAL_URL || '/uploads',
    serveStatic: process.env.STORAGE_LOCAL_SERVE_STATIC !== 'false',
  },

  // AWS S3 配置
  s3: {
    region: process.env.STORAGE_S3_REGION || 'us-east-1',
    bucket: process.env.STORAGE_S3_BUCKET || '',
    accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY || '',
    endpoint: process.env.STORAGE_S3_ENDPOINT, // 用于 MinIO 等兼容 S3 的服务
    forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true',
    publicUrl: process.env.STORAGE_S3_PUBLIC_URL, // CDN 加速域名
  },

  // 阿里云 OSS 配置
  oss: {
    region: process.env.STORAGE_OSS_REGION || 'oss-cn-hangzhou',
    bucket: process.env.STORAGE_OSS_BUCKET || '',
    accessKeyId: process.env.STORAGE_OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.STORAGE_OSS_ACCESS_KEY_SECRET || '',
    endpoint: process.env.STORAGE_OSS_ENDPOINT,
    internal: process.env.STORAGE_OSS_INTERNAL === 'true',
    publicUrl: process.env.STORAGE_OSS_PUBLIC_URL, // CDN 加速域名
  },
};

/**
 * 文件上传限制配置
 */
export const uploadConfig = {
  // 最大文件大小 (默认 100MB)
  maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '104857600', 10),

  // 允许的文件类型
  allowedMimeTypes: process.env.UPLOAD_ALLOWED_MIME_TYPES?.split(',') || [
    // 图片
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/markdown',
    // 视频
    'video/mp4',
    'video/webm',
    'video/ogg',
    // 音频
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    // 压缩包
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ],

  // 文件路径前缀
  pathPrefix: process.env.UPLOAD_PATH_PREFIX || 'uploads',

  // 按日期组织文件
  organizeByDate: process.env.UPLOAD_ORGANIZE_BY_DATE !== 'false',

  // 生成唯一文件名
  uniqueFilename: process.env.UPLOAD_UNIQUE_FILENAME !== 'false',
};

/**
 * 生成存储键名
 */
export function generateStorageKey(originalName: string, customKey?: string): string {
  const { pathPrefix, organizeByDate, uniqueFilename } = uploadConfig;

  let key = customKey || '';

  if (!key) {
    // 添加日期前缀
    if (organizeByDate) {
      const now = new Date();
      const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
      key = `${pathPrefix}/${datePath}/`;
    } else {
      key = `${pathPrefix}/`;
    }

    // 生成文件名
    if (uniqueFilename) {
      const ext = originalName.split('.').pop() || '';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      key += `${timestamp}-${random}${ext ? `.${ext}` : ''}`;
    } else {
      // 清理文件名中的特殊字符
      const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      key += safeName;
    }
  }

  return key;
}

/**
 * 验证文件类型
 */
export function isAllowedMimeType(mimeType: string): boolean {
  const { allowedMimeTypes } = uploadConfig;

  // 如果未配置限制，允许所有类型
  if (!allowedMimeTypes || allowedMimeTypes.length === 0) {
    return true;
  }

  return allowedMimeTypes.includes(mimeType);
}

/**
 * 验证文件大小
 */
export function isAllowedFileSize(size: number): boolean {
  return size <= uploadConfig.maxFileSize;
}

/**
 * 获取文件类型分类
 */
export function getFileCategory(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown') return 'document';
  if (mimeType === 'application/zip' ||
      mimeType === 'application/x-rar-compressed' ||
      mimeType === 'application/x-7z-compressed' ||
      mimeType.includes('compressed')) return 'archive';
  return 'other';
}
