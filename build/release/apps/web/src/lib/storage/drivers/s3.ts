import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import {
  StorageProvider,
  UploadOptions,
  UploadResult,
  S3StorageConfig,
} from '../types';
import { generateStorageKey } from '../config';

/**
 * AWS S3 / MinIO 兼容存储驱动
 */
export class S3StorageDriver implements StorageProvider {
  private client: S3Client;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  /**
   * 创建 S3 客户端
   */
  private createClient(): S3Client {
    const clientConfig: any = {
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    };

    // 自定义端点（用于 MinIO 等兼容服务）
    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
      clientConfig.forcePathStyle = this.config.forcePathStyle ?? true;
    }

    return new S3Client(clientConfig);
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

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: options?.contentType || 'application/octet-stream',
      Metadata: options?.metadata,
      ACL: options?.isPublic !== false ? 'public-read' : 'private',
    });

    await this.client.send(command);

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

    // 收集流数据以计算大小
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // 使用 AWS SDK 的 Upload 类支持分片上传
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: options?.contentType || 'application/octet-stream',
        Metadata: options?.metadata,
        ACL: options?.isPublic !== false ? 'public-read' : 'private',
      },
    });

    await upload.done();

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
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    await this.client.send(command);
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

    // 使用 S3 标准 URL 格式
    if (this.config.endpoint) {
      // 兼容 MinIO 等自定义端点
      const endpoint = this.config.endpoint.replace(/\/$/, '');
      if (this.config.forcePathStyle) {
        return `${endpoint}/${this.config.bucket}/${key}`;
      }
      return `${endpoint}/${key}`;
    }

    // 标准 AWS S3 URL
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  /**
   * 获取临时签名 URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * 检查文件是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取文件流
   */
  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    const response: GetObjectCommandOutput = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`File not found: ${key}`);
    }

    return response.Body as NodeJS.ReadableStream;
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(key: string): Promise<{ size: number; modifiedAt: Date; contentType?: string } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        size: response.ContentLength || 0,
        modifiedAt: response.LastModified || new Date(),
        contentType: response.ContentType,
      };
    } catch (error: any) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 批量删除文件
   */
  async deleteMany(keys: string[]): Promise<void> {
    const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3');

    // S3 批量删除每次最多 1000 个
    const batchSize = 1000;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);

      const command = new DeleteObjectsCommand({
        Bucket: this.config.bucket,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
        },
      });

      await this.client.send(command);
    }
  }

  /**
   * 复制文件
   */
  async copy(sourceKey: string, targetKey: string): Promise<void> {
    const { CopyObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new CopyObjectCommand({
      Bucket: this.config.bucket,
      CopySource: `${this.config.bucket}/${sourceKey}`,
      Key: targetKey,
    });

    await this.client.send(command);
  }

  /**
   * 移动文件（复制后删除）
   */
  async move(sourceKey: string, targetKey: string): Promise<void> {
    await this.copy(sourceKey, targetKey);
    await this.delete(sourceKey);
  }

  /**
   * 列出文件
   */
  async listObjects(prefix?: string, maxKeys: number = 1000): Promise<Array<{ key: string; size: number; modifiedAt: Date }>> {
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await this.client.send(command);

    return (response.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      modifiedAt: item.LastModified || new Date(),
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
    // 统一使用 PUT 预签名 URL（兼容 AWS S3 和 MinIO）
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url };
  }
}
