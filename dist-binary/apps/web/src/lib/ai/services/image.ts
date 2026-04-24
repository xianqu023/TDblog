import { prisma } from "@blog/database";
import { AIProviderFactory } from "../providers/factory";
import {
  AIConfig,
  ImageGenerateRequest,
  ImageGenerateResult,
  AITask,
} from "../types";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export class AIImageService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * 创建图片生成任务
   */
  async createTask(
    request: ImageGenerateRequest,
    userId: string
  ): Promise<AITask> {
    const task = await prisma.aITask.create({
      data: {
        type: "IMAGE",
        status: "PENDING",
        progress: 0,
        params: request as any,
        userId,
      },
    });

    // 异步执行生成
    this.processTask(task.id, request);

    return {
      id: task.id,
      type: "IMAGE",
      status: "PENDING",
      progress: 0,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * 处理图片生成任务
   */
  private async processTask(
    taskId: string,
    request: ImageGenerateRequest
  ): Promise<void> {
    try {
      await prisma.aITask.update({
        where: { id: taskId },
        data: { status: "PROCESSING", progress: 20 },
      });

      const provider = AIProviderFactory.createProvider(this.config);

      await prisma.aITask.update({
        where: { id: taskId },
        data: { progress: 50 },
      });

      // 生成图片
      const result = await provider.generateImage(request);

      await prisma.aITask.update({
        where: { id: taskId },
        data: { progress: 80 },
      });

      // 下载并保存图片
      const localPath = await this.downloadImage(result.url);

      await prisma.aITask.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          progress: 100,
          result: {
            ...result,
            localPath,
          } as any,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("AI image task failed:", error);
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
   * 下载图片到本地
   */
  private async downloadImage(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const filename = `${randomUUID()}.png`;
      const uploadDir = process.env.UPLOAD_PATH_PREFIX || "uploads";
      const filepath = join(uploadDir, "ai-images", filename);

      // 确保目录存在
      await mkdir(join(uploadDir, "ai-images"), { recursive: true });

      await writeFile(filepath, Buffer.from(buffer));

      return `/uploads/ai-images/${filename}`;
    } catch (error) {
      console.error("Failed to download image:", error);
      return "";
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
   * 生成文章封面图
   */
  async generateCoverImage(
    title: string,
    summary?: string,
    userId?: string
  ): Promise<ImageGenerateResult> {
    const prompt = `Create a professional, modern cover image for a blog article titled: "${title}". 
${summary ? `The article is about: ${summary}` : ""}
Style: Clean, professional, suitable for a blog cover. High quality, visually appealing.`;

    const provider = AIProviderFactory.createProvider(this.config);

    return await provider.generateImage({
      prompt,
      size: "1792x1024",
      style: "vivid",
    });
  }

  /**
   * 生成文章插图
   */
  async generateArticleImage(
    sectionTitle: string,
    sectionContent: string,
    userId?: string
  ): Promise<ImageGenerateResult> {
    const prompt = `Create an illustration for a blog article section. 
Section title: "${sectionTitle}"
Content: ${sectionContent.substring(0, 200)}
Style: Clean, professional, suitable for article content. High quality.`;

    const provider = AIProviderFactory.createProvider(this.config);

    return await provider.generateImage({
      prompt,
      size: "1024x1024",
      style: "natural",
    });
  }
}
