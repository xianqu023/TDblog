import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

// 安全地获取 __dirname
const getDirname = (): string => {
  if (typeof import.meta.url === 'string') {
    return dirname(fileURLToPath(import.meta.url));
  }
  return resolve(process.cwd());
};

const __dirname = getDirname();
const dbPath = resolve(__dirname, 'prisma', 'blog.db');
const dbUrl = `file:${dbPath}`;

console.log(`[Database] Database path: ${dbPath}`);
console.log(`[Database] Database URL: ${dbUrl}`);

const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('开始初始化数据库...');

  // 1. 获取第一个注册用户
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    include: {
      roles: true,
    },
  });

  if (!firstUser) {
    console.log('没有找到用户，创建默认管理员账号...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        passwordHash: hashedPassword,
        roles: {
          create: {
            role: {
              connect: { name: 'admin' },
            },
          },
        },
      },
    });
    console.log(`已创建管理员账号: ${adminUser.email}`);
  } else {
    console.log(`找到用户: ${firstUser.email}`);
    
    // 检查是否有管理员角色
    const userRoles = await prisma.userRole.findMany({
      where: { userId: firstUser.id },
      include: { role: true },
    });
    const hasAdminRole = userRoles.some((r: { role: { name: string } }) => r.role.name === 'admin');
    
    if (!hasAdminRole) {
      console.log('为用户添加管理员角色...');
      const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
      });
      if (adminRole) {
        await prisma.userRole.create({
          data: {
            userId: firstUser.id,
            roleId: adminRole.id,
          },
        });
        console.log('已添加管理员角色');
      } else {
        console.log('未找到admin角色，请先创建角色');
      }
    } else {
      console.log('用户已有管理员角色');
    }
  }

  // 2. 删除默认测试账号（保留第一个用户）
  const firstUserId = firstUser?.id;
  if (firstUserId) {
    console.log('清理默认测试数据...');
    
    // 删除其他测试用户
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { not: firstUserId },
        email: { contains: 'test' },
      },
    });
    console.log(`已删除 ${deletedUsers.count} 个测试用户`);
  }

  // 3. 确保有基本的站点设置
  const settings = await prisma.setting.findMany();
  if (settings.length === 0) {
    console.log('创建默认站点设置...');
    await prisma.setting.createMany({
      data: [
        { key: 'site_name', value: 'My Blog', type: 'STRING', group: 'basic', description: '网站名称' },
        { key: 'site_description', value: 'A personal blog platform', type: 'STRING', group: 'basic', description: '网站描述' },
        { key: 'default_locale', value: 'zh', type: 'STRING', group: 'basic', description: '默认语言' },
        { key: 'site_keywords', value: 'blog, tech, life', type: 'STRING', group: 'seo', description: '网站关键词' },
        { key: 'logo_url', value: '', type: 'STRING', group: 'basic', description: '网站Logo' },
        { key: 'favicon_url', value: '', type: 'STRING', group: 'basic', description: '网站Favicon' },
      ],
    });
    console.log('已创建默认站点设置');
  }

  // 4. 确保有基本的侧边栏小工具配置
  const widgetConfig = await prisma.setting.findFirst({
    where: { key: 'widget_config' },
  });

  if (!widgetConfig) {
    console.log('创建默认侧边栏小工具配置...');
    await prisma.setting.create({
      data: {
        key: 'widget_config',
        value: JSON.stringify({
          widgets: [
            { type: 'searchBox', enabled: true, order: 1 },
            { type: 'bloggerCard', enabled: true, order: 2 },
            { type: 'categoryNav', enabled: true, order: 3 },
            { type: 'popularArticles', enabled: true, order: 4 },
            { type: 'tagCloud', enabled: true, order: 5 },
          ],
        }),
        type: 'JSON',
        group: 'widget',
        description: '侧边栏小工具配置',
      },
    });
    console.log('已创建默认侧边栏小工具配置');
  }

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
