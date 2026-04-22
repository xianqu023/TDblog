-- 插入测试文章
INSERT INTO articles (id, author_id, slug, status, is_premium, cover_image, published_at, view_count, created_at, updated_at) 
VALUES 
  ('article-001', 'admin-uuid-001', 'welcome-to-my-blog', 'PUBLISHED', 0, 'https://picsum.photos/800/600', datetime('now'), 0, datetime('now'), datetime('now')),
  ('article-002', 'admin-uuid-001', 'my-first-tech-stack', 'PUBLISHED', 0, 'https://picsum.photos/800/601', datetime('now'), 0, datetime('now'), datetime('now')),
  ('article-003', 'admin-uuid-001', 'life-philosophy', 'PUBLISHED', 0, 'https://picsum.photos/800/602', datetime('now'), 0, datetime('now'), datetime('now'));

-- 插入文章翻译
INSERT INTO article_translations (id, article_id, locale, title, excerpt, content) 
VALUES 
  ('trans-001', 'article-001', 'zh', '欢迎来到我的博客', '这是我的第一篇博客文章，记录生活与技术', '欢迎来到我的博客！这是我的第一篇博客文章。'),
  ('trans-002', 'article-002', 'zh', '我的技术栈分享', '分享我常用的技术栈和开发工具', '作为一名开发者，我常用的技术栈包括...'),
  ('trans-003', 'article-003', 'zh', '生活哲学', '关于生活的思考和感悟', '生活就像一场旅行，重要的不是目的地...');
