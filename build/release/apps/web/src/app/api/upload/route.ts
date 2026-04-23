import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStorage, isAllowedMimeType, isAllowedFileSize, getFileCategory } from '@/lib/storage';
import { prisma } from '@blog/database';

/**
 * 文件上传 API
 * POST /api/upload
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    // 检查权限
    if (!session.user.permissions?.includes('file:upload')) {
      return NextResponse.json(
        { error: 'Forbidden', message: '没有上传权限' },
        { status: 403 }
      );
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const checkDuplicate = formData.get('checkDuplicate') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'Bad Request', message: '请选择要上传的文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: 'Bad Request', message: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (!isAllowedFileSize(file.size)) {
      const maxSizeMB = Math.floor(parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '104857600') / 1024 / 1024);
      return NextResponse.json(
        { error: 'Bad Request', message: `文件大小超过限制 (最大 ${maxSizeMB}MB)` },
        { status: 400 }
      );
    }

    // 检查重复文件（基于文件名和大小）
    if (checkDuplicate) {
      const existingMedia = await prisma.media.findFirst({
        where: {
          originalName: file.name,
          fileSize: BigInt(file.size),
          mimeType: file.type,
        },
      });

      if (existingMedia) {
        const storage = getStorage();
        const url = storage.getUrl(existingMedia.storagePath);
        
        return NextResponse.json({
          success: true,
          data: {
            id: existingMedia.id,
            key: existingMedia.storagePath,
            url,
            size: Number(existingMedia.fileSize),
            mimeType: existingMedia.mimeType,
            category: getFileCategory(existingMedia.mimeType),
            createdAt: existingMedia.createdAt,
            isDuplicate: true,
          },
        });
      }
    }

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());

    // 获取存储实例
    const storage = getStorage();

    // 上传文件
    const result = await storage.upload(buffer, file.name, {
      contentType: file.type,
      metadata: {
        uploadedBy: session.user.id,
        originalName: file.name,
      },
      isPublic: true,
    });

    // 保存到数据库
    const media = await prisma.media.create({
      data: {
        userId: session.user.id,
        filename: result.key.split('/').pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        fileSize: BigInt(file.size),
        storagePath: result.key,
        storageDriver: getStorageDriver(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: media.id,
        key: result.key,
        url: result.url,
        size: file.size,
        mimeType: file.type,
        category: getFileCategory(file.type),
        createdAt: media.createdAt,
        isDuplicate: false,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '上传失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取当前存储驱动类型
 */
function getStorageDriver(): 'LOCAL' | 'S3' | 'OSS' {
  const driver = process.env.STORAGE_DRIVER || 'local';
  switch (driver) {
    case 's3':
      return 'S3';
    case 'oss':
      return 'OSS';
    default:
      return 'LOCAL';
  }
}

/**
 * 获取预签名上传 URL（用于前端直传）
 * GET /api/upload/presigned
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType') || 'application/octet-stream';

    if (!filename) {
      return NextResponse.json(
        { error: 'Bad Request', message: '请提供文件名' },
        { status: 400 }
      );
    }

    // 获取存储实例
    const storage = getStorage();

    // 生成存储键
    const { generateStorageKey } = await import('@/lib/storage/config');
    const key = generateStorageKey(filename);

    // 获取预签名 URL（仅 S3 和 OSS 支持）
    let presignedData: { url: string; fields?: Record<string, string> } | null = null;

    if ('getPresignedUploadUrl' in storage) {
      // @ts-ignore
      presignedData = await storage.getPresignedUploadUrl(key, contentType, 3600);
    }

    if (!presignedData) {
      return NextResponse.json(
        { error: 'Not Supported', message: '当前存储驱动不支持预签名上传' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        key,
        url: presignedData.url,
        fields: presignedData.fields,
      },
    });
  } catch (error: any) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || '获取预签名 URL 失败' },
      { status: 500 }
    );
  }
}
