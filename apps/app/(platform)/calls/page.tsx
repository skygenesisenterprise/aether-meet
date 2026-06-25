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

const calls = [
  {
    id: "1",
    name: "Marcus Chen",
    initials: "MC",
    type: "Sortant",
    time: "Aujourd’hui, 11:24",
    duration: "18 min",
    missed: false,
    video: true,
  },
  {
    id: "2",
    name: "Sarah Kim",
    initials: "SK",
    type: "Manqué",
    time: "Aujourd’hui, 09:10",
    duration: "—",
    missed: true,
    video: false,
  },
  {
    id: "3",
    name: "Comité sécurité",
    initials: "CS",
    type: "Entrant",
    time: "Hier, 16:42",
    duration: "43 min",
    missed: false,
    video: true,
  },
  {
    id: "4",
    name: "Elena Martin",
    initials: "EM",
    type: "Manqué",
    time: "Hier, 14:05",
    duration: "—",
    missed: true,
    video: true,
  },
] as const;

const filters = ["Tout", "Manqué(s)", "Entrant", "Sortant", "Messagerie vocale"];

export default function CallsPage() {
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
                  className={cn(
                    "rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200 transition-colors hover:bg-white/5",
                    index === 0 && "border-[#7775ff] bg-[#7775ff] font-semibold text-white"
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
            {calls.map((call) => (
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
            ))}
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
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-sm p-1 text-left transition-colors hover:bg-white/5"
            >
              <PresenceAvatar initials="EM" status="away" className="size-9" />
              <span className="text-sm font-medium">Elena Martin</span>
              <Phone className="ml-auto size-3.5 text-zinc-500" />
            </button>
            <button
              type="button"
              className="mt-3 flex w-full items-center gap-3 rounded-sm p-1 text-left transition-colors hover:bg-white/5"
            >
              <PresenceAvatar initials="MC" status="busy" className="size-9" />
              <span className="text-sm font-medium">Marcus Chen</span>
              <Video className="ml-auto size-3.5 text-zinc-500" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
