-- 查询用户数据
SELECT 'Users' as type, id, email, name FROM users
UNION ALL
-- 查询文章数量
SELECT 'Articles' as type, CAST(COUNT(*) as TEXT) as id, '' as email, '' as name FROM articles;
