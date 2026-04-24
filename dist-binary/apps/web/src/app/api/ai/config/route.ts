import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";
import { AIConfig } from "@/lib/ai/types";
import { defaultAIConfig, validateAIConfig } from "@/lib/ai/config";

const CONFIG_KEY = "ai_config";

// 获取 AI 配置
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    const setting = await prisma.setting.findUnique({
      where: { key: CONFIG_KEY },
    });

    if (setting) {
      try {
        const config = JSON.parse(setting.value) as AIConfig;
        // 不返回 API Key 到前端
        const safeConfig = {
          ...config,
          apiKey: config.apiKey ? "***" : "",
          imageApiKey: config.imageApiKey ? "***" : "",
        };
        return NextResponse.json({ success: true, config: safeConfig });
      } catch {
        return NextResponse.json({ success: true, config: defaultAIConfig });
      }
    }

    return NextResponse.json({ success: true, config: defaultAIConfig });
  } catch (error) {
    console.error("Failed to get AI config:", error);
    return NextResponse.json({ success: false, message: "获取配置失败" }, { status: 500 });
  }
}

// 保存 AI 配置
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    // 检查权限（仅管理员可以修改）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: { include: { role: true } } },
    });

    const isAdmin = (user?.roles as any[]).some((ur: any) => ur.role.name === "admin");
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const newConfig: AIConfig = body.config;

    if (!newConfig) {
      return NextResponse.json({ success: false, message: "配置不能为空" }, { status: 400 });
    }

    // 获取现有配置以保留 API Key
    const existingSetting = await prisma.setting.findUnique({
      where: { key: CONFIG_KEY },
    });

    let existingConfig: AIConfig | null = null;
    if (existingSetting) {
      try {
        existingConfig = JSON.parse(existingSetting.value) as AIConfig;
      } catch {
        // ignore
      }
    }

    // 如果前端传的 API Key 是 ***，保留原有值
    const finalConfig: AIConfig = {
      ...newConfig,
      apiKey: newConfig.apiKey === "***" ? existingConfig?.apiKey || "" : newConfig.apiKey,
      imageApiKey:
        newConfig.imageApiKey === "***"
          ? existingConfig?.imageApiKey || ""
          : newConfig.imageApiKey,
    };

    // 验证配置
    const validation = validateAIConfig(finalConfig);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: "配置验证失败", errors: validation.errors },
        { status: 400 }
      );
    }

    // 保存配置
    await prisma.setting.upsert({
      where: { key: CONFIG_KEY },
      update: {
        value: JSON.stringify(finalConfig),
        type: "JSON",
        group: "ai",
      },
      create: {
        key: CONFIG_KEY,
        value: JSON.stringify(finalConfig),
        type: "JSON",
        group: "ai",
        description: "AI 功能配置",
      },
    });

    return NextResponse.json({ success: true, message: "配置保存成功" });
  } catch (error) {
    console.error("Failed to save AI config:", error);
    return NextResponse.json({ success: false, message: "保存配置失败" }, { status: 500 });
  }
}
