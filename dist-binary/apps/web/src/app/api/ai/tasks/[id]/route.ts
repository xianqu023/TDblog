import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.aITask.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "任务不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        type: task.type,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error("Get AI task error:", error);
    return NextResponse.json(
      { success: false, message: "获取任务失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.aITask.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "任务不存在" },
        { status: 404 }
      );
    }

    if (task.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "只能取消待处理的任务" },
        { status: 400 }
      );
    }

    await prisma.aITask.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "任务已取消",
    });
  } catch (error) {
    console.error("Cancel AI task error:", error);
    return NextResponse.json(
      { success: false, message: "取消任务失败" },
      { status: 500 }
    );
  }
}
