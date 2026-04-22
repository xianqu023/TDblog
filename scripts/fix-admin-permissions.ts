import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAdminPermissions() {
  try {
    // 查找 admin 用户
    const admin = await prisma.user.findFirst({
      where: { username: 'admin' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!admin) {
      console.log('❌ 未找到 admin 用户');
      return;
    }

    console.log(`找到 admin 用户：${admin.email}`);
    console.log(`当前角色：${admin.roles.map(ur => ur.role.name).join(', ')}`);

    // 查找或创建 admin 角色
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('创建 admin 角色...');
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: '系统管理员'
        }
      });
    }

    // 查找或创建 * 权限
    let allPermission = await prisma.permission.findUnique({
      where: { name: '*' }
    });

    if (!allPermission) {
      console.log('创建 * 通配符权限...');
      allPermission = await prisma.permission.create({
        data: {
          name: '*',
          description: '所有权限'
        }
      });
    }

    // 检查 admin 角色是否已经有 * 权限
    const existingPermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: adminRole.id,
        permissionId: allPermission.id
      }
    });

    if (!existingPermission) {
      console.log('为 admin 角色添加 * 权限...');
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: allPermission.id
        }
      });
      console.log('✅ 已添加 * 权限到 admin 角色');
    } else {
      console.log('✅ admin 角色已经拥有 * 权限');
    }

    // 检查 admin 用户是否已经有 admin 角色
    const hasAdminRole = admin.roles.some(ur => ur.roleId === adminRole!.id);
    
    if (!hasAdminRole) {
      console.log('为 admin 用户添加 admin 角色...');
      await prisma.userRole.create({
        data: {
          userId: admin.id,
          roleId: adminRole.id
        }
      });
      console.log('✅ 已添加 admin 角色到 admin 用户');
    } else {
      console.log('✅ admin 用户已经拥有 admin 角色');
    }

    console.log('\n✅ Admin 权限修复完成！');
    console.log('请重新登录以使权限生效。');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPermissions();
