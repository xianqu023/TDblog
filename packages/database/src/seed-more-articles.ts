import { prisma } from './index';

// 另外11篇演示文章数据，每篇包含三种语言翻译
const moreDemoArticles = [
  {
    slug: 'remote-work-productivity-tips',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1521898284481-a5a3252a18c2?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: '远程工作效率提升指南',
        excerpt: '学习如何在远程工作环境中保持高效，平衡工作与生活。',
        content: '<h2>远程工作的兴起</h2><p>远程工作已经成为新常态...</p>',
      },
      en: {
        title: 'Remote Work Productivity Guide',
        excerpt: 'Learn how to stay productive in a remote work environment...',
        content: '<h2>The Rise of Remote Work</h2><p>Remote work has become the new normal...</p>',
      },
      ja: {
        title: 'リモートワーク生産性向上ガイド',
        excerpt: 'リモートワーク環境で効率的に働く方法を学びましょう...',
        content: '<h2>リモートワークの台頭</h2><p>リモートワークは新しい常識となりました...</p>',
      },
    },
    tags: ['Remote Work', 'Productivity', 'Work-Life Balance'],
  },
  {
    slug: 'personal-finance-basics-beginners',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: '个人理财入门基础',
        excerpt: '从零开始学习个人理财，建立健康的财务习惯。',
        content: '<h2>理财的重要性</h2><p>良好的理财习惯可以帮助你实现财务自由...</p>',
      },
      en: {
        title: 'Personal Finance Basics for Beginners',
        excerpt: 'Learn personal finance from scratch and build healthy financial habits.',
        content: '<h2>The Importance of Financial Management</h2><p>Good financial habits can help you achieve financial freedom...</p>',
      },
      ja: {
        title: '初心者向けパーソナルファイナンス入門',
        excerpt: 'ゼロから個人の財務管理を学び、健全な財務習慣を構築しましょう。',
        content: '<h2>財務管理の重要性</h2><p>良好な財務習慣は財務の自由を実現するのに役立ちます...</p>',
      },
    },
    tags: ['Finance', 'Personal Finance', 'Investing'],
  },
];

// 插入更多演示文章到数据库
async function main() {
  console.log('🌱 开始插入更多演示文章...');

  let author = await prisma.user.findFirst();
  
  if (!author) {
    console.log('⚠️ 未找到用户，请先运行基础种子数据');
    return;
  }

  const allTagsSet = new Set<string>();
  moreDemoArticles.forEach(article => {
    article.tags.forEach(tag => allTagsSet.add(tag));
  });

  console.log(`📝 创建 ${allTagsSet.size} 个标签...`);
  
  const tagMap: Record<string, any> = {};
  for (const tagName of allTagsSet) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-');
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name: tagName,
        slug,
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      },
    });
    tagMap[tagName] = tag;
  }

  console.log('✅ 标签创建完成');

  let successCount = 0;
  let skipCount = 0;

  for (const articleData of moreDemoArticles) {
    const existing = await prisma.article.findUnique({
      where: { slug: articleData.slug },
    });

    if (existing) {
      console.log(`⏭️ 文章已存在，跳过: ${articleData.slug}`);
      skipCount++;
      continue;
    }

    const article = await prisma.article.create({
      data: {
        slug: articleData.slug,
        authorId: author.id,
        status: articleData.status,
        isPremium: articleData.isPremium,
        premiumPrice: articleData.premiumPrice,
        coverImage: articleData.coverImage,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              locale: 'zh',
              title: articleData.translations.zh.title,
              excerpt: articleData.translations.zh.excerpt,
              content: articleData.translations.zh.content.trim(),
            },
            {
              locale: 'en',
              title: articleData.translations.en.title,
              excerpt: articleData.translations.en.excerpt,
              content: articleData.translations.en.content.trim(),
            },
            {
              locale: 'ja',
              title: articleData.translations.ja.title,
              excerpt: articleData.translations.ja.excerpt,
              content: articleData.translations.ja.content.trim(),
            },
          ],
        },
        tags: {
          create: articleData.tags.map(tagName => ({
            tag: {
              connect: { id: tagMap[tagName].id },
            },
          })),
        },
      },
      include: {
        translations: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    console.log(`✅ 文章创建成功: ${article.slug}`);
    successCount++;
  }

  console.log('\n🎉 更多演示文章插入完成!');
  console.log(`   成功: ${successCount} 篇`);
  console.log(`   跳过: ${skipCount} 篇`);
}

main()
  .catch((e) => {
    console.error('❌ 插入更多演示文章失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
