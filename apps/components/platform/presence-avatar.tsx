import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { presenceStatusClasses, type PresenceStatus } from "@/lib/presence";
import { cn } from "@/lib/utils";

interface PresenceAvatarProps {
  initials: string;
  status?: PresenceStatus;
  className?: string;
  fallbackClassName?: string;
}

export function PresenceAvatar({
  initials,
  status,
  className,
  fallbackClassName,
}: PresenceAvatarProps) {
  return (
    <span className="relative inline-flex shrink-0 self-start">
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
      {status !== undefined ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
            presenceStatusClasses[status]
          )}
          aria-label={`Statut ${status}`}
        />
      ) : null}
    </span>
  );
}
