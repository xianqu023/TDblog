import { promises as fs, createReadStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import {
  StorageProvider,
  UploadOptions,
  UploadResult,
  LocalStorageConfig,
} from '../types';
import { generateStorageKey } from '../config';

/**
 * 本地文件系统存储驱动
 */
export class LocalStorageDriver implements StorageProvider {
  private config: LocalStorageConfig;

  constructor(config: LocalStorageConfig) {
    this.config = config;
    this.ensureBasePath();
  }

  /**
   * 确保基础目录存在
   */
  private ensureBasePath(): void {
    if (!existsSync(this.config.basePath)) {
      mkdirSync(this.config.basePath, { recursive: true });
    }
  }

  /**
   * 获取完整文件路径
   */
  private getFullPath(key: string): string {
    // 防止目录遍历攻击
    const safeKey = key.replace(/\.\./g, '').replace(/^\//, '');
    return join(this.config.basePath, safeKey);
  }

  /**
   * 上传文件（Buffer 方式）
   */
  async upload(
    buffer: Buffer,
    originalName: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const key = generateStorageKey(originalName, options?.key);
    const fullPath = this.getFullPath(key);

    // 确保目录存在
    const dir = dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // 写入文件
    await fs.writeFile(fullPath, buffer);

    // 获取文件信息
    const stats = await fs.stat(fullPath);

    return {
      key,
      url: this.getUrl(key),
      size: stats.size,
      mimeType: options?.contentType || 'application/octet-stream',
    };
  }

  /**
   * 上传文件（Stream 方式）
   */
  async uploadFromStream(
    stream: NodeJS.ReadableStream,
    originalName: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const key = generateStorageKey(originalName, options?.key);
    const fullPath = this.getFullPath(key);

    // 确保目录存在
    const dir = dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // 创建写入流
    const writeStream = createReadStream(fullPath);

    // 使用 pipeline 处理流
    const chunks: Buffer[] = [];
    let totalSize = 0;

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
      totalSize += chunk.length;
    }

    const buffer = Buffer.concat(chunks);
    await fs.writeFile(fullPath, buffer);

    return {
      key,
      url: this.getUrl(key),
      size: totalSize,
      mimeType: options?.contentType || 'application/octet-stream',
    };
  }

  /**
   * 删除文件
   */
  async delete(key: string): Promise<void> {
    const fullPath = this.getFullPath(key);

    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // 文件不存在，忽略错误
    }
  }

  /**
   * 获取文件访问 URL
   */
  getUrl(key: string): string {
    // 如果配置了基础 URL，使用它
    if (this.config.baseUrl) {
      const baseUrl = this.config.baseUrl.replace(/\/$/, '');
      const safeKey = key.replace(/^\//, '');
      return `${baseUrl}/${safeKey}`;
    }

    // 否则返回相对路径
    return `/uploads/${key.replace(/^\//, '')}`;
  }

  /**
   * 获取临时签名 URL（本地存储直接返回普通 URL）
   */
  async getSignedUrl(key: string, _expiresIn?: number): Promise<string> {
    return this.getUrl(key);
  }

  /**
   * 检查文件是否存在
   */
  async exists(key: string): Promise<boolean> {
    const fullPath = this.getFullPath(key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件流
   */
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const fullPath = this.getFullPath(key);

    if (!(await this.exists(key))) {
      throw new Error(`File not found: ${key}`);
    }

    return createReadStream(fullPath);
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(key: string): Promise<{ size: number; modifiedAt: Date } | null> {
    const fullPath = this.getFullPath(key);

    try {
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        modifiedAt: stats.mtime,
      };
    } catch {
      return null;
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(dirPath: string): Promise<void> {
    const fullPath = this.getFullPath(dirPath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  /**
   * 列出目录内容
   */
  async listDirectory(dirPath: string = ''): Promise<Array<{ name: string; isDirectory: boolean; size?: number }>> {
    const fullPath = this.getFullPath(dirPath);

    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const results = await Promise.all(
        entries.map(async (entry) => {
          const result: { name: string; isDirectory: boolean; size?: number } = {
            name: entry.name,
            isDirectory: entry.isDirectory(),
          };

          if (!entry.isDirectory()) {
            const stats = await fs.stat(join(fullPath, entry.name));
            result.size = stats.size;
          }

          return result;
        })
      );

      return results;
    } catch {
      return [];
    }
  }

  /**
   * 移动文件
   */
  async move(sourceKey: string, targetKey: string): Promise<void> {
    const sourcePath = this.getFullPath(sourceKey);
    const targetPath = this.getFullPath(targetKey);

    // 确保目标目录存在
    await fs.mkdir(dirname(targetPath), { recursive: true });

    await fs.rename(sourcePath, targetPath);
  }

  /**
   * 复制文件
   */
  async copy(sourceKey: string, targetKey: string): Promise<void> {
    const sourcePath = this.getFullPath(sourceKey);
    const targetPath = this.getFullPath(targetKey);

    // 确保目标目录存在
    await fs.mkdir(dirname(targetPath), { recursive: true });

    await fs.copyFile(sourcePath, targetPath);
  }
}
