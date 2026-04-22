import { NextRequest, NextResponse } from "next/server";
import { prisma } from './src/index';

async function mockGetArticles() {
  try {
    console.log('Testing API endpoint...');
    
    // 模拟请求参数
    const page = 1;
    const limit = 20;
    const status = "";
    const locale = "zh";
    const categoryId = "";
    const category = "";

    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    if (category) {
      // 按分类 slug 查询
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      });

      if (categoryRecord) {
        where.categories = {
          some: {
            categoryId: categoryRecord.id,
          },
        };
      } else {
        // 分类不存在，返回空数组
        console.log('Category not found, returning empty array');
        return {
          success: true,
          articles: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { createdAt: "desc" }
        ],
        include: {
          translations: {
            where: { locale },
          },
          author: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    const result = {
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    console.log('✓ API test successful');
    console.log(`Found ${articles.length} articles out of ${total} total`);
    console.log('First article:', articles[0]?.translations[0]?.title);
    
    return result;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "获取文章列表失败",
    };
  } finally {
    await prisma.$disconnect();
  }
}

mockGetArticles().then((result) => {
  console.log('\nAPI Response:', JSON.stringify(result, null, 2));
});
