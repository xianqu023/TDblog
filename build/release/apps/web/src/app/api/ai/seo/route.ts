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

    if (!config.features.autoSEO) {
      return NextResponse.json(
        { success: false, message: "AI SEO 功能未启用" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, summary, tags, articleId } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    const aiService = new AIService(config);

    // SEO 优化
    const result = await aiService.seo.optimizeArticle({
      title,
      content,
      summary,
      tags,
    });

    // 如果提供了 articleId，保存优化结果
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { translations: true },
      });

      if (article && article.translations.length > 0) {
        const translation = article.translations[0];
        await prisma.articleTranslation.update({
          where: { id: translation.id },
          data: {
            metaDescription: result.metaDescription,
            metaKeywords: result.metaKeywords.join(", "),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("AI SEO error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "优化失败" },
      { status: 500 }
    );
  }
}
