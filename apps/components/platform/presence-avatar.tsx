import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/platform-data";

interface PresenceAvatarProps {
  initials: string;
  status?: Person["status"];
  className?: string;
  fallbackClassName?: string;
}

const statusClasses: Record<NonNullable<PresenceAvatarProps["status"]>, string> = {
  online: "bg-emerald-400",
  busy: "bg-rose-500",
  away: "bg-amber-400",
  offline: "bg-muted-foreground",
};

export function PresenceAvatar({
  initials,
  status = "offline",
  className,
  fallbackClassName,
}: PresenceAvatarProps) {
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={cn("size-9 border border-border/70", className)}>
        <AvatarFallback
          className={cn(
            "bg-gradient-to-br from-primary/80 to-primary text-xs font-semibold text-primary-foreground",
            fallbackClassName
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
          statusClasses[status]
        )}
        aria-label={`Statut ${status}`}
      />
    </span>
  );
}
