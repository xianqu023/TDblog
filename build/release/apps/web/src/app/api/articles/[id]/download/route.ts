import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { headers } from "next/headers";
import { getStorage } from "@/lib/storage";

// 检查用户是否有权限下载
async function checkDownloadPermission(
  article: any,
  userId: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  // 如果下载免费，允许下载
  if (article.downloadIsFree) {
    return { allowed: true };
  }

  // 如果需要付费，检查用户是否已购买
  if (!userId) {
    return { allowed: false, reason: "需要登录后购买" };
  }

  // 检查是否是作者本人
  if (article.authorId === userId) {
    return { allowed: true };
  }

  // 检查是否已购买（通过订单系统）
  const purchase = await prisma.orderItem.findFirst({
    where: {
      articleId: article.id,
      order: {
        userId,
        status: "PAID",
      },
    },
  });

  if (purchase) {
    return { allowed: true };
  }

  // 检查是否有付费阅读权限
  const premiumAccess = await prisma.premiumAccess.findFirst({
    where: {
      articleId: article.id,
      userId,
    },
  });

  if (premiumAccess) {
    return { allowed: true };
  }

  return { allowed: false, reason: "请先购买此资源" };
}

// 获取下载信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        downloadEnabled: true,
        downloadFile: true,
        downloadFileName: true,
        downloadFileSize: true,
        downloadIsFree: true,
        downloadPrice: true,
        downloadCount: true,
        authorId: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    if (!article.downloadEnabled) {
      return NextResponse.json(
        { success: false, message: "此文章未开启下载功能" },
        { status: 400 }
      );
    }

    // 检查下载权限
    const permission = await checkDownloadPermission(article, userId);

    return NextResponse.json({
      success: true,
      download: {
        enabled: article.downloadEnabled,
        fileName: article.downloadFileName,
        fileSize: article.downloadFileSize,
        isFree: article.downloadIsFree,
        price: article.downloadPrice,
        downloadCount: article.downloadCount,
        canDownload: permission.allowed,
        permissionReason: permission.reason,
      },
    });
  } catch (error) {
    console.error("Get download info error:", error);
    return NextResponse.json(
      { success: false, message: "获取下载信息失败" },
      { status: 500 }
    );
  }
}

// 执行下载
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        downloadEnabled: true,
        downloadFile: true,
        downloadFileName: true,
        downloadIsFree: true,
        downloadCount: true,
        authorId: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    if (!article.downloadEnabled || !article.downloadFile) {
      return NextResponse.json(
        { success: false, message: "此文章未开启下载功能" },
        { status: 400 }
      );
    }

    // 检查下载权限
    const permission = await checkDownloadPermission(article, userId);

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.reason || "无下载权限" },
        { status: 403 }
      );
    }

    // 记录下载
    await prisma.articleDownload.create({
      data: {
        articleId: id,
        userId,
        ipAddress,
        userAgent,
      },
    });

    // 更新下载计数
    await prisma.article.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // 返回下载链接
    return NextResponse.json({
      success: true,
      downloadUrl: article.downloadFile,
      fileName: article.downloadFileName,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, message: "下载失败" },
      { status: 500 }
    );
  }
}

// 直接流式下载文件
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id || null;

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        downloadEnabled: true,
        downloadFile: true,
        downloadFileName: true,
        downloadFileSize: true,
        downloadIsFree: true,
        downloadCount: true,
        authorId: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, message: "文章不存在" },
        { status: 404 }
      );
    }

    if (!article.downloadEnabled || !article.downloadFile) {
      return NextResponse.json(
        { success: false, message: "此文章未开启下载功能" },
        { status: 400 }
      );
    }

    // 检查下载权限
    const permission = await checkDownloadPermission(article, userId);

    if (!permission.allowed) {
      return NextResponse.json(
        { success: false, message: permission.reason || "无下载权限" },
        { status: 403 }
      );
    }

    // 获取存储实例
    const storage = getStorage();

    // 从 URL 中提取文件 key
    const fileUrl = article.downloadFile;
    const urlObj = new URL(fileUrl);
    const fileKey = urlObj.pathname.replace(/^\/uploads\//, "");

    // 获取文件流
    const fileStream = await storage.getFileStream(fileKey);

    // 记录下载
    await prisma.articleDownload.create({
      data: {
        articleId: id,
        userId,
        ipAddress,
        userAgent,
      },
    });

    // 更新下载计数
    await prisma.article.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // 设置响应头
    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(article.downloadFileName || "download")}"`
    );
    responseHeaders.set("Content-Type", "application/octet-stream");
    if (article.downloadFileSize) {
      responseHeaders.set("Content-Length", article.downloadFileSize.toString());
    }

    return new Response(fileStream as unknown as ReadableStream, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Stream download error:", error);
    return NextResponse.json(
      { success: false, message: "下载失败" },
      { status: 500 }
    );
  }
}
