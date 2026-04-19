import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStorage } from '@/lib/storage';
import { prisma } from '@blog/database';

/**
 * 获取文件列表
 * GET /api/files
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // 构建查询条件
    const where: any = {};

    // 非管理员只能看到自己的文件
    if (!session.user.permissions?.includes('file:delete')) {
      where.userId = session.user.id;
    }

    // 按类型筛选
    if (type) {
      where.mimeType = { startsWith: type };
    }

    // 搜索文件名
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 查询总数
    const total = await prisma.media.count({ where });

    // 查询文件列表
    const files = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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

    // 获取存储实例以生成 URL
    const storage = getStorage();

    // 格式化响应数据
    const formattedFiles = files.map((file) => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: Number(file.fileSize),
      url: storage.getUrl(file.storagePath),
      storageDriver: file.storageDriver,
      createdAt: file.createdAt,
      user: file.user,
    }));

    return NextResponse.json({
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取文件列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 批量删除文件
 * DELETE /api/files
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: '请提供要删除的文件 ID' },
        { status: 400 }
      );
    }

    // 查询文件信息
    const files = await prisma.media.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Not Found', message: '文件不存在' },
        { status: 404 }
      );
    }

    // 检查权限（只能删除自己的文件，除非有 file:delete 权限）
    const canDeleteAny = session.user.permissions?.includes('file:delete');
    const unauthorizedFiles = files.filter((f) => f.userId !== session.user.id);

    if (unauthorizedFiles.length > 0 && !canDeleteAny) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有权限删除部分文件' },
        { status: 403 }
      );
    }

    // 获取存储实例
    const storage = getStorage();

    // 从存储中删除文件
    for (const file of files) {
      try {
        await storage.delete(file.storagePath);
      } catch (error) {
        console.error(`Failed to delete file from storage: ${file.storagePath}`, error);
        // 继续删除其他文件，不中断流程
      }
    }

    // 从数据库中删除记录
    await prisma.media.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        deleted: files.length,
      },
    });
  } catch (error: any) {
    console.error('Delete files error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '删除文件失败' },
      { status: 500 }
    );
  }
}
