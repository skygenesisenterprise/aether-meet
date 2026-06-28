"use client";

import * as React from "react";
import { Bell, MoreHorizontal, Search } from "lucide-react";

import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api/notifications";
import type { Notification } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const contentFilters = [
  { id: "unread", label: "Non lu(e)s" },
  { id: "mentions", label: "@Mentions" },
  { id: "tagged", label: "Mentions d'étiquette" },
] as const;

const detailSummary = "Vous verrez les @mentions, les réactions et les autres notifications ici.";

type ContentFilter = (typeof contentFilters)[number]["id"];

function getNotificationAccent(readAt?: string) {
  return readAt ? "bg-[#263140] text-[#7f92b1]" : "bg-[#22324a] text-[#86a9e7]";
}

function getCategoryLabel(type: string) {
  if (type.includes("message")) return "@Mention";
  if (type.includes("meeting")) return "Réunion";
  if (type.includes("team")) return "Équipe";
  if (type.includes("file")) return "Document";
  return "Système";
}

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchesFilter(notification: Notification, filter: ContentFilter) {
  if (filter === "unread") {
    return !notification.readAt;
  }
  if (filter === "mentions") {
    return notification.type.includes("message") || notification.title.includes("@") || notification.body.includes("@");
  }
  if (filter === "tagged") {
    return notification.type.includes("tag") || notification.title.toLowerCase().includes("tag");
  }
  return true;
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = React.useState<ContentFilter>("unread");
  const [items, setItems] = React.useState<Notification[]>([]);
  const [selectedNotificationId, setSelectedNotificationId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await listNotifications({ limit: 100 });
        if (cancelled) {
          return;
        }
        setItems(response.data);
        setSelectedNotificationId((current) => current ?? response.data[0]?.id ?? null);
      } catch {
        if (!cancelled) {
          setError("Impossible de charger l’activité du compte.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = React.useMemo(
    () => items.filter((notification) => matchesFilter(notification, activeFilter)),
    [activeFilter, items]
  );
  const unreadCount = items.filter((notification) => !notification.readAt).length;
  const selectedNotification =
    filteredItems.find((notification) => notification.id === selectedNotificationId) ??
    items.find((notification) => notification.id === selectedNotificationId) ??
    null;

  async function handleSelectNotification(notification: Notification) {
    setSelectedNotificationId(notification.id);
    if (notification.readAt) {
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item
      )
    );
    try {
      await markNotificationRead(notification.id);
    } catch {
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, readAt: undefined } : item
        )
      );
    }
  }

  async function handleMarkAllRead() {
    setMarkingAllRead(true);
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
    try {
      await markAllNotificationsRead();
    } catch {
      setError("Impossible de marquer les notifications comme lues.");
    } finally {
      setMarkingAllRead(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 bg-[#1f1f1f] text-[#f5f5f5]">
      <section className="flex h-full min-h-0 w-full max-w-96 shrink-0 flex-col border-r border-white/10 bg-[#191a1c]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-white">Activité</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
              disabled={markingAllRead || unreadCount === 0}
              onClick={() => void handleMarkAllRead()}
            >
              Tout lire
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md text-[#d0d0d0] hover:bg-white/5 hover:text-white"
              aria-label="Plus d’options"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1.5 p-2">
            {loading ? (
              <div className="p-4 text-sm text-[#92a2ba]">Chargement de l’activité…</div>
            ) : error ? (
              <div className="p-4 text-sm text-rose-300">{error}</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-sm text-[#92a2ba]">Aucune notification pour ce filtre.</div>
            ) : (
              filteredItems.map((notification) => {
              const isSelected = notification.id === selectedNotificationId;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleSelectNotification(notification)}
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
                          getNotificationAccent(notification.readAt)
                        )}
                      >
                        <Bell className="size-4" strokeWidth={1.9} />
                      {!notification.readAt ? (
                        <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-[#8db6ff]" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[14px] font-semibold leading-5 text-[#f2f5f9]">
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-[#8ea0be]">{formatNotificationTime(notification.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-[#92a2ba]">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </button>
              );
            }))}
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
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium leading-5",
                filter.id === activeFilter
                  ? "border-[#6d6f73] bg-[#20252c] text-[#d3d7dd]"
                  : "border-[#5f6368] bg-transparent text-[#d3d7dd]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {selectedNotification ? (
          <div className="flex min-h-0 flex-1 flex-col px-8 py-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    getNotificationAccent(selectedNotification.readAt)
                  )}
                >
                  <Bell className="size-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#7d8695]">
                    {getCategoryLabel(selectedNotification.type)}
                  </p>
                  <h3 className="text-xl font-semibold text-white">{selectedNotification.title}</h3>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-white/8 bg-[#20252c] p-6">
                <p className="text-[16px] leading-8 text-[#aebbd1]">{detailSummary}</p>
                <p className="mt-5 text-sm leading-7 text-[#d6dbe4]">{selectedNotification.body}</p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
                <span className="text-sm text-[#8ea0be]">{formatNotificationTime(selectedNotification.createdAt)}</span>
                <span className="text-sm text-[#727885]">
                  {selectedNotification.readAt ? "Notification lue" : `${unreadCount} élément(s) non lu(s)`}
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
