"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const PLATFORM_TITLES: Record<string, string> = {
  "/notifications": "Activité",
  "/chat": "Conversations",
  "/tasks": "Tâches",
  "/projects": "Projets",
  "/teams": "Équipes",
  "/calendar": "Calendrier",
  "/calls": "Appels",
  "/drive": "Drive",
  "/documents": "Documents",
  "/contacts": "Contacts",
  "/resources": "Ressources",
  "/settings": "Réglages",
};

function getPlatformTitle(pathname: string): string {
  const matchedEntry = Object.entries(PLATFORM_TITLES).find(([route]) => pathname.startsWith(route));

  if (matchedEntry) {
    return `${matchedEntry[1]} | Aether Meet`;
  }

  return "Aether Meet";
}

export function PlatformTitleSync() {
  const pathname = usePathname();

  React.useEffect(() => {
    document.title = getPlatformTitle(pathname);
  }, [pathname]);

  return null;
}
