"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ContactRound,
  Filter,
  MoreHorizontal,
  Phone,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/context/PlatformContext";
import { listCallHistory } from "@/lib/api/calls";
import { listContacts } from "@/lib/api/contacts";
import { ApiError } from "@/lib/api/errors";
import type { CallHistoryItem, Contact } from "@/lib/api/types";

interface CallLogItem {
  id: string;
  name: string;
  initials: string;
  type: "Sortant" | "Manqué" | "Entrant";
  time: string;
  duration: string;
  missed: boolean;
  video: boolean;
}

const filters = ["Tout", "Manqué(s)", "Entrant", "Sortant", "Messagerie vocale"];

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function formatCallTime(isoString: string | undefined): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (days === 0) return `Aujourd’hui, ${time}`;
  if (days === 1) return `Hier, ${time}`;
  return `${date.toLocaleDateString("fr-FR")}, ${time}`;
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const min = Math.floor(seconds / 60);
  if (min < 1) return "< 1 min";
  return `${min} min`;
}

function toCallLogItem(item: CallHistoryItem): CallLogItem {
  const name = (item.callerName as string) ?? (item.name as string) ?? "Inconnu";
  const direction = item.direction as string | undefined;
  const missed = (item.missed as boolean) ?? false;
  const isVideo = (item.video as boolean) ?? false;
  const durationSec = item.durationSeconds as number | undefined;

  let type: CallLogItem["type"] = "Entrant";
  if (direction === "outbound" || direction === "outgoing") type = "Sortant";
  if (missed) type = "Manqué";

  return {
    id: item.id,
    name,
    initials: initialsFromName(name),
    type,
    time: formatCallTime(item.startedAt as string | undefined),
    duration: formatDuration(durationSec),
    missed,
    video: isVideo,
  };
}

export default function CallsPage() {
  const { activeWorkspaceId } = usePlatform();
  const [calls, setCalls] = React.useState<CallLogItem[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [activeFilter, setActiveFilter] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      setCalls([]);
      setContacts([]);
      setLoading(false);
      return;
    }
    const workspaceId: string = activeWorkspaceId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [callHistory, contactList] = await Promise.all([
          listCallHistory(workspaceId),
          listContacts(workspaceId),
        ]);
        if (cancelled) return;
        setCalls(callHistory.map(toCallLogItem));
        setContacts(contactList);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 501) {
            setError("L'historique des appels n'est pas encore disponible.");
          } else {
            setError("Impossible de charger l'historique des appels.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId]);

  const filteredCalls = React.useMemo(() => {
    if (activeFilter === 0) return calls;
    const filterLabel = filters[activeFilter];
    if (filterLabel === "Manqué(s)") return calls.filter((c) => c.missed);
    if (filterLabel === "Entrant") return calls.filter((c) => c.type === "Entrant");
    if (filterLabel === "Sortant") return calls.filter((c) => c.type === "Sortant");
    return calls;
  }, [calls, activeFilter]);

  return (
    <div className="flex h-full min-h-180 flex-col bg-[#202123]">
      <header className="flex min-h-15.5 shrink-0 items-center justify-between border-b border-white/12 bg-[#202123] px-5">
        <div className="flex h-full items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-sm bg-[#5d5bd4] text-white">
              <Phone className="size-4.5" />
            </span>
            <h1 className="text-lg font-semibold">Appels</h1>
          </div>
          <button
            type="button"
            className="relative flex h-full items-center px-1 text-sm font-semibold"
          >
            Personnel
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7775ff]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-sm">
            Afficher les contacts
            <ContactRound className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-sm"
            aria-label="Gérer les groupes d’appels"
          >
            <UsersRound className="size-4 text-[#8b89ff]" />
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(520px,1fr)_minmax(300px,0.72fr)]">
        <section className="flex min-h-0 flex-col border-r border-white/12">
          <div className="flex min-h-12.5 flex-wrap items-center gap-2 border-b border-white/12 px-5 py-2">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold">
              <ChevronDown className="size-3.5" />
              Historique
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(index)}
                  className={cn(
                    "rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200 transition-colors hover:bg-white/5",
                    activeFilter === index && "border-[#7775ff] bg-[#7775ff] font-semibold text-white"
                  )}
                >
                  {filter}
                </button>
              ))}
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-sm"
                aria-label="Filtrer les appels"
              >
                <Filter className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-sm"
                aria-label="Plus d’options"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                Chargement de l’historique…
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-rose-200">
                {error}
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Aucun appel pour le moment.
              </div>
            ) : (
            filteredCalls.map((call) => (
              <article
                key={call.id}
                className="group flex items-center gap-3 border-b border-white/7 px-5 py-3 transition-colors hover:bg-white/2.5"
              >
                <PresenceAvatar
                  initials={call.initials}
                  status={call.missed ? "offline" : "online"}
                  className="size-9"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{call.name}</p>
                  <p
                    className={cn(
                      "mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500",
                      call.missed && "text-rose-400"
                    )}
                  >
                    {call.type === "Sortant" ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownLeft className="size-3" />
                    )}
                    {call.type} · {call.time} · {call.duration}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-sm opacity-70 group-hover:opacity-100"
                  aria-label={`Appeler ${call.name}`}
                >
                  {call.video ? <Video className="size-4" /> : <Phone className="size-4" />}
                </Button>
              </article>
            ))
            )}
          </div>
        </section>

        <aside className="hidden min-h-0 flex-col xl:flex">
          <div className="flex h-12.5 shrink-0 items-center justify-between border-b border-white/12 px-5">
            <h2 className="text-base font-semibold">Numérotation rapide</h2>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-sm"
              aria-label="Ajouter un contact rapide"
            >
              <UserPlus className="size-4" />
            </Button>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-zinc-500">Chargement des contacts…</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun contact rapide.</p>
            ) : (
              contacts.slice(0, 5).map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  className="mt-3 flex w-full items-center gap-3 rounded-sm p-1 text-left transition-colors hover:bg-white/5 first:mt-0"
                >
                  <PresenceAvatar
                    initials={initialsFromName(contact.name)}
                    status="online"
                    className="size-9"
                  />
                  <span className="truncate text-sm font-medium">{contact.name}</span>
                  <Phone className="ml-auto size-3.5 shrink-0 text-zinc-500" />
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
