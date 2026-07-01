import * as React from "react";

import { ApplicationsCatalogContent } from "@/components/platform/applications-catalog-content";
import { ApplicationsCatalogSidebar } from "@/components/platform/applications-catalog-sidebar";

export function ApplicationsPageShell() {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#1f1f1f] text-white">
      <ApplicationsCatalogSidebar />
      <ApplicationsCatalogContent />
    </div>
  );
}
