import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@blog/database";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.permissions?.includes("shop:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.permissions?.includes("shop:manage")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, description, price, filePath, fileSize, downloadLimit, isActive } = body;

  if (!name || !slug || !price) {
    return NextResponse.json(
      { error: "商品名称、URL标识和价格为必填项" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        filePath,
        fileSize: fileSize ? BigInt(fileSize) : null,
        downloadLimit: downloadLimit || 0,
        isActive: isActive !== undefined ? isActive : true,
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
    return NextResponse.json(
      { error: "创建商品失败" },
      { status: 500 }
    );
  }
}
