import AdminSidebar from "@/components/admin/AdminSidebar";
import { DarkModeProvider } from "@/components/admin/DarkModeProvider";

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      <div className="flex h-screen bg-[#f5f6f8] dark:bg-[#13151a]">
        <div className="shadow-lg shadow-black/5 dark:shadow-black/20">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DarkModeProvider>
  );
}
