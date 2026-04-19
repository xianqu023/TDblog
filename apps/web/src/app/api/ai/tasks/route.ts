import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@blog/database";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const [tasks, total] = await Promise.all([
      prisma.aITask.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.aITask.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tasks: tasks.map((task) => ({
        id: task.id,
        type: task.type,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + tasks.length < total,
      },
    });
  } catch (error) {
    console.error("Get AI tasks error:", error);
    return NextResponse.json(
      { success: false, message: "获取任务列表失败" },
      { status: 500 }
    );
  }
}
