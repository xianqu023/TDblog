import { prisma } from "@blog/database";
import { AIProviderFactory } from "../providers/factory";
import {
  AIConfig,
  ArticleGenerateRequest,
  ArticleGenerateResult,
  AITask,
} from "../types";

export class AIWriterService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * 创建文章生成任务
   */
  async createTask(
    request: ArticleGenerateRequest,
    userId: string
  ): Promise<AITask> {
    const task = await prisma.aITask.create({
      data: {
        type: "WRITE",
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
      type: "WRITE",
      status: "PENDING",
      progress: 0,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * 处理生成任务
   */
  private async processTask(
    taskId: string,
    request: ArticleGenerateRequest
  ): Promise<void> {
    try {
      // 更新状态为处理中
      await prisma.aITask.update({
        where: { id: taskId },
        data: { status: "PROCESSING", progress: 10 },
      });

      const provider = AIProviderFactory.createProvider(this.config);

      // 更新进度
      await prisma.aITask.update({
        where: { id: taskId },
        data: { progress: 30 },
      });

      // 生成文章
      const result = await provider.generateArticle(request);

      // 更新进度
      await prisma.aITask.update({
        where: { id: taskId },
        data: { progress: 70 },
      });

      // 生成封面图（如果需要）
      if (this.config.features.autoCover && !result.coverImage) {
        try {
          const imageResult = await provider.generateImage({
            prompt: `Create a professional cover image for an article about: ${result.title}`,
            size: "1792x1024",
          });
          result.coverImage = imageResult.url;
        } catch (e) {
          console.error("Failed to generate cover image:", e);
        }
      }

      // 完成任务
      await prisma.aITask.update({
        where: { id: taskId },
        data: {
          status: "COMPLETED",
          progress: 100,
          result: result as any,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("AI writing task failed:", error);
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
   * 获取用户的任务列表
   */
  async getUserTasks(userId: string, limit: number = 10): Promise<AITask[]> {
    const tasks = await prisma.aITask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return tasks.map((task) => ({
      id: task.id,
      type: task.type as any,
      status: task.status as any,
      progress: task.progress,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    }));
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = await prisma.aITask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.status !== "PENDING") {
      return false;
    }

    await prisma.aITask.update({
      where: { id: taskId },
      data: { status: "CANCELLED" },
    });

    return true;
  }
}
