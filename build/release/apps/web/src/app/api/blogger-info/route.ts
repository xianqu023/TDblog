import { prisma } from "@blog/database";
import { NextResponse } from "next/server";

// GET - 获取博主信息（从第一个管理员用户获取）
export async function GET() {
  try {
    // 查找第一个管理员用户
    const adminUser = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: {
              name: "admin",
            },
          },
        },
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (adminUser && adminUser.profile) {
      return NextResponse.json({
        success: true,
        data: {
          name: adminUser.profile.displayName || adminUser.username,
          avatar: adminUser.profile.avatarUrl || "",
          bio: adminUser.profile.bio || "热爱技术，热爱生活。",
        },
      });
    }

    // 如果没有管理员用户，返回默认值
    return NextResponse.json({
      success: true,
      data: {
        name: "博主名称",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
        bio: "热爱技术，热爱生活。在这里分享我的学习笔记和心得体会。",
      },
    });
  } catch (error) {
    console.error("Failed to fetch blogger info:", error);
    return NextResponse.json(
      { error: "获取博主信息失败" },
      { status: 500 }
    );
  }
}
