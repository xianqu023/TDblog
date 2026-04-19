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
      roles: user.roles.map((ur) => ({
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
  if (status) updateData.status = status;
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // 更新角色
  if (roleIds && Array.isArray(roleIds)) {
    await prisma.userRole.deleteMany({ where: { userId: id } });
    if (roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map((roleId: string) => ({ userId: id, roleId })),
      });
    }
  }

  // 更新资料
  if (displayName !== undefined || avatarUrl !== undefined || bio !== undefined) {
    await prisma.userProfile.upsert({
      where: { userId: id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bio !== undefined && { bio }),
      },
      create: {
        userId: id,
        displayName: displayName || username || "",
        avatarUrl: avatarUrl || "",
        bio: bio || "",
      },
    });
  }

  return NextResponse.json({ success: true });
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

  // 不能删除自己
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "不能删除自己的账户" },
      { status: 400 }
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
