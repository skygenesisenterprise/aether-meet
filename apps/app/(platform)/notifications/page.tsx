"use client";

import * as React from "react";
import { Bell, MoreHorizontal, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications, type PlatformNotification } from "@/lib/platform-notifications";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: "all" | "unread" | "mentions" | "tagged";
  label: string;
}

const sidebarFilters: FilterOption[] = [
  { id: "all", label: "Toutes" },
  { id: "unread", label: "Non lues" },
  { id: "mentions", label: "Mentions" },
];

const contentFilters: FilterOption[] = [
  { id: "unread", label: "Non lu(e)s" },
  { id: "mentions", label: "@Mentions" },
  { id: "tagged", label: "Mentions d'étiquette" },
];

function matchesFilter(notification: PlatformNotification, filter: FilterOption["id"]) {
  if (filter === "all") return true;
  if (filter === "unread") return !notification.read;
  if (filter === "mentions") return notification.title.toLowerCase().includes("mention");
  if (filter === "tagged") return false;

  return true;
}

export default function NotificationsPage() {
  const [search, setSearch] = React.useState("");
  const [sidebarFilter, setSidebarFilter] = React.useState<FilterOption["id"]>("all");
  const [contentFilter, setContentFilter] = React.useState<FilterOption["id"]>("unread");

  const sidebarNotifications = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (!matchesFilter(notification, sidebarFilter)) return false;
      if (!query) return true;

      const haystack = `${notification.title} ${notification.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search, sidebarFilter]);

  const visibleCount = React.useMemo(
    () => notifications.filter((notification) => matchesFilter(notification, contentFilter)).length,
    [contentFilter]
  );

  return (
    <div className="flex h-full min-h-0 bg-[#1f1f1f] text-[#f5f5f5]">
      <section className="flex h-full min-h-0 w-full max-w-90 shrink-0 flex-col border-r border-white/10 bg-[#191a1c]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-white">Activité</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
              aria-label="Plus d’options"
            >
              <MoreHorizontal className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
              aria-label="Ajouter"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </header>

        <div className="shrink-0 space-y-3 border-b border-white/6 px-3 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#798190]" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher"
              className="h-9 rounded-full border-white/8 bg-[#1d2127] pl-9 text-sm text-[#d7dde7] placeholder:text-[#8490a3] focus-visible:ring-[#4f6ea8]/35"
            />
          </div>

          <div className="flex gap-2">
            {sidebarFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSidebarFilter(filter.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] leading-5 text-[#9ba3ae] transition-colors",
                  sidebarFilter === filter.id
                    ? "border-[#49618c] bg-[#1d2633] text-[#7ea2de]"
                    : "border-[#373b41] hover:bg-white/5 hover:text-[#d7dde7]"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1.5 p-2">
            {sidebarNotifications.map((notification) => (
              <article
                key={notification.id}
                className="rounded-[18px] bg-[#20262f] px-3 py-3 text-left transition-colors hover:bg-[#242c38]"
              >
                <div className="flex items-start gap-3">
                  <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#22324a] text-[#86a9e7]">
                    <Bell className="size-4" strokeWidth={1.9} />
                    {!notification.read ? (
                      <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-[#8db6ff]" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold leading-5 text-[#f2f5f9]">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[#92a2ba]">
                      {notification.description}
                    </p>
                    <p className="mt-1 text-[12px] text-[#8ea0be]">{notification.time}</p>
                  </div>
                </div>
              </article>
            ))}

            {sidebarNotifications.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-white/10 bg-[#1d2024] px-4 py-6 text-center text-sm text-[#8d939d]">
                Aucune notification pour cette recherche.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </section>

      <section className="flex min-h-0 flex-1 flex-col border-r border-white/10 bg-[#1c1c1c]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <Bell className="size-4 text-[#f2f2f2]" strokeWidth={2} />
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-white">Activité</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
              aria-label="Plus d’options"
            >
              <MoreHorizontal className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
              aria-label="Rechercher"
            >
              <Search className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex shrink-0 gap-2 px-4 py-4">
          {contentFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setContentFilter(filter.id)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium leading-5 text-[#d3d7dd] transition-colors",
                contentFilter === filter.id
                  ? "border-[#6d6f73] bg-[#20252c]"
                  : "border-[#5f6368] bg-transparent hover:bg-white/5"
              )}
              aria-pressed={contentFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 items-start justify-center px-10 pt-18 text-center">
          <div className="max-w-[320px]">
            <p className="text-[16px] leading-8 text-[#aebbd1]">
              Vous verrez les @mentions, les réactions et les autres notifications ici.
            </p>
            <p className="mt-4 text-[12px] text-[#727885]">{visibleCount} élément(s) non lu(s)</p>
          </div>
        </div>
      </section>

      <section className="hidden min-h-0 flex-1 bg-[#232323] xl:block" aria-hidden="true" />
    </div>
  );
}
