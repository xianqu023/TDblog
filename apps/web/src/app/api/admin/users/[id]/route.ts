import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET - 获取单个用户
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user || !session.user.permissions?.includes("user:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      displayName: user.profile?.displayName || "",
      avatarUrl: user.profile?.avatarUrl || "",
      bio: user.profile?.bio || "",
      roles: (user.roles as any[]).map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName,
      })),
    },
  });
}

// PATCH - 更新用户
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user || !session.user.permissions?.includes("user:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { username, email, password, status, roleIds, displayName, avatarUrl, bio } = body;

  // 检查重复
  if (username || email) {
    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              username ? { username } : {},
              email ? { email } : {},
            ].filter((obj) => Object.keys(obj).length > 0),
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "用户名或邮箱已存在" },
        { status: 400 }
      );
    }
  }

  const updateData: any = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);
  if (status) updateData.status = status;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...updateData,
      profile: {
        upsert: {
          create: {
            displayName: displayName || "",
            avatarUrl: avatarUrl || "",
            bio: bio || "",
          },
          update: {
            displayName: displayName || "",
            avatarUrl: avatarUrl || "",
            bio: bio || "",
          },
        },
      },
      ...(roleIds && {
        roles: {
          deleteMany: {},
          create: roleIds.map((roleId: string) => ({ roleId })),
        },
      }),
    },
    include: {
      profile: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: updatedUser,
  });
}

// DELETE - 删除用户
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user || !session.user.permissions?.includes("user:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: "用户已删除",
  });
}
