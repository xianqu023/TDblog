import { prisma } from './index';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 开始初始化数据库种子数据...');

  // 1. 创建系统角色
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        displayName: '管理员',
        description: '拥有系统所有权限',
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'editor' },
      update: {},
      create: {
        name: 'editor',
        displayName: '编辑',
        description: '可以创建和编辑文章',
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'member' },
      update: {},
      create: {
        name: 'member',
        displayName: '会员',
        description: '可以访问会员专属内容',
        isSystem: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'visitor' },
      update: {},
      create: {
        name: 'visitor',
        displayName: '访客',
        description: '只能访问公开内容',
        isSystem: true,
      },
    }),
  ]);

  console.log('✅ 角色创建完成');

  // 2. 创建权限
  const permissions = [
    // 文章权限
    { name: 'article:create', resource: 'article', action: 'create', description: '创建文章' },
    { name: 'article:read', resource: 'article', action: 'read', description: '读取文章' },
    { name: 'article:update', resource: 'article', action: 'update', description: '更新文章' },
    { name: 'article:delete', resource: 'article', action: 'delete', description: '删除文章' },
    { name: 'article:publish', resource: 'article', action: 'publish', description: '发布文章' },
    // 用户权限
    { name: 'user:read', resource: 'user', action: 'read', description: '读取用户' },
    { name: 'user:update', resource: 'user', action: 'update', description: '更新用户' },
    { name: 'user:delete', resource: 'user', action: 'delete', description: '删除用户' },
    { name: 'user:manage', resource: 'user', action: 'manage', description: '管理用户' },
    // 支付权限
    { name: 'payment:read', resource: 'payment', action: 'read', description: '读取支付记录' },
    { name: 'payment:refund', resource: 'payment', action: 'refund', description: '退款' },
    // 设置权限
    { name: 'setting:read', resource: 'setting', action: 'read', description: '读取设置' },
    { name: 'setting:update', resource: 'setting', action: 'update', description: '更新设置' },
    // 文件权限
    { name: 'file:upload', resource: 'file', action: 'upload', description: '上传文件' },
    { name: 'file:delete', resource: 'file', action: 'delete', description: '删除文件' },
    // 商城权限
    { name: 'shop:manage', resource: 'shop', action: 'manage', description: '管理商城' },
    { name: 'shop:read', resource: 'shop', action: 'read', description: '查看商城' },
    // 会员权限
    { name: 'membership:manage', resource: 'membership', action: 'manage', description: '管理会员' },
    { name: 'membership:read', resource: 'membership', action: 'read', description: '查看会员' },
    // SEO 权限
    { name: 'seo:manage', resource: 'seo', action: 'manage', description: '管理 SEO' },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((perm) =>
      prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      })
    )
  );

  console.log('✅ 权限创建完成');

  // 3. 分配权限给角色
  // 管理员拥有所有权限
  await Promise.all(
    createdPermissions.map((perm) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roles[0].id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: roles[0].id,
          permissionId: perm.id,
        },
      })
    )
  );

  // 编辑拥有文章和文件权限
  const editorPermissions = createdPermissions.filter(
    (p) =>
      p.resource === 'article' ||
      p.resource === 'file' ||
      p.name === 'shop:read' ||
      p.name === 'membership:read'
  );

  await Promise.all(
    editorPermissions.map((perm) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roles[1].id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: roles[1].id,
          permissionId: perm.id,
        },
      })
    )
  );

  // 会员可以读取文章和会员内容
  const memberPermissions = createdPermissions.filter(
    (p) => p.name === 'article:read' || p.name === 'shop:read'
  );

  await Promise.all(
    memberPermissions.map((perm) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roles[2].id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: roles[2].id,
          permissionId: perm.id,
        },
      })
    )
  );

  // 访客只能读取公开文章
  const visitorPermissions = createdPermissions.filter((p) => p.name === 'article:read');

  await Promise.all(
    visitorPermissions.map((perm) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roles[3].id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: roles[3].id,
          permissionId: perm.id,
        },
      })
    )
  );

  console.log('✅ 角色权限分配完成');

  // 4. 创建默认管理员账户
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      username: 'admin',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: '系统管理员',
          locale: 'zh',
        },
      },
    },
  });

  // 分配管理员角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: roles[0].id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: roles[0].id,
    },
  });

  console.log('✅ 管理员账户创建完成');
  console.log('   邮箱: admin@example.com');
  console.log('   密码: admin123');

  // 5. 创建默认网站设置
  const defaultSettings = [
    { key: 'site_name', value: 'My Blog', type: 'STRING', group: 'site', description: '网站名称' },
    { key: 'site_description', value: 'A personal blog platform', type: 'STRING', group: 'site', description: '网站描述' },
    { key: 'site_keywords', value: 'blog,articles,tech', type: 'STRING', group: 'site', description: '网站关键词' },
    { key: 'default_locale', value: 'zh', type: 'STRING', group: 'site', description: '默认语言' },
    { key: 'posts_per_page', value: '10', type: 'NUMBER', group: 'site', description: '每页文章数' },
    { key: 'seo_enabled', value: 'true', type: 'BOOLEAN', group: 'seo', description: '启用 SEO' },
    { key: 'sitemap_enabled', value: 'true', type: 'BOOLEAN', group: 'seo', description: '启用 Sitemap' },
    { key: 'og_enabled', value: 'true', type: 'BOOLEAN', group: 'seo', description: '启用 Open Graph' },
    { key: 'stripe_enabled', value: 'false', type: 'BOOLEAN', group: 'payment', description: '启用 Stripe' },
    { key: 'paypal_enabled', value: 'false', type: 'BOOLEAN', group: 'payment', description: '启用 PayPal' },
    { key: 'alipay_enabled', value: 'false', type: 'BOOLEAN', group: 'payment', description: '启用支付宝' },
    { key: 'wechat_pay_enabled', value: 'false', type: 'BOOLEAN', group: 'payment', description: '启用微信支付' },
  ];

  await Promise.all(
    defaultSettings.map((setting) =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    )
  );

  console.log('✅ 默认网站设置创建完成');

  // 6. 创建默认会员计划
  const memberships = await Promise.all([
    prisma.membership.upsert({
      where: { id: 'free' },
      update: {},
      create: {
        id: 'free',
        name: '免费版',
        description: '基础功能',
        price: 0,
        durationDays: 365,
        features: JSON.stringify(['阅读公开文章', '基础评论']),
        isActive: true,
      },
    }),
    prisma.membership.upsert({
      where: { id: 'pro' },
      update: {},
      create: {
        id: 'pro',
        name: '专业版',
        description: '高级功能',
        price: 99.00,
        durationDays: 365,
        features: JSON.stringify(['阅读所有文章', '付费下载', '专属内容', '优先支持']),
        isActive: true,
      },
    }),
  ]);

  console.log('✅ 会员计划创建完成');

  console.log('\n🎉 数据库种子初始化完成!');
}

main()
  .catch((e) => {
    console.error('❌ 种子初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
