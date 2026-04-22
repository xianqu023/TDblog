import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';

// GET - 验证分享链接并获取文件信息
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    // 查找分享记录
    const share = await prisma.fileShare.findUnique({
      where: { token },
      include: {
        file: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            storagePath: true,
          },
        },
        creator: {
          select: {
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

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found', message: '分享链接不存在或已失效' },
        { status: 404 }
      );
    }

    // 检查是否过期
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: 'Share expired', message: '分享链接已过期' },
        { status: 410 }
      );
    }

    // 检查下载次数限制
    if (share.maxDownloads !== null && share.downloadCount >= share.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit reached', message: '下载次数已达上限' },
        { status: 410 }
      );
    }

    // 如果需要密码验证
    if (share.password) {
      if (!password) {
        return NextResponse.json({
          success: false,
          requiresPassword: true,
          message: '需要密码',
        });
      }

      // 简单密码验证（实际应该用 bcrypt）
      if (password !== share.password) {
        return NextResponse.json(
          { error: 'Invalid password', message: '密码错误' },
          { status: 403 }
        );
      }
    }

    // 增加下载次数
    await prisma.fileShare.update({
      where: { id: share.id },
      data: {
        downloadCount: share.downloadCount + 1,
        lastDownloadedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        file: share.file,
        sharedBy: share.creator,
        expiresAt: share.expiresAt,
        remainingDownloads: share.maxDownloads !== null 
          ? share.maxDownloads - share.downloadCount 
          : null,
      },
    });
  } catch (error) {
    console.error('Error validating share:', error);
    return NextResponse.json(
      { error: 'Failed to validate share', message: '验证分享链接失败' },
      { status: 500 }
    );
  }
}
