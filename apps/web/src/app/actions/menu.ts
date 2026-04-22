"use server";

import { prisma } from '@blog/database';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';

export interface MenuInput {
  id?: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
  enabled: boolean;
}

/**
 * 检查用户是否有菜单管理权限
 */
async function checkMenuPermission() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('请先登录');
  }

  // 检查是否有菜单管理权限 (setting:update 或 user:manage)
  const hasMenuPermission = 
    hasPermission(session.user.permissions, 'setting:update') ||
    hasPermission(session.user.permissions, 'user:manage');

  if (!hasMenuPermission) {
    throw new Error('权限不足：您没有管理菜单的权限');
  }

  return session;
}

export async function getMenus() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { order: 'asc' },
    });
    return menus;
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
}

export async function saveMenu(menu: MenuInput) {
  try {
    // 检查权限
    await checkMenuPermission();

    let savedMenu;
    
    if (menu.id) {
      // 更新
      savedMenu = await prisma.menu.update({
        where: { id: menu.id },
        data: {
          label: menu.label,
          href: menu.href,
          icon: menu.icon,
          order: menu.order,
          enabled: menu.enabled,
        },
      });
    } else {
      // 创建
      savedMenu = await prisma.menu.create({
        data: {
          label: menu.label,
          href: menu.href,
          icon: menu.icon,
          order: menu.order,
          enabled: menu.enabled,
        },
      });
    }

    revalidatePath('/admin/menus');
    revalidatePath('/');
    
    return { success: true, data: savedMenu };
  } catch (error: any) {
    console.error('Error saving menu:', error);
    return { success: false, error: error.message || '保存菜单失败' };
  }
}

export async function deleteMenu(id: string) {
  try {
    // 检查权限
    await checkMenuPermission();

    await prisma.menu.delete({
      where: { id },
    });

    revalidatePath('/admin/menus');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu:', error);
    return { success: false, error: '删除菜单失败' };
  }
}

export async function updateMenuOrder(menus: { id: string; order: number }[]) {
  try {
    // 检查权限
    await checkMenuPermission();

    await Promise.all(
      menus.map((menu) =>
        prisma.menu.update({
          where: { id: menu.id },
          data: { order: menu.order },
        })
      )
    );

    revalidatePath('/admin/menus');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating menu order:', error);
    return { success: false, error: '更新排序失败' };
  }
}
