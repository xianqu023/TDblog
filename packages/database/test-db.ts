import { prisma } from './src/index';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // 测试数据库连接
    await prisma.$connect();
    console.log('✓ Database connected successfully');
    
    // 测试查询文章
    console.log('\nTesting article query...');
    const articles = await prisma.article.findMany({
      take: 10,
      include: {
        translations: true,
        author: true
      }
    });
    
    console.log(`✓ Found ${articles.length} articles`);
    articles.forEach((article, index) => {
      const title = article.translations[0]?.title || 'No title';
      console.log(`${index + 1}. ${title} (${article.status})`);
    });
    
    // 测试 isPinned 字段
    console.log('\nTesting isPinned field...');
    const pinnedArticles = await prisma.article.findMany({
      where: {
        isPinned: true
      }
    });
    console.log(`✓ Found ${pinnedArticles.length} pinned articles`);
    
    await prisma.$disconnect();
    console.log('\n✓ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    await prisma.$disconnect();
  }
}

testDatabase();
