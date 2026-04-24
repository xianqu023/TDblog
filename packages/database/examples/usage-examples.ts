/**
 * 多数据库连接使用示例
 * 
 * 此文件展示如何在项目中使用多数据库连接功能
 * 不要直接运行此文件
 */

import { prisma, getDatabase, initializeMultiDatabase } from '../index';

/**
 * 示例 1: 使用默认单数据库连接（向后兼容）
 */
export async function example1_singleDatabase() {
  // 使用导出的默认 prisma 实例
  const users = await prisma.user.findMany();
  console.log('用户列表:', users);

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: true },
  });
  console.log('已发布文章:', articles);
}

/**
 * 示例 2: 初始化多数据库连接
 */
export async function example2_initializeMultiDatabase() {
  // 通常在应用启动时调用一次
  initializeMultiDatabase({
    connections: {
      default: {
        url: process.env.DATABASE_URL || 'file:./prisma/blog.db',
      },
      read: {
        url: process.env.DATABASE_READ_URL || 'file:./prisma/read.db',
      },
      write: {
        url: process.env.DATABASE_WRITE_URL || 'file:./prisma/write.db',
      },
      analytics: {
        url: process.env.DATABASE_ANALYTICS_URL || 'libsql://your-db.turso.io',
        authToken: process.env.DATABASE_ANALYTICS_AUTH_TOKEN,
      },
    },
    defaultConnection: 'default',
  });
}

/**
 * 示例 3: 使用多数据库连接 - 读写分离
 */
export async function example3_readWriteSeparation() {
  const readDb = getDatabase('read');
  const writeDb = getDatabase('write');

  // 从读库获取数据
  const articles = await readDb.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });

  // 写入操作使用写库
  for (const article of articles) {
    await writeDb.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return articles;
}

/**
 * 示例 4: 使用多数据库连接 - 数据分析
 */
export async function example4_analytics() {
  const mainDb = getDatabase('default');
  const analyticsDb = getDatabase('analytics');

  // 从主库获取基础数据
  const articles = await mainDb.article.findMany({
    select: { id: true, title: true, createdAt: true },
  });

  // 在分析库执行复杂查询
  const stats = await analyticsDb.$queryRaw`
    SELECT 
      DATE(viewed_at) as date,
      COUNT(*) as views,
      COUNT(DISTINCT user_id) as unique_visitors
    FROM article_views
    WHERE viewed_at >= datetime('now', '-30 days')
    GROUP BY DATE(viewed_at)
    ORDER BY date DESC
  `;

  return { articles, stats };
}

/**
 * 示例 5: 在 Next.js API Route 中使用
 */
export async function example5_nextjsApiRoute() {
  // app/api/articles/route.ts
  try {
    const db = getDatabase('read');
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: { username: true, profile: true },
        },
        tags: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    return Response.json({ articles });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

/**
 * 示例 6: 在 React Server Component 中使用
 */
export async function example6_serverComponent() {
  // app/articles/page.tsx
  const db = getDatabase('read');
  const articles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
  });

  // JSX 示例（伪代码）:
  // return (
  //   <div>
  //     <h1>Articles</h1>
  //     <ul>
  //       {articles.map((article) => (
  //         <li key={article.id}>{article.title}</li>
  //       ))}
  //     </ul>
  //   </div>
  // );
  
  return articles;
}

/**
 * 示例 7: 使用事务（跨数据库不支持，单数据库支持）
 */
export async function example7_transaction() {
  const db = getDatabase('default');

  try {
    await db.$transaction(async (tx: any) => {
      // 创建文章
      const article = await tx.article.create({
        data: {
          slug: 'new-article',
          title: 'New Article',
          authorId: 'author-id',
          status: 'DRAFT',
        },
      });

      // 创建标签关联
      await tx.articleTag.create({
        data: {
          articleId: article.id,
          tagId: 'tag-id',
        },
      });

      return article;
    });

    console.log('事务执行成功');
  } catch (error) {
    console.error('事务执行失败:', error);
    throw error;
  }
}

/**
 * 示例 8: 连接管理和清理
 */
export async function example8_connectionManagement() {
  const { disconnectDatabase, disconnectAllDatabases } = await import('../index.js');

  // 断开特定连接
  await disconnectDatabase('read');

  // 断开所有连接（应用关闭时）
  await disconnectAllDatabases();
}

/**
 * 示例 9: 在 Next.js 应用启动时初始化
 */
export function example9_nextjsAppInitialization() {
  // app/layout.tsx 或 middleware.ts
  // import('@/lib/database').then(({ setupDatabase }) => {
  //   setupDatabase();
  // });
  console.log('Initialize database in Next.js app');
}

/**
 * 示例 10: 检查连接状态
 */
export function example10_checkConnectionStatus() {
  const { dbManager } = require('../index.js');

  // 获取所有活跃连接
  const connections = dbManager.getConnectionNames();
  console.log('活跃连接:', connections);

  // 检查特定连接是否存在
  const hasReadConnection = dbManager.hasConnection('read');
  console.log('是否有读库连接:', hasReadConnection);
}

/**
 * 实际使用场景：博客文章服务
 */
export class ArticleService {
  private readDb;
  private writeDb;

  constructor() {
    this.readDb = getDatabase('read');
    this.writeDb = getDatabase('write');
  }

  async getPublishedArticles(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.readDb.article.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { username: true, profile: true },
          },
          tags: true,
        },
      }),
      this.readDb.article.count({
        where: { status: 'PUBLISHED' },
      }),
    ]);

    return {
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getArticleBySlug(slug: string) {
    return this.readDb.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: true,
          },
        },
        tags: true,
        comments: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { username: true, profile: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async incrementViewCount(articleId: string) {
    return this.writeDb.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async createArticle(data: {
    slug: string;
    title: string;
    content: string;
    authorId: string;
  }) {
    return this.writeDb.article.create({
      data,
    });
  }

  async updateArticle(id: string, data: any) {
    return this.writeDb.article.update({
      where: { id },
      data,
    });
  }
}

/**
 * 实际使用场景：分析服务
 */
export class AnalyticsService {
  private analyticsDb;
  private mainDb;

  constructor() {
    this.analyticsDb = getDatabase('analytics');
    this.mainDb = getDatabase('default');
  }

  async trackArticleView(articleId: string, userId?: string, ipAddress?: string) {
    return this.analyticsDb.articleView.create({
      data: {
        articleId,
        userId,
        ipAddress,
        viewedAt: new Date(),
      },
    });
  }

  async getArticleStats(articleId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.analyticsDb.$queryRaw`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT user_id) as unique_visitors,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM article_views
      WHERE article_id = ${articleId}
      AND viewed_at >= ${startDate}
    `;

    return stats[0];
  }

  async getPopularArticles(limit = 10) {
    const popular = await this.analyticsDb.$queryRaw`
      SELECT 
        article_id,
        COUNT(*) as view_count
      FROM article_views
      WHERE viewed_at >= datetime('now', '-7 days')
      GROUP BY article_id
      ORDER BY view_count DESC
      LIMIT ${limit}
    `;

    // 获取文章详情
    const articleIds = popular.map((p: any) => p.article_id);
    const articles = await this.mainDb.article.findMany({
      where: {
        id: { in: articleIds },
      },
      include: {
        author: {
          select: { username: true, profile: true },
        },
      },
    });

    return articles.map((article: any) => ({
      ...article,
      viewCount: popular.find((p: any) => p.article_id === article.id)?.view_count || 0,
    }));
  }
}
