"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  MoreHorizontal,
  Plus,
  UsersRound,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/context/PlatformContext";
import { listMeetings } from "@/lib/api/meetings";
import type { Meeting as ApiMeeting } from "@/lib/api/types";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  day: string;
  participants: string[];
  status: "live" | "upcoming" | "done";
  location?: string;
  date: number;
  tone: "primary" | "cyan" | "emerald";
}

interface MonthDay {
  key: string;
  day: number;
  month: "previous" | "current" | "next";
  current: boolean;
  events: CalendarEvent[];
}

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const monthStartOffset = 0;
const eventTones = {
  primary: "border-violet-400/35 bg-violet-500/16 text-violet-100",
  cyan: "border-cyan-400/35 bg-cyan-500/14 text-cyan-100",
  emerald: "border-emerald-400/35 bg-emerald-500/14 text-emerald-100",
};

function getToday() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

function formatHour(isoString: string | undefined): string {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toCalendarDate(isoString: string): number {
  return new Date(isoString).getDate();
}

function mapStatus(status: string): CalendarEvent["status"] {
  if (status === "started" || status === "active") return "live";
  if (status === "scheduled" || status === "pending") return "upcoming";
  return "done";
}

function pickTone(index: number): CalendarEvent["tone"] {
  const tones: CalendarEvent["tone"][] = ["primary", "cyan", "emerald"];
  return tones[index % tones.length];
}

function toCalendarEvent(meeting: ApiMeeting, index: number): CalendarEvent {
  const startDate = meeting.startedAt ?? meeting.createdAt;
  const endDate = meeting.endedAt ?? startDate;
  return {
    id: meeting.id,
    title: meeting.title,
    start: formatHour(meeting.startedAt),
    end: formatHour(meeting.endedAt),
    day: String(toCalendarDate(startDate)),
    participants: [],
    status: mapStatus(meeting.status),
    location: meeting.conversationId ? `Salon ${meeting.conversationId}` : undefined,
    date: toCalendarDate(startDate),
    tone: pickTone(index),
  };
}

function buildMonthDays(
  year: number,
  month: number,
  selectedDate: number,
  events: CalendarEvent[]
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells: MonthDay[] = [];

  for (let index = 0; index < 35; index += 1) {
    const rawDay = index - monthStartOffset + 1;

    if (rawDay < 1) {
      cells.push({
        key: `prev-${index}`,
        day: previousMonthDays + rawDay,
        month: "previous",
        current: false,
        events: [],
      });
      continue;
    }

    if (rawDay > daysInMonth) {
      cells.push({
        key: `next-${index}`,
        day: rawDay - daysInMonth,
        month: "next",
        current: false,
        events: [],
      });
      continue;
    }

    cells.push({
      key: `${year}-${month + 1}-${rawDay}`,
      day: rawDay,
      month: "current",
      current: rawDay === selectedDate,
      events: events.filter((event) => event.date === rawDay),
    });
  }

  return cells;
}

export default function CalendarPage() {
  const router = useRouter();
  const { activeWorkspaceId } = usePlatform();
  const today = React.useMemo(() => getToday(), []);
  const [displayedMonth, setDisplayedMonth] = React.useState(today.month);
  const [displayedYear, setDisplayedYear] = React.useState(today.year);
  const [selectedDate, setSelectedDate] = React.useState(today.day);
  const [view, setView] = React.useState<"Jour" | "Semaine" | "Mois">("Mois");
  const [filter, setFilter] = React.useState<"Tous" | "En direct" | "À venir">("Tous");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftTime, setDraftTime] = React.useState("11:00");
  const [apiEvents, setApiEvents] = React.useState<CalendarEvent[]>([]);
  const [customEvents, setCustomEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      setApiEvents([]);
      setLoading(false);
      return;
    }
    const workspaceId: string = activeWorkspaceId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const meetings = await listMeetings(workspaceId);
        if (cancelled) return;
        setApiEvents(meetings.map(toCalendarEvent));
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les réunions.");
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

  const monthEvents = React.useMemo(
    () =>
      [...apiEvents, ...customEvents].sort((left, right) => left.start.localeCompare(right.start)),
    [apiEvents, customEvents]
  );

  const visibleEvents = React.useMemo(() => {
    if (filter === "En direct") return monthEvents.filter((event) => event.status === "live");
    if (filter === "À venir") return monthEvents.filter((event) => event.status === "upcoming");
    return monthEvents;
  }, [filter, monthEvents]);

  const monthDays = React.useMemo(
    () => buildMonthDays(displayedYear, displayedMonth, selectedDate, visibleEvents),
    [displayedMonth, displayedYear, selectedDate, visibleEvents]
  );

  const selectedEvents = React.useMemo(
    () => visibleEvents.filter((event) => event.date === selectedDate),
    [selectedDate, visibleEvents]
  );

  function handlePreviousMonth() {
    if (displayedMonth === 0) {
      setDisplayedYear((value) => value - 1);
      setDisplayedMonth(11);
      setSelectedDate(1);
      return;
    }

    setDisplayedMonth((value) => value - 1);
    setSelectedDate(1);
  }

  function handleNextMonth() {
    if (displayedMonth === 11) {
      setDisplayedYear((value) => value + 1);
      setDisplayedMonth(0);
      setSelectedDate(1);
      return;
    }

    setDisplayedMonth((value) => value + 1);
    setSelectedDate(1);
  }

  function handleGoToToday() {
    setDisplayedYear(today.year);
    setDisplayedMonth(today.month);
    setSelectedDate(today.day);
  }

  function handleCreateEvent() {
    if (!draftTitle.trim()) return;

    setCustomEvents((current) => [
      ...current,
      {
        id: `custom-${selectedDate}-${draftTime}-${current.length}`,
        title: draftTitle.trim(),
        start: draftTime,
        end: draftTime,
        day: `${selectedDate} ${monthNames[displayedMonth]}`,
        participants: ["LW"],
        status: "upcoming",
        location: "Calendrier personnel",
        date: selectedDate,
        tone: "primary",
      },
    ]);
    setCreateOpen(false);
    setDraftTitle("");
    setDraftTime("11:00");
  }

  function launchMeeting(mode: "audio" | "video") {
    router.push(`/calls/room?conversationId=product&mode=${mode}`);
  }

  return (
    <>
      <div className="flex h-full min-h-180 flex-col overflow-hidden bg-[#232426]">
        <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="rounded-md">
              <CalendarDays className="size-4" />
              <span className="sr-only">Afficher le panneau calendrier</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-md font-semibold" onClick={handleGoToToday}>
              Aujourd’hui
            </Button>
            <ButtonGroup>
              <Button variant="ghost" size="icon-sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Mois précédent</span>
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleNextMonth}>
                <ChevronRight className="size-4" />
                <span className="sr-only">Mois suivant</span>
              </Button>
            </ButtonGroup>
            <Button variant="ghost" size="sm" className="rounded-md font-semibold">
              {monthNames[displayedMonth]} {displayedYear}
              <ChevronDown className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-md">
                  <CalendarDays className="size-4" />
                  {view}
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["Jour", "Semaine", "Mois"] as const).map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setView(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden rounded-md sm:inline-flex">
                  <Filter className="size-4" />
                  {filter}
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["Tous", "En direct", "À venir"] as const).map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setFilter(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon-sm" className="hidden rounded-md md:inline-flex">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Plus d’options</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden rounded-md lg:inline-flex"
              onClick={() => launchMeeting("video")}
            >
              <Video className="size-4" />
              Réunion instantanée
            </Button>
            <ButtonGroup>
              <Button size="sm" className="rounded-md" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Nouveau
              </Button>
              <Button size="icon-sm" aria-label="Options de création" onClick={() => setCreateOpen(true)}>
                <ChevronDown className="size-3.5" />
              </Button>
            </ButtonGroup>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-h-0 flex-col border-r border-white/10">
            <div className="grid grid-cols-7 border-b border-white/15 bg-[#252628]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="border-r border-white/15 px-2 py-1.5 text-[11px] text-zinc-400 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-zinc-400">
                Chargement du calendrier…
              </div>
            ) : error ? (
              <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-rose-200">
                {error}
              </div>
            ) : (
            <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-5 overflow-hidden">
              {monthDays.map((date, index) => (
                <section
                  key={date.key}
                  className={cn(
                    "group relative min-h-0 overflow-hidden border-b border-r border-white/15 p-2 last:border-r-0",
                    index % 7 === 6 && "border-r-0",
                    index >= 28 && "border-b-0",
                    date.current && "bg-violet-500/5 ring-1 ring-inset ring-violet-400/70",
                    date.month === "current" && "cursor-pointer hover:bg-white/3"
                  )}
                  onClick={() => {
                    if (date.month !== "current") return;
                    setSelectedDate(date.day);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => date.month === "current" && setSelectedDate(date.day)}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs text-zinc-400",
                        date.month !== "current" && "text-zinc-600",
                        date.current && "bg-violet-500 font-semibold text-white"
                      )}
                    >
                      {date.day}
                    </button>
                    {date.month === "current" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-6 rounded-md opacity-0 group-hover:opacity-100"
                        aria-label={`Créer un événement le ${date.day}`}
                        onClick={() => {
                          setSelectedDate(date.day);
                          setCreateOpen(true);
                        }}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  {date.events.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {date.events.slice(0, 3).map((event) => (
                        <button
                          key={`${date.key}-${event.id}`}
                          type="button"
                          onClick={() => setSelectedDate(date.day)}
                          className={cn(
                            "block w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px]",
                            eventTones[event.tone]
                          )}
                        >
                          <span className="font-mono">{event.start}</span>{" "}
                          <span className="font-medium">{event.title}</span>
                        </button>
                      ))}
                      {date.events.length > 3 ? (
                        <p className="px-1 text-[10px] text-zinc-500">+{date.events.length - 3} autres</p>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
            )}
          </div>

          <aside className="flex min-h-0 flex-col overflow-hidden bg-[#252628]">
            <div className="shrink-0 border-b border-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sélection</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">
                {selectedDate} {monthNames[displayedMonth]} {displayedYear}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {selectedEvents.length > 0
                  ? `${selectedEvents.length} événement${selectedEvents.length > 1 ? "s" : ""}`
                  : "Aucun événement pour cette journée"}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <div className="space-y-3">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-xl border border-white/10 bg-white/3 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{event.title}</p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {event.start} – {event.end}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
                            event.status === "live"
                              ? "bg-emerald-500/15 text-emerald-200"
                              : event.status === "upcoming"
                                ? "bg-cyan-500/15 text-cyan-200"
                                : "bg-zinc-500/15 text-zinc-300"
                          )}
                        >
                          {event.status === "live" ? "En direct" : event.status === "upcoming" ? "À venir" : "Terminé"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-zinc-500" />
                          <span>{event.location ?? "Lieu non défini"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersRound className="size-4 text-zinc-500" />
                          <span>{event.participants.length} participants</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => launchMeeting("video")}>
                          <Video className="size-4" />
                          {event.status === "live" ? "Rejoindre" : "Lancer"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => launchMeeting("audio")}>
                          Réunion audio
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                    <p className="text-sm font-medium text-zinc-200">Journée libre</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Ajoute un point rapide ou lance une réunion instantanée.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Ajouter
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => launchMeeting("video")}>
                        <Video className="size-4" />
                        Réunion instantanée
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-white/12 bg-[#27282b] text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un événement</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ajoute rapidement un événement au {selectedDate} {monthNames[displayedMonth]}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="event-title" className="text-sm font-medium text-zinc-200">
                Titre
              </label>
              <Input
                id="event-title"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Ex. Revue sprint design"
                className="border-white/10 bg-black/15"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="event-time" className="text-sm font-medium text-zinc-200">
                Heure
              </label>
              <Input
                id="event-time"
                value={draftTime}
                onChange={(event) => setDraftTime(event.target.value)}
                className="border-white/10 bg-black/15"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateEvent} disabled={!draftTitle.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
