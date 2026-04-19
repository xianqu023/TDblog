import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { NextResponse } from "next/server";

// GET - 获取当前用户资料
export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      displayName: profile?.displayName || session.user.username,
      avatarUrl: profile?.avatarUrl || "",
      bio: profile?.bio || "",
      locale: profile?.locale || "zh",
    },
  });
}

// PATCH - 更新用户资料
export async function PATCH(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { displayName, avatarUrl, bio } = body;

  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bio !== undefined && { bio }),
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.username,
        avatarUrl: avatarUrl || "",
        bio: bio || "",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    );
  }
}
