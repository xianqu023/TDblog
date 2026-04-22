import AdminSidebar from "@/components/admin/AdminSidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 检查是否登录
  if (!session?.user) {
    redirect("/admin/login");
  }

  // 检查是否有管理员权限
  // 支持两种检查方式：* 通配符权限 或 user:manage 权限
  const permissions = session.user.permissions || [];
  const isAdmin = permissions.includes("*") || permissions.includes("user:manage");
  
  if (!isAdmin) {
    // 普通用户重定向到用户中心
    redirect("/user-center");
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen" style={{ backgroundColor: "var(--theme-bg-alt, #f5f6f8)" }}>
        <div className="shadow-lg" style={{ boxShadow: "var(--theme-card-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.05))" }}>
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
