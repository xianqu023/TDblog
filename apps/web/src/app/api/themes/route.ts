import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blog/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const theme = await prisma.theme.findFirst({
        where: { slug, isActive: true },
      });
      if (!theme) {
        return NextResponse.json(
          { success: false, message: "主题不存在" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, theme });
    }

    const defaultTheme = await prisma.theme.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (defaultTheme) {
      return NextResponse.json({ success: true, theme: defaultTheme });
    }

    const firstActive = await prisma.theme.findFirst({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (firstActive) {
      return NextResponse.json({ success: true, theme: firstActive });
    }

    return NextResponse.json({ success: true, theme: null });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "获取主题失败" },
      { status: 500 }
    );
  }
}
