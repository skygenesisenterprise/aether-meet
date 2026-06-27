"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LicenseProvider } from "@/context/LicenseContext";
import { PlatformProvider } from "@/context/PlatformContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LicenseProvider>
      <AuthProvider>
        <PlatformProvider>{children}</PlatformProvider>
      </AuthProvider>
    </LicenseProvider>
  );
}
