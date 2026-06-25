"use client";

import * as React from "react";
import { Bell, MoreHorizontal, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications, type PlatformNotification } from "@/lib/platform-notifications";
import { cn } from "@/lib/utils";

const contentFilters = [
  { id: "unread", label: "Non lu(e)s" },
  { id: "mentions", label: "@Mentions" },
  { id: "tagged", label: "Mentions d'étiquette" },
] as const;

const detailSummary = "Vous verrez les @mentions, les réactions et les autres notifications ici.";

function getNotificationAccent(read: boolean) {
  return read ? "bg-[#263140] text-[#7f92b1]" : "bg-[#22324a] text-[#86a9e7]";
}

function getCategoryLabel(category: PlatformNotification["category"]) {
  if (category === "message") return "@Mention";
  if (category === "meeting") return "Réunion";
  if (category === "team") return "Équipe";
  if (category === "file") return "Document";
  return "Système";
}

export default function NotificationsPage() {
  const [selectedNotificationId, setSelectedNotificationId] = React.useState<string | null>(
    notifications[0]?.id ?? null
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const selectedNotification =
    notifications.find((notification) => notification.id === selectedNotificationId) ?? null;

  return (
    <div className="flex h-full min-h-0 bg-[#1f1f1f] text-[#f5f5f5]">
      <section className="flex h-full min-h-0 w-full max-w-96 shrink-0 flex-col border-r border-white/10 bg-[#191a1c]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-white">Activité</h1>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
            aria-label="Plus d’options"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1.5 p-2">
            {notifications.map((notification) => {
              const isSelected = notification.id === selectedNotificationId;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => setSelectedNotificationId(notification.id)}
                  className={cn(
                    "w-full rounded-[18px] border px-3 py-3 text-left transition-colors",
                    isSelected
                      ? "border-[#49618c] bg-[#20262f]"
                      : "border-transparent bg-[#1d2024] hover:border-white/8 hover:bg-[#20262f]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full",
                        getNotificationAccent(notification.read)
                      )}
                    >
                      <Bell className="size-4" strokeWidth={1.9} />
                      {!notification.read ? (
                        <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-[#8db6ff]" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[14px] font-semibold leading-5 text-[#f2f5f9]">
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-[#8ea0be]">{notification.time}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[#92a2ba]">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </section>

      <section className="flex min-h-0 flex-1 flex-col bg-[#1c1c1c]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <Bell className="size-4 text-[#f2f2f2]" strokeWidth={2} />
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-white">Lecture</h2>
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

        <div className="flex shrink-0 gap-2 border-b border-white/6 px-4 py-4">
          {contentFilters.map((filter) => (
            <span
              key={filter.id}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium leading-5",
                filter.id === "unread"
                  ? "border-[#6d6f73] bg-[#20252c] text-[#d3d7dd]"
                  : "border-[#5f6368] bg-transparent text-[#d3d7dd]"
              )}
            >
              {filter.label}
            </span>
          ))}
        </div>

        {selectedNotification ? (
          <div className="flex min-h-0 flex-1 flex-col px-8 py-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    getNotificationAccent(selectedNotification.read)
                  )}
                >
                  <Bell className="size-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#7d8695]">
                    {getCategoryLabel(selectedNotification.category)}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{selectedNotification.title}</h3>
                </div>
              </div>

              <div className="mt-8 rounded-[20px] border border-white/8 bg-[#20252c] p-6">
                <p className="text-[16px] leading-8 text-[#aebbd1]">{detailSummary}</p>
                <p className="mt-5 text-sm leading-7 text-[#d6dbe4]">{selectedNotification.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
                <span className="text-sm text-[#8ea0be]">{selectedNotification.time}</span>
                <span className="text-sm text-[#727885]">
                  {selectedNotification.read ? "Notification lue" : `${unreadCount} élément(s) non lu(s)`}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center px-8 text-center">
            <div className="max-w-sm">
              <p className="text-[16px] leading-8 text-[#aebbd1]">{detailSummary}</p>
              <p className="mt-4 text-[12px] text-[#727885]">
                Sélectionnez une notification dans la colonne Activité.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
