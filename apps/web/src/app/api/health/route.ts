import { NextResponse } from "next/server";
import { prisma } from "@blog/database";

export async function GET() {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: "unknown",
  };

  // 检查数据库连接
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch (error) {
    health.database = "disconnected";
    health.status = "DEGRADED";
  }

  const statusCode = health.status === "OK" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
