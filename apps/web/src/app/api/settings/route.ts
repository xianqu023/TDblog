import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSiteSettings } from '@/lib/site-settings';
import { prisma } from '@blog/database';

/**
 * 获取站点基本设置
 * GET /api/settings
 */
export async function GET() {
  try {
    const settings = await getSiteSettings();
    
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取站点设置失败' },
      { status: 500 }
    );
  }
}

/**
 * 保存站点设置
 * POST /api/settings
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    // 检查权限
    if (!session.user.permissions?.includes('setting:update')) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有权限修改设置' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: 'Bad Request', message: '缺少设置数据' },
        { status: 400 }
      );
    }

    // 准备要保存的设置项
    const settingsData = [
      { key: 'site_name', value: settings.siteName, type: 'STRING' as const, group: 'site', description: '网站名称' },
      { key: 'site_description', value: settings.siteDescription, type: 'STRING' as const, group: 'site', description: '网站描述' },
      { key: 'site_keywords', value: settings.siteKeywords, type: 'STRING' as const, group: 'site', description: '网站关键词' },
      { key: 'logo_url', value: settings.logoUrl, type: 'STRING' as const, group: 'site', description: '网站 Logo' },
      { key: 'favicon_url', value: settings.faviconUrl, type: 'STRING' as const, group: 'site', description: '网站 Favicon' },
      { key: 'default_locale', value: settings.defaultLocale, type: 'STRING' as const, group: 'site', description: '默认语言' },
      { key: 'posts_per_page', value: settings.postsPerPage, type: 'NUMBER' as const, group: 'site', description: '每页文章数' },
      { key: 'seo_title', value: settings.seoTitle, type: 'STRING' as const, group: 'seo', description: 'SEO 标题' },
      { key: 'seo_description', value: settings.seoDescription, type: 'STRING' as const, group: 'seo', description: 'SEO 描述' },
      { key: 'seo_keywords', value: settings.seoKeywords, type: 'STRING' as const, group: 'seo', description: 'SEO 关键词' },
      { key: 'seo_enabled', value: settings.seoEnabled.toString(), type: 'BOOLEAN' as const, group: 'seo', description: '启用 SEO' },
      { key: 'sitemap_enabled', value: settings.sitemapEnabled.toString(), type: 'BOOLEAN' as const, group: 'seo', description: '启用 Sitemap' },
      { key: 'og_enabled', value: settings.ogEnabled.toString(), type: 'BOOLEAN' as const, group: 'seo', description: '启用 Open Graph' },
      { key: 'stripe_enabled', value: settings.stripeEnabled.toString(), type: 'BOOLEAN' as const, group: 'payment', description: '启用 Stripe' },
      { key: 'paypal_enabled', value: settings.paypalEnabled.toString(), type: 'BOOLEAN' as const, group: 'payment', description: '启用 PayPal' },
      { key: 'alipay_enabled', value: settings.alipayEnabled.toString(), type: 'BOOLEAN' as const, group: 'payment', description: '启用支付宝' },
      { key: 'wechat_pay_enabled', value: settings.wechatPayEnabled.toString(), type: 'BOOLEAN' as const, group: 'payment', description: '启用微信支付' },
    ];

    // 批量保存设置
    await Promise.all(
      settingsData.map((setting) =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            type: setting.type,
            group: setting.group,
            description: setting.description,
          },
          create: setting,
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: '设置已保存',
    });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '保存设置失败' },
      { status: 500 }
    );
  }
}
