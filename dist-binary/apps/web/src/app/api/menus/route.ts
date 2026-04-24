import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@blog/database';

// GET - 获取所有启用的菜单项
export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus', message: '获取菜单失败' },
      { status: 500 }
    );
  }
}

// POST - 创建或更新菜单
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, label, href, icon, order, enabled } = body;

    let menu;
    if (id) {
      // 更新
      menu = await prisma.menu.update({
        where: { id },
        data: { label, href, icon, order, enabled },
      });
    } else {
      // 创建
      menu = await prisma.menu.create({
        data: { label, href, icon, order, enabled },
      });
    }

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('Error saving menu:', error);
    return NextResponse.json(
      { error: 'Failed to save menu', message: '保存菜单失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除菜单
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id', message: '缺少菜单ID' },
        { status: 400 }
      );
    }

    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '菜单已删除' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu', message: '删除菜单失败' },
      { status: 500 }
    );
  }
}
