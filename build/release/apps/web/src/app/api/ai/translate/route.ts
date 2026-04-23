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

    if (!config.features.autoTranslate) {
      return NextResponse.json(
        { success: false, message: "AI 翻译功能未启用" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      articleId,
      sourceLocale,
      targetLocales,
      translateTitle,
      translateContent,
      translateSummary,
    } = body;

    if (!articleId || !sourceLocale || !targetLocales || targetLocales.length === 0) {
      return NextResponse.json(
        { success: false, message: "文章 ID、源语言和目标语言不能为空" },
        { status: 400 }
      );
    }

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    const aiService = new AIService(config);

    // 创建翻译任务
    const task = await aiService.translate.createTask(
      {
        articleId,
        sourceLocale,
        targetLocales,
        translateTitle,
        translateContent,
        translateSummary,
      },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      taskId: task.id,
      status: task.status,
      message: "翻译任务已创建",
    });
  } catch (error) {
    console.error("AI translate error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "翻译失败" },
      { status: 500 }
    );
  }
}

// 获取文章的所有翻译
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { success: false, message: "文章 ID 不能为空" },
        { status: 400 }
      );
    }

    const translations = await prisma.articleTranslation.findMany({
      where: { articleId },
      select: {
        locale: true,
        title: true,
        excerpt: true,
      },
    });

    return NextResponse.json({
      success: true,
      translations,
    });
  } catch (error) {
    console.error("Get translations error:", error);
    return NextResponse.json(
      { success: false, message: "获取翻译失败" },
      { status: 500 }
    );
  }
}
