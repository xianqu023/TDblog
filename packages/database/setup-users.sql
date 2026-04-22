-- 确保 admin 用户有管理员角色
INSERT OR IGNORE INTO roles (id, name, display_name, description, is_system) 
VALUES ('role-admin', 'admin', '管理员', '拥有系统所有权限', 1);

INSERT OR IGNORE INTO user_roles (userId, roleId) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'admin';

-- 创建普通用户（member 角色）
INSERT OR IGNORE INTO users (id, email, password_hash, username, status, created_at, updated_at)
SELECT 
  'user-test-001',
  'user@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu', -- 密码：password123
  'testuser',
  'ACTIVE',
  datetime('now'),
  datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'testuser');

-- 为普通用户分配 member 角色
INSERT OR IGNORE INTO user_roles (userId, roleId)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'testuser' AND r.name = 'member';

-- 创建用户资料
INSERT OR IGNORE INTO user_profiles (id, user_id, display_name, bio, locale)
SELECT 
  'profile-test-001',
  'user-test-001',
  '测试用户',
  '这是一个普通用户',
  'zh'
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = 'user-test-001');

-- 显示用户和角色
SELECT '=== 用户角色分配 ===' as info;
SELECT u.username, u.email, r.name as role, r.display_name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN roles r ON ur.roleId = r.id;

-- 显示权限
SELECT '=== 用户权限 ===' as info;
SELECT u.username, p.name as permission, p.description
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN role_permissions rp ON ur.roleId = rp.roleId
LEFT JOIN permissions p ON rp.permissionId = p.id
ORDER BY u.username, p.name;
