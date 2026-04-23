import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';
import { auth } from '@/lib/auth';

// GET - 获取单个文档
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found', message: '文档不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document', message: '获取文档失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新文档
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // 检查文档是否存在
    const existing = await prisma.document.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found', message: '文档不存在' },
        { status: 404 }
      );
    }

    // 如果内容发生变化，创建版本记录
    if (body.content && body.content !== existing.content) {
      await prisma.document.update({
        where: { id },
        data: {
          version: existing.version + 1,
        },
      });

      // 保存旧版本（这里简化处理，实际应该保存到版本表）
      // 可以在 Document 模型中添加一个 versions 关系
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        categoryId: body.categoryId || null,
        status: body.status,
        publishedAt: body.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document', message: '更新文档失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除文档
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '文档已删除' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', message: '删除文档失败' },
      { status: 500 }
    );
  }
}
