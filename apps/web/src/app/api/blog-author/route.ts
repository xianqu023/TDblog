import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';
import { getSiteSettings } from '@/lib/site-settings';

/**
 * 获取博客作者信息（管理员用户）
 * GET /api/blog-author
 */
export async function GET() {
  try {
    // 获取站点设置
    const siteSettings = await getSiteSettings();
    
    // 查询第一个管理员用户作为博客作者
    const adminUser = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: {
              name: 'ADMIN'
            }
          }
        }
      },
      include: {
        profile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!adminUser) {
      // 如果没有管理员用户，返回默认数据
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          username: '博主',
          displayName: '博主',
          bio: '热爱生活，热爱写作，分享技术与生活',
          avatarUrl: siteSettings.logoUrl || '',
          articleCount: 0,
          totalViews: 0,
          siteName: siteSettings.siteName,
          siteDescription: siteSettings.siteDescription,
          siteLogo: siteSettings.logoUrl,
        },
      });
    }

    // 统计文章总阅读量
    const articles = await prisma.article.findMany({
      where: { authorId: adminUser.id },
      select: { viewCount: true },
    });

    const totalViews = articles.reduce((sum, article) => sum + (article.viewCount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        id: adminUser.id,
        username: adminUser.username,
        displayName: adminUser.profile?.displayName || adminUser.username,
        bio: adminUser.profile?.bio || '热爱生活，热爱写作，分享技术与生活',
        avatarUrl: adminUser.profile?.avatarUrl || siteSettings.logoUrl || '',
        articleCount: adminUser._count.articles,
        totalViews,
        siteName: siteSettings.siteName,
        siteDescription: siteSettings.siteDescription,
        siteLogo: siteSettings.logoUrl,
      },
    });
  } catch (error: any) {
    console.error('Get blog author error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取博客作者信息失败' },
      { status: 500 }
    );
  }
}
