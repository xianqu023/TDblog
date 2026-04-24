import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@blog/database';
import { getStorage } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.filePath) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 检查用户是否有购买记录
    const download = await prisma.download.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
      include: { order: true },
    });

    if (!download) {
      return NextResponse.json({ error: '未购买此商品' }, { status: 403 });
    }

    // 检查下载次数限制
    if (product.downloadLimit > 0 && download.downloadCount >= product.downloadLimit) {
      return NextResponse.json({ error: '下载次数已达上限' }, { status: 403 });
    }

    // 更新下载次数
    await prisma.download.update({
      where: { id: download.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
      },
    });

    // 获取存储实例
    const storage = getStorage();

    // 获取文件流
    const fileStream = await storage.getFileStream(product.filePath);

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${product.name}"`);
    headers.set('Content-Type', 'application/octet-stream');

    return new Response(fileStream as any, { headers });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || '下载失败' },
      { status: 500 }
    );
  }
}
