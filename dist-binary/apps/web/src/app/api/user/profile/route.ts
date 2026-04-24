import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@blog/database';

/**
 * 获取当前用户信息
 * GET /api/user/profile
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    // 查询用户详细信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Not Found', message: '用户不存在' },
        { status: 404 }
      );
    }

    // 统计文章数量和总阅读量
    const articles = await prisma.article.findMany({
      where: { authorId: user.id },
      select: { id: true, viewCount: true },
    });

    const articleCount = articles.length;
    const totalViews = articles.reduce((sum: number, article: any) => sum + (article.viewCount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.profile?.displayName || user.username,
        bio: user.profile?.bio || '',
        avatarUrl: user.profile?.avatarUrl || '',
        articleCount,
        totalViews,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取用户信息失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新用户信息
 * PATCH /api/user/profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, bio, avatarUrl } = body;

    // 更新或创建用户资料
    const updatedProfile = await prisma.userProfile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.username,
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        locale: 'zh',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        displayName: updatedProfile.displayName,
        bio: updatedProfile.bio,
        avatarUrl: updatedProfile.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '更新用户信息失败' },
      { status: 500 }
    );
  }
}
