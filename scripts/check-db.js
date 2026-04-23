const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('📊 检查数据库...\n');
    
    // 检查主题
    const themes = await prisma.theme.findMany();
    console.log('📋 主题数量:', themes.length);
    if (themes.length > 0) {
      console.log('主题列表:');
      themes.forEach(theme => {
        console.log(`  - ${theme.name} (${theme.themeId}): ${theme.enabled ? '✓ 启用' : '✗ 禁用'}`);
      });
    }
    
    // 检查主题配置
    const themeConfigs = await prisma.themeConfig.findMany();
    console.log('\n⚙️  主题配置数量:', themeConfigs.length);
    
    // 检查网站设置
    const siteSettings = await prisma.siteSetting.findMany();
    console.log('\n🌐 网站设置数量:', siteSettings.length);
    if (siteSettings.length > 0) {
      const setting = siteSettings[0];
      console.log('  网站名称:', setting.siteName);
      console.log('  网站描述:', setting.siteDescription);
    }
    
    // 检查文章
    const articles = await prisma.article.count();
    console.log('\n📝 文章数量:', articles);
    
    // 检查分类
    const categories = await prisma.category.count();
    console.log('📂 分类数量:', categories);
    
    // 检查标签
    const tags = await prisma.tag.count();
    console.log('🏷️  标签数量:', tags);
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
