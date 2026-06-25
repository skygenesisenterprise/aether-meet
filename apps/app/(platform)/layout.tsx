import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PlatformShell } from "@/components/platform/platform-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <PlatformShell>{children}</PlatformShell>
    </ProtectedRoute>
  );
}
