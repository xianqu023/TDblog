import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.permissions?.includes("shop:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.permissions?.includes("shop:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, slug, description, price, filePath, fileSize, downloadLimit, isActive } = body;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(filePath !== undefined && { filePath }),
        ...(fileSize !== undefined && { fileSize: fileSize ? BigInt(fileSize) : null }),
        ...(downloadLimit !== undefined && { downloadLimit }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "URL标识已存在" },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "更新商品失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.permissions?.includes("shop:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "删除商品失败" },
      { status: 500 }
    );
  }
}
