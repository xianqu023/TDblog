import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import type { Session } from "next-auth";

type AuthResult =
  | { error: string; message: string }
  | { session: Session };

/**
 * 需要认证的 API 中间件
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "未授权访问", message: "请先登录" },
      { status: 401 }
    ) as unknown as AuthResult;
  }

  return { session };
}

/**
 * 需要指定权限的 API 中间件
 */
export async function requirePermission(
  req: NextRequest,
  permission: string
): Promise<AuthResult | NextResponse> {
  const authResult = await requireAuth(req);

  if ("error" in authResult) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const { session } = authResult;

  if (!hasPermission(session.user.permissions, permission)) {
    return NextResponse.json(
      { error: "权限不足", message: "您没有执行此操作的权限" },
      { status: 403 }
    );
  }

  return { session };
}

/**
 * 需要管理员权限的 API 中间件
 */
export async function requireAdmin(req: NextRequest) {
  return requirePermission(req, "user:manage");
}
