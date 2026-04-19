/**
 * 文件存储系统抽象层
 */

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export interface UploadOptions {
  key?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageConfig {
  driver: StorageDriverType;
  local?: LocalStorageConfig;
  s3?: S3StorageConfig;
  oss?: OSSStorageConfig;
}

export type StorageDriverType = 'local' | 's3' | 'oss';

export interface LocalStorageConfig {
  basePath: string;
  baseUrl: string;
  serveStatic: boolean;
}

export interface S3StorageConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  publicUrl?: string;
}

export interface OSSStorageConfig {
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  endpoint?: string;
  internal?: boolean;
  publicUrl?: string;
}

export interface FileInfo {
  size: number;
  modifiedAt: Date;
  contentType?: string;
}

export interface StorageProvider {
  upload(buffer: Buffer, originalName: string, options?: UploadOptions): Promise<UploadResult>;
  uploadFromStream(stream: NodeJS.ReadableStream, originalName: string, options?: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
  getFileStream(key: string): Promise<NodeJS.ReadableStream>;
  getFileInfo?(key: string): Promise<FileInfo | null>;
}
