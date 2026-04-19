import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@blog/database';

/**
 * 公开可访问的设置项
 */
const PUBLIC_SETTINGS = [
  'siteName',
  'siteDescription',
  'siteKeywords',
  'logoUrl',
  'defaultLocale',
  'seoTitle',
  'seoDescription',
  'seoKeywords',
  'seoEnabled',
  'sitemapEnabled',
  'ogEnabled',
];

/**
 * 获取设置
 * GET /api/settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') === 'true';

    // 如果不是公开访问，需要登录和权限
    if (!isPublic) {
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized', message: '请先登录' },
          { status: 401 }
        );
      }

      if (!session.user.permissions?.includes('setting:read')) {
        return NextResponse.json(
          { error: 'Forbidden', message: '没有权限查看设置' },
          { status: 403 }
        );
      }
    }

    // 从数据库获取设置
    const settings = await prisma.setting.findMany(
      isPublic
        ? { where: { key: { in: PUBLIC_SETTINGS } } }
        : undefined
    );

    // 转换为对象格式
    const settingsMap: Record<string, any> = {};
    for (const setting of settings) {
      let value: any = setting.value;

      // 根据类型转换值
      switch (setting.type) {
        case 'NUMBER':
          value = Number(value);
          break;
        case 'BOOLEAN':
          value = value === 'true';
          break;
        case 'JSON':
          try {
            value = JSON.parse(value);
          } catch {
            value = {};
          }
          break;
      }

      settingsMap[setting.key] = value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取设置失败' },
      { status: 500 }
    );
  }
}

/**
 * 更新设置
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

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Bad Request', message: '请提供设置数据' },
        { status: 400 }
      );
    }

    // 定义设置的分组和类型
    const settingDefinitions: Record<string, { group: string; type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' }> = {
      // 基本设置
      siteName: { group: 'general', type: 'STRING' },
      siteDescription: { group: 'general', type: 'STRING' },
      siteKeywords: { group: 'general', type: 'STRING' },
      logoUrl: { group: 'general', type: 'STRING' },
      defaultLocale: { group: 'general', type: 'STRING' },
      postsPerPage: { group: 'general', type: 'NUMBER' },

      // SEO 设置
      seoTitle: { group: 'seo', type: 'STRING' },
      seoDescription: { group: 'seo', type: 'STRING' },
      seoKeywords: { group: 'seo', type: 'STRING' },
      seoEnabled: { group: 'seo', type: 'BOOLEAN' },
      sitemapEnabled: { group: 'seo', type: 'BOOLEAN' },
      ogEnabled: { group: 'seo', type: 'BOOLEAN' },

      // 存储设置
      storageDriver: { group: 'storage', type: 'STRING' },
      storageLocalPath: { group: 'storage', type: 'STRING' },
      storageLocalUrl: { group: 'storage', type: 'STRING' },
      storageS3Region: { group: 'storage', type: 'STRING' },
      storageS3Bucket: { group: 'storage', type: 'STRING' },
      storageS3AccessKey: { group: 'storage', type: 'STRING' },
      storageS3SecretKey: { group: 'storage', type: 'STRING' },
      storageS3Endpoint: { group: 'storage', type: 'STRING' },
      storageOssRegion: { group: 'storage', type: 'STRING' },
      storageOssBucket: { group: 'storage', type: 'STRING' },
      storageOssAccessKey: { group: 'storage', type: 'STRING' },
      storageOssSecretKey: { group: 'storage', type: 'STRING' },
      uploadMaxSize: { group: 'storage', type: 'NUMBER' },
      uploadOrganizeByDate: { group: 'storage', type: 'BOOLEAN' },
      uploadUniqueFilename: { group: 'storage', type: 'BOOLEAN' },

      // CDN 设置
      cdnEnabled: { group: 'cdn', type: 'BOOLEAN' },
      cdnProvider: { group: 'cdn', type: 'STRING' },
      cdnBaseUrl: { group: 'cdn', type: 'STRING' },
      cdnImageUrl: { group: 'cdn', type: 'STRING' },
      cdnCssUrl: { group: 'cdn', type: 'STRING' },
      cdnJsUrl: { group: 'cdn', type: 'STRING' },
      cdnPreconnect: { group: 'cdn', type: 'BOOLEAN' },
      cdnImageOptimization: { group: 'cdn', type: 'BOOLEAN' },
      cdnWebpEnabled: { group: 'cdn', type: 'BOOLEAN' },

      // 支付设置
      stripeEnabled: { group: 'payment', type: 'BOOLEAN' },
      stripeSecretKey: { group: 'payment', type: 'STRING' },
      stripeWebhookSecret: { group: 'payment', type: 'STRING' },
      paypalEnabled: { group: 'payment', type: 'BOOLEAN' },
      paypalClientId: { group: 'payment', type: 'STRING' },
      paypalClientSecret: { group: 'payment', type: 'STRING' },
      alipayEnabled: { group: 'payment', type: 'BOOLEAN' },
      alipayAppId: { group: 'payment', type: 'STRING' },
      alipayPrivateKey: { group: 'payment', type: 'STRING' },
      wechatPayEnabled: { group: 'payment', type: 'BOOLEAN' },
      wechatPayAppId: { group: 'payment', type: 'STRING' },
      wechatPayMchId: { group: 'payment', type: 'STRING' },
    };

    // 批量更新设置
    const updates = Object.entries(settings).map(([key, value]) => {
      const def = settingDefinitions[key];
      if (!def) {
        // 未知设置项，使用默认类型
        return {
          where: { key },
          update: {
            value: String(value),
            type: 'STRING',
            group: 'other',
          },
          create: {
            key,
            value: String(value),
            type: 'STRING',
            group: 'other',
          },
        };
      }

      // 根据类型转换值
      let stringValue: string;
      switch (def.type) {
        case 'BOOLEAN':
          stringValue = String(value);
          break;
        case 'NUMBER':
          stringValue = String(value);
          break;
        case 'JSON':
          stringValue = JSON.stringify(value);
          break;
        default:
          stringValue = String(value);
      }

      return {
        where: { key },
        update: {
          value: stringValue,
          type: def.type as any,
          group: def.group,
        },
        create: {
          key,
          value: stringValue,
          type: def.type as any,
          group: def.group,
        },
      };
    });

    // 执行批量更新
    for (const update of updates) {
      await prisma.setting.upsert(update);
    }

    return NextResponse.json({
      success: true,
      message: '设置已保存',
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '保存设置失败' },
      { status: 500 }
    );
  }
}

/**
 * 删除设置
 * DELETE /api/settings
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

    // 检查权限
    if (!session.user.permissions?.includes('setting:update')) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有权限修改设置' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Bad Request', message: '请提供设置键名' },
        { status: 400 }
      );
    }

    await prisma.setting.delete({
      where: { key },
    });

    return NextResponse.json({
      success: true,
      message: '设置已删除',
    });
  } catch (error: any) {
    console.error('Delete setting error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '删除设置失败' },
      { status: 500 }
    );
  }
}
