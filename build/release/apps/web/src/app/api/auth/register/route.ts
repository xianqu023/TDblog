import { NextResponse } from "next/server";
import { prisma } from "@blog/database";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度必须在2-20个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少6位" },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.username === username ? "用户名已存在" : "邮箱已存在" },
        { status: 400 }
      );
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12);

    // 获取 visitor 角色
    const visitorRole = await prisma.role.findUnique({
      where: { name: "visitor" },
    });

    if (!visitorRole) {
      return NextResponse.json(
        { error: "系统配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        status: "ACTIVE",
        roles: {
          create: {
            roleId: visitorRole.id,
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
