"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppWindow, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { platformNavItems } from "@/lib/platform-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavLink({
  href,
  label,
  icon: Icon,
  badge,
  pathname,
}: {
  href: string;
  label: string;
  icon: (typeof platformNavItems)[number]["icon"];
  badge?: number;
  pathname: string;
}) {
  const active = isActiveRoute(pathname, href);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "group relative flex h-14.25 flex-col items-center justify-center gap-0.75 text-[#b6b7ba] transition-colors hover:bg-white/[0.035] hover:text-white",
            active && "text-[#8b89ff]"
          )}
          aria-current={active ? "page" : undefined}
        >
          {active ? (
            <span className="absolute left-0 h-10 w-0.5 rounded-r-full bg-[#7775ff]" />
          ) : null}
          <span
            className={cn(
              "relative flex size-7 items-center justify-center rounded-full transition-colors",
              active && "bg-[#5d5bd4] text-white"
            )}
          >
            <Icon className="size-4.5" strokeWidth={active ? 2.1 : 1.7} />
            {badge ? (
              <span className="absolute -right-1.5 -top-1 flex min-w-4 items-center justify-center rounded-full bg-[#5d5bd4] px-1 text-[9px] font-semibold leading-4 text-white ring-2 ring-[#0d0e10]">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="max-w-16 truncate px-0.5 text-[9px] leading-3">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const settingsItem = platformNavItems.find((item) => item.href === "/setings");
  const mainItems = platformNavItems.filter((item) => item.href !== "/setings");

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="hidden h-full w-17 shrink-0 flex-col border-r border-white/6 bg-[#0d0e10] text-zinc-300 md:flex">
        <nav className="flex flex-1 flex-col items-stretch pt-1" aria-label="Applications">
          {mainItems.map((item) => (
            <DesktopNavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>

        <div className="border-t border-white/5 pb-1 pt-0.5">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center text-[#9b9ca0] transition-colors hover:bg-white/[0.035] hover:text-white"
            aria-label="Plus d’applications"
          >
            <MoreHorizontal className="size-4.5" />
          </button>

          {settingsItem ? <DesktopNavLink {...settingsItem} pathname={pathname} /> : null}

          <button
            type="button"
            className="flex h-13 w-full flex-col items-center justify-center gap-1 text-[#b6b7ba] transition-colors hover:bg-white/[0.035] hover:text-white"
            aria-label="Applications"
          >
            <span className="flex size-7 items-center justify-center rounded-[5px] border border-current">
              <AppWindow className="size-4.25" strokeWidth={1.7} />
            </span>
            <span className="text-[9px] leading-3">Applications</span>
          </button>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-8 border-t border-white/10 bg-[#0d0e10]/98 px-1 backdrop-blur-xl md:hidden"
        aria-label="Navigation mobile"
      >
        {platformNavItems.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-1 text-[9px] text-zinc-500",
                active && "text-[#8b89ff]"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full",
                  active && "bg-[#5d5bd4] text-white"
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="max-w-full truncate px-0.5">{item.label}</span>
              {item.badge ? (
                <span className="absolute right-[18%] top-1.5 size-1.5 rounded-full bg-[#7775ff]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
