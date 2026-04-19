import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { NextResponse } from "next/server";

// GET - 获取所有角色
export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: roles,
  });
}
