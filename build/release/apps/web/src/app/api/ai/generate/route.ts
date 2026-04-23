import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@blog/database";
import { AIService } from "@/lib/ai/services";
import { AIConfig } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    // 获取 AI 配置
    const setting = await prisma.setting.findUnique({
      where: { key: "ai_config" },
    });

    if (!setting) {
      return NextResponse.json(
        { success: false, message: "AI 配置未找到" },
        { status: 400 }
      );
    }

    const config: AIConfig = JSON.parse(setting.value);

    if (!config.enabled) {
      return NextResponse.json(
        { success: false, message: "AI 功能未启用" },
        { status: 400 }
      );
    }

    if (!config.features.autoWrite) {
      return NextResponse.json(
        { success: false, message: "自动写作功能未启用" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { topic, keywords, categoryId, language, tone, wordCount, includeImages, includeCode } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, message: "主题不能为空" },
        { status: 400 }
      );
    }

    const aiService = new AIService(config);

    // 获取分类名称
    let categoryName: string | undefined;
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      categoryName = category?.name;
    }

    // 创建生成任务
    const task = await aiService.writer.createTask(
      {
        topic,
        keywords,
        category: categoryName,
        language,
        tone,
        wordCount,
        includeImages,
        includeCode,
      },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      taskId: task.id,
      status: task.status,
    });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "生成失败" },
      { status: 500 }
    );
  }
}
