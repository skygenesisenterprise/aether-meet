"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { AdminHeader } from "@/components/platform/header";
import { ContextPanel } from "@/components/platform/context-panel";
import { AdminSidebar } from "@/components/platform/sidebar";

interface PlatformShellProps {
  children: React.ReactNode;
}

export function PlatformShell({ children }: PlatformShellProps) {
  const pathname = usePathname();
  const isImmersiveRoute = pathname.startsWith("/calls/room");

  if (isImmersiveRoute) {
    return (
      <div className="dark h-svh overflow-hidden bg-[#1f2022] text-foreground">
        <main className="h-full overflow-hidden bg-[#1f2022]">{children}</main>
      </div>
    );
  }

  return (
    <div className="dark flex h-svh flex-col overflow-hidden bg-[#1f2022] text-foreground">
      <AdminHeader />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1">
          <ContextPanel />
          <main className="min-w-0 flex-1 overflow-auto bg-[#1f2022] pb-16 md:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
