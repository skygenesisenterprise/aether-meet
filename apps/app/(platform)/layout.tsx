import { AdminSidebar } from "@/components/platform/sidebar";
import { AdminHeader } from "@/components/platform/header";
import { ContextPanel } from "@/components/platform/context-panel";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="dark flex h-svh flex-col overflow-hidden bg-[#1f2022] text-foreground">
        <AdminHeader />
        <div className="flex min-h-0 flex-1">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1">
            <ContextPanel />
            <main className="min-w-0 flex-1 overflow-auto bg-[#1f2022] pb-16 md:pb-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
