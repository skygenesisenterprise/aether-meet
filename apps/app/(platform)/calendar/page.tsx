import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MonthDay {
  key: string;
  day: number;
  month?: "previous" | "next";
  current?: boolean;
  events?: Array<{
    title: string;
    time: string;
    tone: "primary" | "cyan" | "emerald";
  }>;
}

const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const monthDays: MonthDay[] = [
  { key: "jun-1", day: 1 },
  { key: "jun-2", day: 2 },
  { key: "jun-3", day: 3 },
  { key: "jun-4", day: 4 },
  { key: "jun-5", day: 5 },
  { key: "jun-6", day: 6 },
  { key: "jun-7", day: 7 },
  { key: "jun-8", day: 8 },
  { key: "jun-9", day: 9 },
  { key: "jun-10", day: 10 },
  { key: "jun-11", day: 11 },
  { key: "jun-12", day: 12 },
  { key: "jun-13", day: 13 },
  { key: "jun-14", day: 14 },
  { key: "jun-15", day: 15 },
  { key: "jun-16", day: 16 },
  { key: "jun-17", day: 17 },
  { key: "jun-18", day: 18 },
  { key: "jun-19", day: 19 },
  { key: "jun-20", day: 20 },
  { key: "jun-21", day: 21 },
  { key: "jun-22", day: 22 },
  { key: "jun-23", day: 23 },
  { key: "jun-24", day: 24 },
  {
    key: "jun-25",
    day: 25,
    current: true,
    events: [
      {
        title: "Point produit quotidien",
        time: "10:00",
        tone: "primary",
      },
      {
        title: "Revue du nouveau client",
        time: "15:00",
        tone: "emerald",
      },
    ],
  },
  { key: "jun-26", day: 26 },
  { key: "jun-27", day: 27 },
  { key: "jun-28", day: 28 },
  { key: "jun-29", day: 29 },
  { key: "jun-30", day: 30 },
  { key: "jul-1", day: 1, month: "next" },
  { key: "jul-2", day: 2, month: "next" },
  {
    key: "jul-3",
    day: 3,
    month: "next",
    events: [
      {
        title: "Roadmap trimestrielle",
        time: "14:00",
        tone: "cyan",
      },
    ],
  },
  { key: "jul-4", day: 4, month: "next" },
  { key: "jul-5", day: 5, month: "next" },
];

const eventTones = {
  primary: "border-violet-400/35 bg-violet-500/16 text-violet-100",
  cyan: "border-cyan-400/35 bg-cyan-500/14 text-cyan-100",
  emerald: "border-emerald-400/35 bg-emerald-500/14 text-emerald-100",
};

export default function CalendarPage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="rounded-md">
            <CalendarDays className="size-4" />
            <span className="sr-only">Afficher le panneau calendrier</span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-md font-semibold">
            Aujourd’hui
          </Button>
          <ButtonGroup>
            <Button variant="ghost" size="icon-sm">
              <ChevronLeft className="size-4" />
              <span className="sr-only">Mois précédent</span>
            </Button>
            <Button variant="ghost" size="icon-sm">
              <ChevronRight className="size-4" />
              <span className="sr-only">Mois suivant</span>
            </Button>
          </ButtonGroup>
          <Button variant="ghost" size="sm" className="rounded-md font-semibold">
            Juin 2026
            <ChevronDown className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-md">
                <CalendarDays className="size-4" />
                Mois
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Jour</DropdownMenuItem>
              <DropdownMenuItem>Semaine</DropdownMenuItem>
              <DropdownMenuItem>Mois</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="hidden rounded-md sm:inline-flex">
            <Filter className="size-4" />
            Filtre appliqué
            <ChevronDown className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="hidden rounded-md md:inline-flex">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Plus d’options</span>
          </Button>
          <Button variant="ghost" size="sm" className="hidden rounded-md lg:inline-flex">
            <Video className="size-4" />
            Réunion instantanée
            <ChevronDown className="size-3.5" />
          </Button>
          <ButtonGroup>
            <Button size="sm" className="rounded-md">
              <Plus className="size-4" />
              Nouveau
            </Button>
            <Button size="icon-sm" aria-label="Options de création">
              <ChevronDown className="size-3.5" />
            </Button>
          </ButtonGroup>
        </div>
      </header>

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

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-5">
        {monthDays.map((date, index) => (
          <section
            key={date.key}
            className={cn(
              "group relative min-h-28 overflow-hidden border-b border-r border-white/15 p-2 last:border-r-0",
              index % 7 === 6 && "border-r-0",
              index >= 28 && "border-b-0",
              date.current && "bg-violet-500/5 ring-1 ring-inset ring-violet-400/70"
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs text-zinc-400",
                  date.month && "text-zinc-600",
                  date.current && "bg-violet-500 font-semibold text-white"
                )}
              >
                {date.day}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 rounded-md opacity-0 group-hover:opacity-100"
                aria-label={`Créer un événement le ${date.day}`}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            {date.events ? (
              <div className="mt-1.5 space-y-1">
                {date.events.map((event) => (
                  <button
                    key={`${date.key}-${event.time}`}
                    type="button"
                    className={cn(
                      "block w-full truncate rounded-sm border px-1.5 py-1 text-left text-[10px]",
                      eventTones[event.tone]
                    )}
                  >
                    <span className="font-mono">{event.time}</span>{" "}
                    <span className="font-medium">{event.title}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
