import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { AIService } from "@/lib/ai/services";
import { AIConfig } from "@/lib/ai/types";

// 获取单个文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "zh";

    const article = await prisma.article.findUnique({
      where: { id },
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
        where: { articleId: id },
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
    console.error("Get article error:", error);
    return NextResponse.json(
      { success: false, message: "获取文章失败" },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { id } = await params;
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
      // 下载功能数据
      downloadEnabled,
      downloadFile,
      downloadFileName,
      downloadFileSize,
      downloadIsFree,
      downloadPrice,
    } = body;

    // 获取原文章
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    // 检查权限
    if (existingArticle.authorId !== session.user.id) {
      // 检查是否是管理员
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { roles: { include: { role: true } } },
      });
      const isAdmin = (user?.roles as any[]).some((ur: any) => ur.role.name === "admin");
      if (!isAdmin) {
        return NextResponse.json({ success: false, message: "无权限" }, { status: 403 });
      }
    }

    // 检查 slug 是否冲突
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await prisma.article.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { success: false, message: "文章 slug 已存在" },
          { status: 400 }
        );
      }
    }

    const wasPublished = existingArticle.status === "PUBLISHED";
    const isNowPublished = status === "PUBLISHED";

    // 更新文章
    const article = await prisma.article.update({
      where: { id },
      data: {
        slug: slug || undefined,
        status: status ? status.toUpperCase() : undefined,
        isPremium: isPremium !== undefined ? isPremium : undefined,
        premiumPrice: premiumPrice !== undefined && premiumPrice !== '' && !isNaN(parseFloat(premiumPrice)) ? parseFloat(premiumPrice) : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        publishedAt: !wasPublished && isNowPublished ? new Date() : undefined,
        // 下载功能数据
        downloadEnabled: downloadEnabled !== undefined ? downloadEnabled : undefined,
        downloadFile: downloadEnabled !== undefined ? (downloadEnabled ? downloadFile : null) : undefined,
        downloadFileName: downloadEnabled !== undefined ? (downloadEnabled ? downloadFileName : null) : undefined,
        downloadFileSize: downloadEnabled !== undefined ? (downloadEnabled ? downloadFileSize : null) : undefined,
        downloadIsFree: downloadEnabled !== undefined ? (downloadEnabled ? downloadIsFree : true) : undefined,
        downloadPrice: downloadEnabled !== undefined ? (downloadEnabled && !downloadIsFree ? parseFloat(downloadPrice) : null) : undefined,
      },
    });

    // 更新或创建翻译
    const existingTranslation = (existingArticle.translations as any[]).find(
      (t: any) => t.locale === locale
    );

    if (existingTranslation) {
      await prisma.articleTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          title: title || undefined,
          content: content || undefined,
          excerpt: excerpt !== undefined ? excerpt : undefined,
          metaTitle: metaTitle !== undefined ? metaTitle : undefined,
          metaDescription: metaDescription !== undefined ? metaDescription : undefined,
          metaKeywords: metaKeywords !== undefined ? metaKeywords : undefined,
        },
      });
    } else if (title && content) {
      await prisma.articleTranslation.create({
        data: {
          articleId: id,
          locale,
          title,
          content,
          excerpt,
          metaTitle,
          metaDescription,
          metaKeywords,
        },
      });
    }

    // 更新分类
    if (categoryIds) {
      await prisma.articleCategory.deleteMany({
        where: { articleId: id },
      });

      if (categoryIds.length > 0) {
        await prisma.articleCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            articleId: id,
            categoryId,
          })),
        });
      }
    }

    // 更新标签
    if (tagNames) {
      await prisma.articleTag.deleteMany({
        where: { articleId: id },
      });

      for (const tagName of tagNames) {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, "-");
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: {
            name: tagName,
            slug: tagSlug,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        });

        await prisma.articleTag.create({
          data: {
            articleId: id,
            tagId: tag.id,
          },
        });
      }
    }

    // 如果文章从草稿变为发布状态，触发自动翻译
    let translationTask = null;
    if (!wasPublished && isNowPublished) {
      try {
        const setting = await prisma.setting.findUnique({
          where: { key: "ai_config" },
        });

        if (setting) {
          const config: AIConfig = JSON.parse(setting.value);

          if (config.enabled && config.features.autoTranslate) {
            const aiService = new AIService(config);
            translationTask = await aiService.translate.autoTranslateArticle(
              id,
              locale,
              session.user.id
            );
          }
        }
      } catch (error) {
        console.error("Auto translation failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        status: article.status,
        downloadEnabled: article.downloadEnabled,
      },
      translationTaskId: translationTask?.id,
    });
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "更新文章失败" },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    // 获取原文章
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    // 检查权限
    if (existingArticle.authorId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { roles: { include: { role: true } } },
      });
      const isAdmin = (user?.roles as any[]).some((ur: any) => ur.role.name === "admin");
      if (!isAdmin) {
        return NextResponse.json({ success: false, message: "无权限" }, { status: 403 });
      }
    }

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "文章已删除",
    });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json(
      { success: false, message: "删除文章失败" },
      { status: 500 }
    );
  }
}
