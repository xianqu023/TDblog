import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Test API works!",
      data: {
        timestamp: new Date().toISOString(),
        test: "This is a test response"
      }
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { success: false, message: "Test API failed" },
      { status: 500 }
    );
  }
}
