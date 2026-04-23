import { NextResponse } from 'next/server';
import { prisma } from '@blog/database';
import { auth } from '@/lib/auth';

// GET - 获取文档列表
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
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
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', message: '获取文档列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新文档
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, slug, content, excerpt, categoryId, tags, status } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content required', message: '标题和内容必填' },
        { status: 400 }
      );
    }

    // 生成 slug
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-');

    // 检查 slug 是否已存在
    const existing = await prisma.document.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists', message: '别名已存在' },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt,
        categoryId,
        status: status || 'DRAFT',
        authorId: session.user.id as string,
        tags: tags ? {
          connect: tags.map((tagId: string) => ({ id: tagId })),
        } : undefined,
      },
      include: {
        category: true,
        tags: true,
        author: {
          select: {
            username: true,
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document', message: '创建文档失败' },
      { status: 500 }
    );
  }
}
