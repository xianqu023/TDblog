import { StorageProvider, StorageDriverType } from './types';
import { storageConfig } from './config';
import { LocalStorageDriver } from './drivers/local';
import { S3StorageDriver } from './drivers/s3';
import { OSSStorageDriver } from './drivers/oss';

// 全局存储实例缓存
let storageInstance: StorageProvider | null = null;

/**
 * 获取存储驱动实例
 */
export function getStorage(): StorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  const { driver } = storageConfig;

  switch (driver) {
    case 'local':
      if (!storageConfig.local) {
        throw new Error('Local storage configuration is missing');
      }
      storageInstance = new LocalStorageDriver(storageConfig.local);
      break;

    case 's3':
      if (!storageConfig.s3) {
        throw new Error('S3 storage configuration is missing');
      }
      validateS3Config(storageConfig.s3);
      storageInstance = new S3StorageDriver(storageConfig.s3);
      break;

    case 'oss':
      if (!storageConfig.oss) {
        throw new Error('OSS storage configuration is missing');
      }
      validateOSSConfig(storageConfig.oss);
      storageInstance = new OSSStorageDriver(storageConfig.oss);
      break;

    default:
      throw new Error(`Unsupported storage driver: ${driver}`);
  }

  return storageInstance;
}

/**
 * 验证 S3 配置
 */
function validateS3Config(config: any): void {
  const required = ['region', 'bucket', 'accessKeyId', 'secretAccessKey'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing S3 configuration: ${missing.join(', ')}`);
  }
}

/**
 * 验证 OSS 配置
 */
function validateOSSConfig(config: any): void {
  const required = ['region', 'bucket', 'accessKeyId', 'accessKeySecret'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing OSS configuration: ${missing.join(', ')}`);
  }
}

/**
 * 重置存储实例（用于测试或重新配置）
 */
export function resetStorage(): void {
  storageInstance = null;
}

/**
 * 获取当前存储驱动类型
 */
export function getStorageDriver(): StorageDriverType {
  return storageConfig.driver;
}

/**
 * 检查存储是否已配置
 */
export function isStorageConfigured(): boolean {
  try {
    const { driver } = storageConfig;

    switch (driver) {
      case 'local':
        return !!storageConfig.local?.basePath;
      case 's3':
        return !!(
          storageConfig.s3?.bucket &&
          storageConfig.s3?.accessKeyId &&
          storageConfig.s3?.secretAccessKey
        );
      case 'oss':
        return !!(
          storageConfig.oss?.bucket &&
          storageConfig.oss?.accessKeyId &&
          storageConfig.oss?.accessKeySecret
        );
      default:
        return false;
    }
  } catch {
    return false;
  }
}

// 导出类型和配置
export * from './types';
export { storageConfig, uploadConfig, generateStorageKey, isAllowedMimeType, isAllowedFileSize, getFileCategory } from './config';

// 导出驱动类（供高级使用）
export { LocalStorageDriver } from './drivers/local';
export { S3StorageDriver } from './drivers/s3';
export { OSSStorageDriver } from './drivers/oss';
