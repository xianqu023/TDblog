-- 删除文章相关的所有数据
DELETE FROM article_downloads;
DELETE FROM article_tags;
DELETE FROM article_categories;
DELETE FROM article_translations;
DELETE FROM premium_access;
DELETE FROM ai_tasks WHERE article_id IS NOT NULL;
DELETE FROM articles;

-- 重置自增ID（如果需要）
VACUUM;
