import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!articleId) {
    return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
  }

  const skip = (page - 1) * limit;
  const session = await auth();
  const userId = session?.user?.id;

  // 构建查询条件
  const whereCondition: any = {
    articleId,
    parentId: null,
  };

  // 如果用户未登录，只返回非垃圾和非拒绝的评论
  // 如果用户已登录，返回所有评论（包括未审核的）
  if (!userId) {
    whereCondition.status = "PENDING";
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: whereCondition,
      include: {
        user: {
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
        replies: {
          include: {
            user: {
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
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.comment.count({
      where: whereCondition,
    }),
  ]);

  // 对于已登录用户，只保留该用户自己的评论和其他用户的非垃圾、非拒绝评论
  const filteredComments = userId 
    ? comments.filter((comment: any) => 
        comment.userId === userId || (comment.status !== "REJECTED" && comment.status !== "SPAM")
      )
    : comments;

  return NextResponse.json({
    comments: filteredComments,
    total: filteredComments.length,
    page,
    limit,
    totalPages: Math.ceil(filteredComments.length / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, content, parentId, userId } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Content too long" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        articleId,
        content,
        parentId: parentId || null,
        userId: userId || null,
        status: "PENDING",
      },
      include: {
        user: {
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
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}
