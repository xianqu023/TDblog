-- 创建权限
INSERT OR IGNORE INTO permissions (id, name, resource, action, description) VALUES
  ('perm-1', 'article:create', 'article', 'create', '创建文章'),
  ('perm-2', 'article:read', 'article', 'read', '读取文章'),
  ('perm-3', 'article:update', 'article', 'update', '更新文章'),
  ('perm-4', 'article:delete', 'article', 'delete', '删除文章'),
  ('perm-5', 'article:publish', 'article', 'publish', '发布文章'),
  ('perm-6', 'user:read', 'user', 'read', '读取用户'),
  ('perm-7', 'user:update', 'user', 'update', '更新用户'),
  ('perm-8', 'user:delete', 'user', 'delete', '删除用户'),
  ('perm-9', 'user:manage', 'user', 'manage', '管理用户'),
  ('perm-10', 'setting:read', 'setting', 'read', '读取设置'),
  ('perm-11', 'setting:update', 'setting', 'update', '更新设置'),
  ('perm-12', 'file:upload', 'file', 'upload', '上传文件'),
  ('perm-13', 'file:delete', 'file', 'delete', '删除文件'),
  ('perm-14', 'shop:manage', 'shop', 'manage', '管理商城'),
  ('perm-15', 'shop:read', 'shop', 'read', '查看商城');

-- 为 admin 角色分配所有权限
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-admin-001', id FROM permissions;

-- 为 member 角色只分配基本权限（没有 user:manage）
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role-member', id FROM permissions 
WHERE name IN ('article:read', 'shop:read', 'file:upload');

-- 验证权限分配
SELECT '=== Admin 权限 ===' as info;
SELECT p.name, p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin';

SELECT '=== Member 权限 ===' as info;
SELECT p.name, p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'member';
