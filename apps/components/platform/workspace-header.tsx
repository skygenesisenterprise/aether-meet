import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function WorkspaceHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: WorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-h-[62px] shrink-0 items-center justify-between gap-3 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Icon className="size-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
          {description ? <p className="truncate text-xs text-zinc-400">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
