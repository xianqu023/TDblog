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

    if (!config.features.autoInternalLink) {
      return NextResponse.json(
        { success: false, message: "内部链接功能未启用" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { articleId, content, maxLinks } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { success: false, message: "文章 ID 和内容不能为空" },
        { status: 400 }
      );
    }

    const aiService = new AIService(config);

    // 获取内部链接建议
    const suggestions = await aiService.seo.suggestInternalLinks(
      articleId,
      content,
      maxLinks || 5
    );

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("AI internal links error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "获取建议失败" },
      { status: 500 }
    );
  }
}
