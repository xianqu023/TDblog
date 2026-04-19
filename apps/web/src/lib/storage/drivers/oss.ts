import OSS from 'ali-oss';
import { Readable } from 'stream';
import {
  StorageProvider,
  UploadOptions,
  UploadResult,
  OSSStorageConfig,
  FileInfo,
} from '../types';
import { generateStorageKey } from '../config';

/**
 * 阿里云 OSS 存储驱动
 */
export class OSSStorageDriver implements StorageProvider {
  private client: OSS;
  private config: OSSStorageConfig;

  constructor(config: OSSStorageConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  /**
   * 创建 OSS 客户端
   */
  private createClient(): OSS {
    const clientConfig: OSS.Options = {
      region: this.config.region,
      bucket: this.config.bucket,
      accessKeyId: this.config.accessKeyId,
      accessKeySecret: this.config.accessKeySecret,
      internal: this.config.internal,
      secure: true,
    };

    // 自定义端点（用于 VPC 内网或自定义域名）
    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
    }

    return new OSS(clientConfig);
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

    const headers: Record<string, string> = {
      'Content-Type': options?.contentType || 'application/octet-stream',
      ...(options?.metadata || {}),
    };

    // 设置访问权限
    if (options?.isPublic !== false) {
      headers['x-oss-object-acl'] = 'public-read';
    } else {
      headers['x-oss-object-acl'] = 'private';
    }

    const ossOptions: OSS.PutObjectOptions = { headers };

    await this.client.put(key, buffer, ossOptions);

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
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

    // 收集流数据
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const headers: Record<string, string> = {
      'Content-Type': options?.contentType || 'application/octet-stream',
      ...(options?.metadata || {}),
    };

    // 设置访问权限
    if (options?.isPublic !== false) {
      headers['x-oss-object-acl'] = 'public-read';
    } else {
      headers['x-oss-object-acl'] = 'private';
    }

    const ossOptions: OSS.PutObjectOptions = { headers };

    await this.client.put(key, buffer, ossOptions);

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      mimeType: options?.contentType || 'application/octet-stream',
    };
  }

  /**
   * 删除文件
   */
  async delete(key: string): Promise<void> {
    await this.client.delete(key);
  }

  /**
   * 获取文件访问 URL
   */
  getUrl(key: string): string {
    // 如果配置了 CDN 加速域名，使用它
    if (this.config.publicUrl) {
      const baseUrl = this.config.publicUrl.replace(/\/$/, '');
      return `${baseUrl}/${key}`;
    }

    // 使用 OSS 标准 URL
    return `https://${this.config.bucket}.${this.config.region}.aliyuncs.com/${key}`;
  }

  /**
   * 获取临时签名 URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // OSS 签名 URL 过期时间单位为秒，最大 7 天 (604800 秒)
    const maxExpires = 604800;
    const safeExpires = Math.min(expiresIn, maxExpires);

    const url = this.client.signatureUrl(key, {
      expires: safeExpires,
    });

    return url;
  }

  /**
   * 检查文件是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.client.head(key);
      return true;
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取文件流
   */
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const result = await this.client.get(key);

    if (!result.content) {
      throw new Error(`File not found: ${key}`);
    }

    // 如果是 Buffer，转换为 Stream
    if (Buffer.isBuffer(result.content)) {
      return Readable.from([result.content]);
    }

    return result.content as NodeJS.ReadableStream;
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(key: string): Promise<FileInfo | null> {
    try {
      const result = await this.client.head(key);
      const headers = result.res.headers as Record<string, string>;

      return {
        size: result.res.size,
        modifiedAt: new Date(headers['last-modified'] || Date.now()),
        contentType: headers['content-type'],
      };
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 批量删除文件
   */
  async deleteMany(keys: string[]): Promise<void> {
    // OSS 批量删除每次最多 1000 个
    const batchSize = 1000;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await this.client.deleteMulti(batch);
    }
  }

  /**
   * 复制文件
   */
  async copy(sourceKey: string, targetKey: string): Promise<void> {
    await this.client.copy(targetKey, sourceKey);
  }

  /**
   * 移动文件（复制后删除）
   */
  async move(sourceKey: string, targetKey: string): Promise<void> {
    await this.client.copy(targetKey, sourceKey);
    await this.client.delete(sourceKey);
  }

  /**
   * 列出文件
   */
  async listObjects(prefix?: string, maxKeys: number = 1000): Promise<Array<{ key: string; size: number; modifiedAt: Date }>> {
    const query: OSS.ListObjectsQuery = {
      prefix,
      'max-keys': maxKeys,
    };
    const result = await this.client.list(query, {});

    return (result.objects || []).map((item) => ({
      key: item.name,
      size: item.size,
      modifiedAt: new Date(item.lastModified),
    }));
  }

  /**
   * 生成预签名上传 URL（用于前端直传）
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; fields?: Record<string, string> }> {
    // 使用 OSS 签名 URL 进行 PUT 上传
    const url = this.client.signatureUrl(key, {
      method: 'PUT',
      expires: expiresIn,
      'Content-Type': contentType,
    });

    return { url };
  }

  /**
   * 设置文件访问权限
   */
  async setACL(key: string, acl: 'public-read' | 'private'): Promise<void> {
    await this.client.putACL(key, acl);
  }

  /**
   * 获取文件访问权限
   */
  async getACL(key: string): Promise<string> {
    const result = await this.client.getACL(key);
    return result.acl;
  }

  /**
   * 分片上传（大文件）
   */
  async multipartUpload(
    key: string,
    filePath: string,
    options?: {
      parallel?: number;
      partSize?: number;
      progress?: (percent: number) => void;
    }
  ): Promise<UploadResult> {
    const result = await this.client.multipartUpload(key, filePath, {
      parallel: options?.parallel || 4,
      partSize: options?.partSize || 1024 * 1024, // 默认 1MB
      progress: options?.progress ? (p: number, _checkpoint: any) => options.progress!(p * 100) : undefined,
    });

    const fileInfo = await this.getFileInfo(key);

    return {
      key,
      url: this.getUrl(key),
      size: fileInfo?.size || 0,
      mimeType: fileInfo?.contentType || 'application/octet-stream',
    };
  }

  /**
   * 图片处理（使用 OSS 图片服务）
   */
  getImageUrl(key: string, process: string): string {
    // 示例: process = 'resize,w_200,h_200'
    return this.client.signatureUrl(key, {
      process,
    });
  }

  /**
   * 解冻归档文件
   */
  async restoreObject(key: string, _days: number = 7): Promise<void> {
    // OSS restore 方法签名较复杂，这里简化处理
    // 实际使用时需要根据具体需求实现
    await this.client.restore(key);
  }
}
