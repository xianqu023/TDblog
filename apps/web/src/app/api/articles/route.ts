import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { AIService } from "@/lib/ai/services";
import { AIConfig } from "@/lib/ai/types";

// 创建文章
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      status,
      isPremium,
      premiumPrice,
      categoryIds,
      tagNames,
      locale = "zh",
      metaTitle,
      metaDescription,
      metaKeywords,
      // 下载功能字段
      downloadEnabled,
      downloadFile,
      downloadFileName,
      downloadFileSize,
      downloadIsFree,
      downloadPrice,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, message: "标题、slug 和内容不能为空" },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        { success: false, message: "文章 slug 已存在" },
        { status: 400 }
      );
    }

    // 创建文章
    const articleStatus = status === "published" || status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const article = await prisma.article.create({
      data: {
        authorId: session.user.id,
        slug,
        status: articleStatus,
        isPremium: isPremium || false,
        premiumPrice: premiumPrice && !isNaN(parseFloat(premiumPrice)) ? parseFloat(premiumPrice) : null,
        coverImage,
        publishedAt: articleStatus === "PUBLISHED" ? new Date() : null,
        translations: {
          create: {
            locale,
            title,
            content,
            excerpt,
            metaTitle,
            metaDescription,
            metaKeywords,
          },
        },
        categories: categoryIds?.length
          ? {
              create: categoryIds.map((categoryId: string) => ({
                category: { connect: { id: categoryId } },
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });

    // 处理标签
    if (tagNames?.length) {
      for (const tagName of tagNames) {
        const slug = tagName.toLowerCase().replace(/\s+/g, "-");
        const tag = await prisma.tag.upsert({
          where: { slug },
          update: {},
          create: {
            name: tagName,
            slug,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        });

        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        });
      }
    }

    // 如果文章发布，触发自动翻译
    let translationTask = null;
    if (status === "published") {
      try {
        const setting = await prisma.setting.findUnique({
          where: { key: "ai_config" },
        });

        if (setting) {
          const config: AIConfig = JSON.parse(setting.value);

          if (config.enabled && config.features.autoTranslate) {
            const aiService = new AIService(config);
            translationTask = await aiService.translate.autoTranslateArticle(
              article.id,
              locale,
              session.user.id
            );
          }
        }
      } catch (error) {
        console.error("Auto translation failed:", error);
        // 翻译失败不影响文章发布
      }
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        status: article.status,
        translations: article.translations,
      },
      translationTaskId: translationTask?.id,
    });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "创建文章失败" },
      { status: 500 }
    );
  }
}

// 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const locale = searchParams.get("locale") || "zh";
    const categoryId = searchParams.get("categoryId");

    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get articles error:", error);
    return NextResponse.json(
      { success: false, message: "获取文章列表失败" },
      { status: 500 }
    );
  }
}
