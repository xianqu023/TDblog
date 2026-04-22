-- 删除所有文章相关数据
DELETE FROM article_tags;
DELETE FROM article_categories;
DELETE FROM article_translations;
DELETE FROM articles;
VACUUM;