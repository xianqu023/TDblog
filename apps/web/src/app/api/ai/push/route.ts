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

    if (!config.features.autoSearchPush) {
      return NextResponse.json(
        { success: false, message: "搜索引擎推送功能未启用" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { articleId, engines } = body;

    if (!articleId) {
      return NextResponse.json(
        { success: false, message: "文章 ID 不能为空" },
        { status: 400 }
      );
    }

    // 检查文章是否存在且已发布
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    if (article.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, message: "文章未发布，无法推送" },
        { status: 400 }
      );
    }

    const aiService = new AIService(config);

    // 推送到搜索引擎
    const results = await aiService.push.pushArticle(articleId, engines);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("AI push error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "推送失败" },
      { status: 500 }
    );
  }
}
