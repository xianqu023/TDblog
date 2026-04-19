import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AIConfig } from "@/lib/ai/types";
import { validateAIConfig } from "@/lib/ai/config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const config: AIConfig = body.config;

    if (!config) {
      return NextResponse.json(
        { success: false, valid: false, errors: ["配置不能为空"] },
        { status: 400 }
      );
    }

    const validation = validateAIConfig(config);

    return NextResponse.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors,
    });
  } catch (error) {
    console.error("Failed to validate AI config:", error);
    return NextResponse.json(
      { success: false, valid: false, errors: ["验证失败"] },
      { status: 500 }
    );
  }
}
