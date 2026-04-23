const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 检查数据库数据...\n');
    
    // 检查主题
    const themes = await prisma.theme.findMany();
    console.log('📋 主题数量:', themes.length);
    themes.forEach(theme => {
      console.log(`  - ${theme.name} (${theme.slug}): ${theme.enabled ? '✓' : '✗'}`);
      console.log(`    配置：${JSON.stringify(theme.config, null, 2)}`);
    });
    
    // 检查文章
    const articles = await prisma.article.count();
    console.log('\n📝 文章数量:', articles);
    
    // 检查分类
    const categories = await prisma.category.findMany();
    console.log('\n📂 分类数量:', categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.name}`);
    });
    
    // 检查标签
    const tags = await prisma.tag.findMany();
    console.log('\n🏷️  标签数量:', tags.length);
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
