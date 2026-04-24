import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';
import { getSiteSettings } from '@/lib/site-settings';
import { auth } from '@/lib/auth';

/**
 * 获取站点信息和当前用户信息
 * GET /api/site-info
 */
export async function GET() {
  try {
    // 获取站点设置
    const siteSettings = await getSiteSettings();
    
    // 获取当前登录用户
    const session = await auth();
    let currentUser = null;
    
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
      
      if (user) {
        currentUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.profile?.displayName || user.username,
          avatarUrl: user.profile?.avatarUrl || '',
          isAdmin: user.roles?.some((ur: any) => ur.role.name === 'ADMIN') || false,
        };
      }
    }
    
    // 获取管理员用户（用于博主卡片）
    let adminUser = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: {
              name: 'admin',
            },
          },
        },
      },
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
    
    // 如果管理员没有 profile，创建一个
    if (adminUser && !adminUser.profile) {
      const profile = await prisma.userProfile.create({
        data: {
          userId: adminUser.id,
          displayName: adminUser.username,
          bio: '热爱生活，热爱写作，分享技术与生活',
          avatarUrl: '',
          locale: 'zh',
        },
      });
      adminUser.profile = profile;
    }
    
    // 如果管理员的 displayName 是"博主"，更新为正确的值
    if (adminUser && adminUser.profile && adminUser.profile.displayName === '博主') {
      const updatedProfile = await prisma.userProfile.update({
        where: {
          userId: adminUser.id,
        },
        data: {
          displayName: adminUser.username,
          bio: adminUser.profile.bio || '热爱生活，热爱写作，分享技术与生活',
          avatarUrl: adminUser.profile.avatarUrl || '',
        },
      });
      adminUser.profile = updatedProfile;
    }
    
    // 如果没有管理员用户，使用默认信息
    const blogAuthor = adminUser ? {
      displayName: adminUser.profile?.displayName || adminUser.username,
      bio: adminUser.profile?.bio || '热爱生活，热爱写作，分享技术与生活',
      avatarUrl: adminUser.profile?.avatarUrl || siteSettings.logoUrl || '',
    } : {
      displayName: '博主',
      bio: '热爱生活，热爱写作，分享技术与生活',
      avatarUrl: siteSettings.logoUrl || '',
    };
    
    return NextResponse.json({
      success: true,
      data: {
        site: {
          siteName: siteSettings.siteName,
          siteDescription: siteSettings.siteDescription,
          logoUrl: siteSettings.logoUrl,
          siteKeywords: siteSettings.siteKeywords,
          faviconUrl: siteSettings.faviconUrl,
        },
        user: currentUser,
        blogAuthor: blogAuthor,
      },
    });
  } catch (error: any) {
    console.error('Get site info error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取站点信息失败' },
      { status: 500 }
    );
  }
}
