import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString(),
      status: "ok"
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { success: false, message: "Health check failed" },
      { status: 500 }
    );
  }
}
