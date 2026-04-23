import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

// 通过 slug 获取文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "zh";

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale },
        },
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    // 如果指定语言不存在，尝试获取默认语言
    if (article.translations.length === 0) {
      const defaultTranslation = await prisma.articleTranslation.findFirst({
        where: { articleId: article.id },
      });

      if (defaultTranslation) {
        article.translations = [defaultTranslation];
      }
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Get article by slug error:", error);
    return NextResponse.json(
      { success: false, message: "获取文章失败" },
      { status: 500 }
    );
  }
}
