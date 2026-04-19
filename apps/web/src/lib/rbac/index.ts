/**
 * RBAC 权限检查工具
 */

export interface PermissionCheckOptions {
  requiredPermission: string;
  userPermissions?: string[];
}

/**
 * 检查用户是否拥有指定权限
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // 管理员拥有所有权限
  if (userPermissions.includes("*")) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
}

/**
 * 检查用户是否拥有任意一个权限
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
}

/**
 * 检查用户是否拥有所有指定权限
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((perm) => hasPermission(userPermissions, perm));
}

/**
 * 权限常量定义
 */
export const PERMISSIONS = {
  // 文章
  ARTICLE_CREATE: "article:create",
  ARTICLE_READ: "article:read",
  ARTICLE_UPDATE: "article:update",
  ARTICLE_DELETE: "article:delete",
  ARTICLE_PUBLISH: "article:publish",
  // 用户
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE: "user:manage",
  // 支付
  PAYMENT_READ: "payment:read",
  PAYMENT_REFUND: "payment:refund",
  // 设置
  SETTING_READ: "setting:read",
  SETTING_UPDATE: "setting:update",
  // 文件
  FILE_UPLOAD: "file:upload",
  FILE_DELETE: "file:delete",
  // 商城
  SHOP_MANAGE: "shop:manage",
  SHOP_READ: "shop:read",
  // 会员
  MEMBERSHIP_MANAGE: "membership:manage",
  MEMBERSHIP_READ: "membership:read",
  // SEO
  SEO_MANAGE: "seo:manage",
} as const;

/**
 * 角色常量定义
 */
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  MEMBER: "member",
  VISITOR: "visitor",
} as const;
