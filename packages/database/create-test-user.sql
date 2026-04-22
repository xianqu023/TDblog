-- 清理旧数据
DELETE FROM user_roles WHERE userId = 'user-test-001';
DELETE FROM user_profiles WHERE user_id = 'user-test-001';
DELETE FROM users WHERE id = 'user-test-001';

-- 创建普通用户（member 角色）
INSERT INTO users (id, email, password_hash, username, status, created_at, updated_at)
VALUES (
  'user-test-001',
  'user@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
  'testuser',
  'ACTIVE',
  datetime('now'),
  datetime('now')
);

-- 创建用户资料
INSERT INTO user_profiles (id, user_id, display_name, bio, locale)
VALUES (
  'profile-test-001',
  'user-test-001',
  '测试用户',
  '这是一个普通用户',
  'zh'
);

-- 获取 member 角色 ID
INSERT INTO user_roles (userId, roleId)
SELECT 'user-test-001', id FROM roles WHERE name = 'member';

-- 验证
SELECT '=== 用户列表 ===' as info;
SELECT u.id, u.username, u.email, r.name as role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN roles r ON ur.roleId = r.id;
