import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET - 获取用户列表
export async function GET(request: Request) {
  const session = await auth();
  
  if (!session?.user || !session.user.permissions?.includes("user:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { username: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status) {
    where.status = status;
  }
  if (role) {
    where.roles = {
      some: {
        role: {
          name: role,
        },
      },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        roles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const formattedUsers = users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    displayName: user.profile?.displayName || user.username,
    avatarUrl: user.profile?.avatarUrl || "",
    bio: user.profile?.bio || "",
    roles: user.roles.map((ur: { role: { id: string; name: string; displayName: string } }) => ({
      id: ur.role.id,
      name: ur.role.name,
      displayName: ur.role.displayName,
    })),
    articleCount: user._count.articles,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  }));

  return NextResponse.json({
    success: true,
    data: {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

// POST - 创建用户
export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user || !session.user.permissions?.includes("user:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const body = await request.json();
  const { username, email, password, roleIds, status } = body;

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "请填写必填字段" },
      { status: 400 }
    );
  }

  // 检查重复
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "用户名或邮箱已存在" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      status: status || "ACTIVE",
      roles: {
        create: (roleIds || []).map((roleId: string) => ({ roleId })),
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: user,
  });
}
