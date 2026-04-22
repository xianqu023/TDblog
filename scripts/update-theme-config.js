const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'packages', 'database', 'prisma', 'blog.db');
const db = sqlite3(dbPath);

const defaultConfig = {
  enabled: true,
  name: '中式双栏主题',
  version: '1.0.0',
  layout: {
    isTwoColumn: true,
    sidebarPosition: 'right',
    isStickySidebar: true,
    articleViewMode: 'card',
    enableAnimations: true,
  },
  colors: {
    primary: '#C41E3A',
    secondary: '#1A2B48',
    accent: '#B87333',
    background: '#F8F5F0',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textLight: '#666666',
    border: '#E5E5E5',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", "Microsoft YaHei", sans-serif',
    fontSize: '16px',
    lineHeight: '1.75',
  },
  sidebarWidgets: {
    authorCard: { enabled: true, order: 1, title: '关于博主' },
    hotArticles: { enabled: true, order: 2, title: '热门文章' },
    tagCloud: { enabled: true, order: 3, title: '标签云' },
    calendarArchive: { enabled: true, order: 4, title: '文章归档' },
    searchBox: { enabled: true, order: 5, title: '搜索' },
    emailSubscription: { enabled: true, order: 6, title: '订阅更新' },
    weatherWidget: { enabled: false, order: 7, title: '天气' },
    announcement: { enabled: true, order: 8, title: '公告' },
    friendLinks: { enabled: true, order: 9, title: '友情链接' },
    hotComments: { enabled: false, order: 10, title: '热门评论' },
    dailyQuote: { enabled: true, order: 11, title: '每日一句' },
    onlineTools: { enabled: false, order: 12, title: '在线工具' },
    photoGallery: { enabled: false, order: 13, title: '相册' },
  },
  adSlots: {
    topBanner: { enabled: false, type: 'adsense', size: '728x90' },
    sidebarTop: { enabled: false, type: 'adsense', size: '300x250' },
    sidebarMiddle: { enabled: false, type: 'adsense', size: '300x600' },
    articleListMiddle: { enabled: false, type: 'adsense', size: '728x90' },
    articleBottom: { enabled: false, type: 'adsense', size: '728x90' },
  },
  seo: {
    enableBaiduPush: true,
    enableGoogleIndex: true,
    autoSitemap: true,
    structuredData: true,
  },
};

try {
  const stmt = db.prepare(`
    UPDATE themes 
    SET config = ?, updated_at = datetime('now')
    WHERE slug = 'chinese-two-column'
  `);
  
  const result = stmt.run(JSON.stringify(defaultConfig));
  console.log(`✅ 成功更新 ${result.changes} 条记录`);
  console.log('配置已更新为完整的默认配置');
} catch (error) {
  console.error('❌ 更新失败:', error);
  process.exit(1);
} finally {
  db.close();
}
