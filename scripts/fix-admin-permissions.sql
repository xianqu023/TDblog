-- 修复 admin 用户权限
-- 1. 创建 * 通配符权限（如果不存在）
INSERT INTO Permission (id, name, description, createdAt, updatedAt)
SELECT 
    lower(hex(randomblob(16))),
    '*',
    '所有权限',
    datetime('now'),
    datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE name = '*');

-- 2. 创建 admin 角色（如果不存在）
INSERT INTO Role (id, name, description, createdAt, updatedAt)
SELECT 
    lower(hex(randomblob(16))),
    'admin',
    '系统管理员',
    datetime('now'),
    datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE name = 'admin');

-- 3. 为 admin 角色添加 * 权限（如果不存在）
INSERT INTO RolePermission (roleId, permissionId, createdAt, updatedAt)
SELECT 
    (SELECT id FROM Role WHERE name = 'admin'),
    (SELECT id FROM Permission WHERE name = '*'),
    datetime('now'),
    datetime('now')
WHERE NOT EXISTS (
    SELECT 1 FROM RolePermission rp
    JOIN Role r ON rp.roleId = r.id
    JOIN Permission p ON rp.permissionId = p.id
    WHERE r.name = 'admin' AND p.name = '*'
);

-- 4. 为 admin 用户添加 admin 角色（如果不存在）
INSERT INTO UserRole (userId, roleId, createdAt, updatedAt)
SELECT 
    (SELECT id FROM User WHERE username = 'admin'),
    (SELECT id FROM Role WHERE name = 'admin'),
    datetime('now'),
    datetime('now')
WHERE NOT EXISTS (
    SELECT 1 FROM UserRole ur
    JOIN User u ON ur.userId = u.id
    JOIN Role r ON ur.roleId = r.id
    WHERE u.username = 'admin' AND r.name = 'admin'
);

-- 显示结果
SELECT 
    u.username,
    u.email,
    r.name as role_name,
    p.name as permission_name
FROM User u
LEFT JOIN UserRole ur ON u.id = ur.userId
LEFT JOIN Role r ON ur.roleId = r.id
LEFT JOIN RolePermission rp ON r.id = rp.roleId
LEFT JOIN Permission p ON rp.permissionId = p.id
WHERE u.username = 'admin';
