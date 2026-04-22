import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// GET - 获取文件的分享链接列表
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = await params;
    
    const shares = await prisma.fileShare.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
      include: {
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

    return NextResponse.json({ success: true, data: shares });
  } catch (error) {
    console.error('Error fetching file shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares', message: '获取分享链接失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新的文件分享链接
export async function POST(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = await params;
    const body = await request.json();
    const { maxDownloads, expiresAt, password } = body;

    // 验证文件存在
    const file = await prisma.media.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found', message: '文件不存在' },
        { status: 404 }
      );
    }

    // 生成分享令牌
    const token = crypto.randomBytes(32).toString('hex');
    
    // 创建分享记录
    const share = await prisma.fileShare.create({
      data: {
        fileId,
        token,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
        downloadCount: 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: password || null,
        createdBy: session.user.id as string,
      },
      include: {
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

    return NextResponse.json({ 
      success: true, 
      data: {
        ...share,
        shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/s/${token}`,
      }
    });
  } catch (error) {
    console.error('Error creating file share:', error);
    return NextResponse.json(
      { error: 'Failed to create share', message: '创建分享链接失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除分享链接
export async function DELETE(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID required', message: '分享 ID 必填' },
        { status: 400 }
      );
    }

    await prisma.fileShare.delete({
      where: { 
        id: shareId,
        fileId,
      },
    });

    return NextResponse.json({ success: true, message: '分享链接已删除' });
  } catch (error) {
    console.error('Error deleting file share:', error);
    return NextResponse.json(
      { error: 'Failed to delete share', message: '删除分享链接失败' },
      { status: 500 }
    );
  }
}
