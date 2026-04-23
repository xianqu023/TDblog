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

    const body = await request.json();
    const { content, maxLength, generateTags, tagCount } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, message: "文章内容不能为空" },
        { status: 400 }
      );
    }

    const aiService = new AIService(config);
    const result: { summary?: string; tags?: string[] } = {};

    // 生成摘要
    if (config.features.autoSummary) {
      result.summary = await aiService.seo.generateSummary(content, maxLength || 200);
    }

    // 生成标签
    if (generateTags && config.features.autoTags) {
      result.tags = await aiService.seo.generateTags(content, tagCount || 5);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "生成失败" },
      { status: 500 }
    );
  }
}
