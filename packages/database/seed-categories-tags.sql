-- 插入分类数据
INSERT INTO categories (id, name, slug, description) VALUES
('cat-001', '技术', 'tech', '技术相关的文章'),
('cat-002', '生活', 'life', '生活相关的文章'),
('cat-003', '旅行', 'travel', '旅行相关的文章'),
('cat-004', '美食', 'food', '美食相关的文章'),
('cat-005', '健康', 'health', '健康相关的文章'),
('cat-006', '教育', 'education', '教育相关的文章'),
('cat-007', '职场', 'career', '职场相关的文章'),
('cat-008', '科技', 'science', '科技相关的文章');

-- 插入标签数据
INSERT INTO tags (id, name, slug, color) VALUES
('tag-001', '前端开发', 'frontend', '#3b82f6'),
('tag-002', '后端开发', 'backend', '#10b981'),
('tag-003', '人工智能', 'ai', '#8b5cf6'),
('tag-004', '生活方式', 'lifestyle', '#f59e0b'),
('tag-005', '旅行攻略', 'travel-guide', '#ec4899'),
('tag-006', '美食推荐', 'food-recommendation', '#84cc16'),
('tag-007', '健康生活', 'healthy-living', '#ef4444'),
('tag-008', '学习方法', 'learning-methods', '#06b6d4'),
('tag-009', '职场技能', 'career-skills', '#f97316'),
('tag-010', '科技趋势', 'tech-trends', '#14b8a6');
