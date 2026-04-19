"use server";

import { prisma } from '@blog/database';
import { revalidatePath } from 'next/cache';

export interface MenuInput {
  id?: string;
  label: string;
  href: string;
  order: number;
  enabled: boolean;
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
    let savedMenu;
    
    if (menu.id) {
      // 更新
      savedMenu = await prisma.menu.update({
        where: { id: menu.id },
        data: {
          label: menu.label,
          href: menu.href,
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
          order: menu.order,
          enabled: menu.enabled,
        },
      });
    }

    revalidatePath('/admin/menus');
    revalidatePath('/');
    
    return { success: true, data: savedMenu };
  } catch (error) {
    console.error('Error saving menu:', error);
    return { success: false, error: '保存菜单失败' };
  }
}

export async function deleteMenu(id: string) {
  try {
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
