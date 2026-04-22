-- 查询分类和标签数据
SELECT 'Categories' as type, id, slug, name FROM categories
UNION ALL
SELECT 'Tags' as type, id, slug, name FROM tags;
