import { prisma } from './src/index';

const categories = [
  { name: '技术教程', slug: 'tutorials', description: '编程技术、开发教程' },
  { name: '生活随笔', slug: 'life', description: '生活感悟、日常记录' },
  { name: '思考总结', slug: 'thoughts', description: '深度思考、经验总结' },
  { name: '读书笔记', slug: 'reading', description: '书籍阅读、知识整理' },
  { name: '项目实战', slug: 'projects', description: '项目经验、实战案例' },
];

const tags = [
  { name: 'React', slug: 'react', color: '#61DAFB' },
  { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
  { name: 'Next.js', slug: 'nextjs', color: '#000000' },
  { name: 'Node.js', slug: 'nodejs', color: '#339933' },
  { name: '数据库', slug: 'database', color: '#00758F' },
  { name: '前端开发', slug: 'frontend', color: '#E34F26' },
  { name: '后端开发', slug: 'backend', color: '#68A063' },
  { name: 'DevOps', slug: 'devops', color: '#FF9900' },
  { name: '人工智能', slug: 'ai', color: '#4B32C3' },
  { name: '云计算', slug: 'cloud', color: '#FF9900' },
  { name: '成长', slug: 'growth', color: '#22C55E' },
  { name: '效率', slug: 'productivity', color: '#3B82F6' },
  { name: '阅读', slug: 'reading', color: '#A855F7' },
  { name: '写作', slug: 'writing', color: '#EC4899' },
  { name: '旅行', slug: 'travel', color: '#14B8A6' },
  { name: '美食', slug: 'food', color: '#F97316' },
  { name: '电影', slug: 'movies', color: '#DC2626' },
  { name: '音乐', slug: 'music', color: '#8B5CF6' },
  { name: '摄影', slug: 'photography', color: '#06B6D4' },
  { name: '设计', slug: 'design', color: '#EC4899' },
];

const coverImages = [
  'https://picsum.photos/seed/tech1/1200/630',
  'https://picsum.photos/seed/tech2/1200/630',
  'https://picsum.photos/seed/tech3/1200/630',
  'https://picsum.photos/seed/life1/1200/630',
  'https://picsum.photos/seed/life2/1200/630',
  'https://picsum.photos/seed/nature1/1200/630',
  'https://picsum.photos/seed/nature2/1200/630',
  'https://picsum.photos/seed/code1/1200/630',
  'https://picsum.photos/seed/code2/1200/630',
  'https://picsum.photos/seed/work1/1200/630',
  'https://picsum.photos/seed/travel1/1200/630',
  'https://picsum.photos/seed/city1/1200/630',
  'https://picsum.photos/seed/book1/1200/630',
  'https://picsum.photos/seed/coffee1/1200/630',
  'https://picsum.photos/seed/desk1/1200/630',
  'https://picsum.photos/seed/night1/1200/630',
  'https://picsum.photos/seed/sunrise1/1200/630',
  'https://picsum.photos/seed/ocean1/1200/630',
  'https://picsum.photos/seed/mountain1/1200/630',
  'https://picsum.photos/seed/forest1/1200/630',
];

function generateArticleContent(topic: string, paragraphs: number = 20): string {
  let content = `# ${topic}\n\n`;
  content += `## 引言\n\n`;
  content += `在今天的数字化时代，${topic}已经成为了我们生活和工作中不可或缺的一部分。无论是对于初学者还是经验丰富的专业人士，深入理解${topic}的核心概念和最佳实践都至关重要。\n\n`;
  
  for (let i = 1; i <= paragraphs; i++) {
    content += `## 第${i}部分：深入探讨\n\n`;
    content += `${topic}的各个方面都值得我们仔细研究。从基础概念到高级应用，从理论到实践，每一个环节都蕴含着丰富的知识和经验。\n\n`;
    content += `在实际应用中，我们需要考虑多个因素。首先是技术选型，不同的场景可能需要不同的解决方案。其次是性能优化，确保系统能够高效稳定地运行。最后是用户体验，良好的用户体验是产品成功的关键。\n\n`;
    content += `让我们通过具体的例子来理解这些概念。假设我们正在构建一个现代化的应用程序，需要整合多种技术栈。在这个过程中，我们会遇到各种挑战，也会收获宝贵的经验。\n\n`;
  }
  
  content += `## 总结\n\n`;
  content += `通过本文的讨论，我们对${topic}有了更全面的认识。希望这些内容能够帮助你在实际项目中更好地应用相关知识，构建出更优秀的产品。\n\n`;
  content += `记住，学习是一个持续的过程。保持好奇心，不断探索新的技术和方法，才能在这个快速发展的领域中保持竞争力。\n`;
  
  return content;
}

const articleData = [
  { title: 'React 18 并发特性深度解析', slug: 'react-18-concurrent-features', categoryId: 'tutorials', tagNames: ['React', 'TypeScript', '前端开发'] },
  { title: 'TypeScript 高级类型技巧指南', slug: 'typescript-advanced-types', categoryId: 'tutorials', tagNames: ['TypeScript', '前端开发'] },
  { title: 'Next.js 14 服务端组件最佳实践', slug: 'nextjs-14-server-components', categoryId: 'tutorials', tagNames: ['Next.js', 'React', '后端开发'] },
  { title: 'Node.js 微服务架构设计', slug: 'nodejs-microservices-architecture', categoryId: 'tutorials', tagNames: ['Node.js', '后端开发', 'DevOps'] },
  { title: '现代数据库优化技术', slug: 'database-optimization-techniques', categoryId: 'tutorials', tagNames: ['数据库', '后端开发'] },
  { title: '前端性能优化实战', slug: 'frontend-performance-optimization', categoryId: 'projects', tagNames: ['前端开发', 'React'] },
  { title: 'DevOps 持续集成与部署', slug: 'devops-ci-cd-pipeline', categoryId: 'tutorials', tagNames: ['DevOps', '云计算'] },
  { title: '人工智能在 Web 开发中的应用', slug: 'ai-in-web-development', categoryId: 'tutorials', tagNames: ['人工智能', '前端开发'] },
  { title: '云计算平台选型指南', slug: 'cloud-platform-selection', categoryId: 'tutorials', tagNames: ['云计算', 'DevOps'] },
  { title: '全栈开发者的成长之路', slug: 'fullstack-developer-growth', categoryId: 'thoughts', tagNames: ['成长', '效率'] },
  { title: '技术人的时间管理术', slug: 'tech-time-management', categoryId: 'thoughts', tagNames: ['效率', '成长'] },
  { title: '如何保持技术敏感度', slug: 'maintaining-tech-sensitivity', categoryId: 'thoughts', tagNames: ['成长', '阅读'] },
  { title: '《代码整洁之道》读书笔记', slug: 'clean-code-reading-notes', categoryId: 'reading', tagNames: ['阅读', '写作'] },
  { title: '《设计模式》核心思想解析', slug: 'design-patterns-analysis', categoryId: 'reading', tagNames: ['阅读', '设计'] },
  { title: '技术写作的方法与技巧', slug: 'technical-writing-skills', categoryId: 'thoughts', tagNames: ['写作', '效率'] },
  { title: '独自旅行的意义', slug: 'solo-travel-meaning', categoryId: 'life', tagNames: ['旅行', '成长'] },
  { title: '城市探索：发现身边的美', slug: 'city-exploration', categoryId: 'life', tagNames: ['旅行', '摄影'] },
  { title: '美食与生活的关系', slug: 'food-and-life', categoryId: 'life', tagNames: ['美食', '生活'] },
  { title: '电影中的哲学思考', slug: 'philosophy-in-movies', categoryId: 'life', tagNames: ['电影', '思考'] },
  { title: '音乐创作的心路历程', slug: 'music-creation-journey', categoryId: 'life', tagNames: ['音乐', '创作'] },
];

async function main() {
  console.log('📝 开始生成文章数据...');

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categoryMap.set(cat.slug, existing.id);
      console.log(`✅ 分类已存在：${cat.name}`);
    } else {
      const created = await prisma.category.create({ data: cat });
      categoryMap.set(cat.slug, created.id);
      console.log(`🆕 创建分类：${cat.name}`);
    }
  }

  const tagMap = new Map<string, string>();
  for (const tag of tags) {
    const existing = await prisma.tag.findUnique({ where: { slug: tag.slug } });
    if (existing) {
      tagMap.set(tag.slug, existing.id);
      console.log(`✅ 标签已存在：${tag.name}`);
    } else {
      const created = await prisma.tag.create({ data: tag });
      tagMap.set(tag.slug, created.id);
      console.log(`🆕 创建标签：${tag.name}`);
    }
  }

  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (!admin) {
    console.error('❌ 未找到管理员账户，请先运行 seed.ts');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < articleData.length; i++) {
    const article = articleData[i];
    try {
      const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
      if (existing) {
        console.log(`⏭️  跳过：${article.title}`);
        skipped++;
        continue;
      }

      const categoryId = categoryMap.get(article.categoryId);
      if (!categoryId) continue;

      const content = generateArticleContent(article.title);
      const excerpt = `${article.title} - 深入探讨相关技术话题，分享实践经验与最佳做法。`;

      const createdArticle = await prisma.article.create({
        data: {
          authorId: admin.id,
          slug: article.slug,
          status: 'PUBLISHED',
          isPremium: false,
          coverImage: coverImages[i % coverImages.length],
          publishedAt: new Date(),
          downloadEnabled: false,
          translations: {
            create: {
              locale: 'zh',
              title: article.title,
              content,
              excerpt,
              metaTitle: article.title,
              metaDescription: excerpt,
              metaKeywords: article.tagNames.join(', '),
            },
          },
          categories: { create: { categoryId } },
        },
      });

      for (const tagName of article.tagNames) {
        const tagId = tagMap.get(tagName.toLowerCase().replace(/\s+/g, '-'));
        if (tagId) {
          await prisma.articleTag.create({ data: { articleId: createdArticle.id, tagId } });
        }
      }

      created++;
      console.log(`✅ 创建：${article.title}`);
    } catch (error) {
      console.error(`❌ 失败：${article.title}`, error);
    }
  }

  console.log('\n🎉 完成！');
  console.log(`✅ 创建：${created} 篇`);
  console.log(`⏭️  跳过：${skipped} 篇`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
