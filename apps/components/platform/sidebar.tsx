"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { usePlatform } from "@/context/PlatformContext";
import { canAccessSettings } from "@/components/settings/settings-utils";
import { cn } from "@/lib/utils";
import { defaultAetherMeetApplicationLinks, type ApplicationSidebarLink } from "@/lib/applications";
import { useChatStore } from "@/lib/chat-store";
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
  icon: ApplicationSidebarLink["icon"];
  badge?: number;
  pathname: string;
  source?: ApplicationSidebarLink["source"];
}) {
  const active = !href.includes("#") && isActiveRoute(pathname, href);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="group relative flex h-14.25 flex-col items-center justify-center gap-0.75 text-[#b6b7ba] transition-colors hover:bg-white/4 hover:text-white"
          aria-current={active ? "page" : undefined}
        >
          {active ? (
            <span className="absolute left-0 h-10 w-0.5 rounded-r-full bg-[#7775ff]" />
          ) : null}
          <span className="relative flex size-7 items-center justify-center rounded-full transition-colors">
            <Icon className="size-4.5" strokeWidth={1.7} />
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
  const { activeWorkspace, currentUser } = usePlatform();
  const customConversations = useChatStore((s) => s.customConversations);
  const conversations = useChatStore((s) => s.conversations);
  const chatUnreadCount = React.useMemo(() => {
    const customConversationIds = new Set(customConversations.map((conversation) => conversation.id));
    const mergedConversations = [
      ...customConversations,
      ...conversations.filter((conversation) => !customConversationIds.has(conversation.id)),
    ];

    return mergedConversations.reduce((total, conversation) => total + (conversation.unread ?? 0), 0);
  }, [conversations, customConversations]);
  const navItems = React.useMemo(
    () =>
      defaultAetherMeetApplicationLinks.map((item) =>
        item.href === "/chat" ? { ...item, badge: chatUnreadCount || undefined } : item
      ),
    [chatUnreadCount]
  );
  const canSeeSettings = canAccessSettings(currentUser, activeWorkspace);
  const settingsItem = navItems.find((item) => item.href === "/settings");
  const applicationsItem = navItems.find((item) => item.href === "/applications");
  const mainItems = navItems.filter((item) => !["/settings", "/applications"].includes(item.href));
  const mobileItems = navItems.filter((item) =>
    ["/notifications", "/chat", "/tasks", "/calendar", "/drive"].includes(item.href) ||
    (item.href === "/settings" && canSeeSettings)
  );

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="hidden h-full w-17 shrink-0 flex-col border-r border-white/6 bg-[#232426] text-zinc-300 md:flex">
        <nav className="flex flex-1 flex-col items-stretch overflow-y-auto pt-1" aria-label="Applications">
          {mainItems.map((item) => (
            <DesktopNavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>

        <div className="border-t border-white/5 pb-1 pt-0.5">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center text-[#9b9ca0] transition-colors hover:bg-white/4 hover:text-white"
            aria-label="Plus d’applications"
          >
            <MoreHorizontal className="size-4.5" />
          </button>

          {settingsItem && canSeeSettings ? <DesktopNavLink {...settingsItem} pathname={pathname} /> : null}

          {applicationsItem ? <DesktopNavLink {...applicationsItem} pathname={pathname} /> : null}
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-6 border-t border-white/10 bg-[#232426]/98 px-1 backdrop-blur-xl md:hidden"
        aria-label="Navigation mobile"
      >
        {mobileItems.map((item) => {
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
