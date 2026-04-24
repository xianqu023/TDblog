import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStorage } from '@/lib/storage';
import { prisma } from '@blog/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取单个文件信息
 * GET /api/files/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const file = await prisma.media.findUnique({
      where: { id },
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

    if (!file) {
      return NextResponse.json(
        { error: 'Not Found', message: '文件不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    const canViewAny = session.user.permissions?.includes('file:delete');
    if (file.userId !== session.user.id && !canViewAny) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有权限查看此文件' },
        { status: 403 }
      );
    }

    // 获取存储实例
    const storage = getStorage();

    return NextResponse.json({
      success: true,
      data: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: Number(file.fileSize),
        url: storage.getUrl(file.storagePath),
        storageDriver: file.storageDriver,
        storagePath: file.storagePath,
        createdAt: file.createdAt,
        user: file.user,
      },
    });
  } catch (error: any) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取文件信息失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除单个文件
 * DELETE /api/files/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const file = await prisma.media.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'Not Found', message: '文件不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    const canDeleteAny = session.user.permissions?.includes('file:delete');
    if (file.userId !== session.user.id && !canDeleteAny) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有权限删除此文件' },
        { status: 403 }
      );
    }

    // 获取存储实例
    const storage = getStorage();

    // 从存储中删除文件
    try {
      await storage.delete(file.storagePath);
    } catch (error) {
      console.error(`Failed to delete file from storage: ${file.storagePath}`, error);
      // 继续删除数据库记录，即使存储删除失败
    }

    // 从数据库中删除记录
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '文件已删除',
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '删除文件失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取文件下载 URL（预签名 URL）
 * POST /api/files/[id]/download
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const file = await prisma.media.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'Not Found', message: '文件不存在' },
        { status: 404 }
      );
    }

    // 检查权限
    const canDownloadAny = session.user.permissions?.includes('file:delete');
    if (file.userId !== session.user.id && !canDownloadAny) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有权限下载此文件' },
        { status: 403 }
      );
    }

    // 获取存储实例
    const storage = getStorage();

    // 获取预签名 URL（如果支持）
    let downloadUrl: string;
    try {
      downloadUrl = await storage.getSignedUrl(file.storagePath, 3600); // 1 小时有效期
    } catch {
      // 如果不支持预签名 URL，使用普通 URL
      downloadUrl = storage.getUrl(file.storagePath);
    }

    return NextResponse.json({
      success: true,
      data: {
        url: downloadUrl,
        filename: file.originalName,
        expiresIn: 3600,
      },
    });
  } catch (error: any) {
    console.error('Get download URL error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取下载链接失败' },
      { status: 500 }
    );
  }
}
