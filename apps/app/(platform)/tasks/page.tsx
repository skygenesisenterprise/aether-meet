"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Filter,
  ListTodo,
  MoreHorizontal,
  Plus,
  Sparkles,
  TimerReset,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  due: string;
  project: string;
  priority: "Critique" | "Haute" | "Moyenne";
  status: "Inbox" | "En cours" | "En revue" | "Termine";
}

const tasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Valider le script de demo client pour vendredi",
    assignee: "CL",
    due: "Aujourd’hui · 16:00",
    project: "Onboarding Orion",
    priority: "Critique",
    status: "Inbox",
  },
  {
    id: "task-2",
    title: "Relancer l’equipe infra sur le provisionnement SSO",
    assignee: "MN",
    due: "Aujourd’hui · 18:00",
    project: "Workspace Migration",
    priority: "Haute",
    status: "Inbox",
  },
  {
    id: "task-3",
    title: "Assembler la checklist de runbook avant mise en prod",
    assignee: "AD",
    due: "Demain · 10:30",
    project: "Support Launch",
    priority: "Haute",
    status: "En cours",
  },
  {
    id: "task-4",
    title: "Nettoyer les dependances du flux d’invitation externe",
    assignee: "RM",
    due: "Demain · 14:00",
    project: "Workspace Migration",
    priority: "Moyenne",
    status: "En cours",
  },
  {
    id: "task-5",
    title: "Verifier les captures Figma avant partage exec",
    assignee: "CL",
    due: "Jeudi · 09:00",
    project: "Design Review",
    priority: "Moyenne",
    status: "En revue",
  },
  {
    id: "task-6",
    title: "Publier la note de cadrage post-atelier",
    assignee: "MN",
    due: "Clos",
    project: "Pilot Steering",
    priority: "Moyenne",
    status: "Termine",
  },
];

const columns = [
  {
    key: "Inbox",
    label: "Inbox",
    description: "Actions a trier cette demi-journee",
    accent: "bg-amber-400",
    icon: CircleDashed,
  },
  {
    key: "En cours",
    label: "En cours",
    description: "Execution active cote equipe",
    accent: "bg-sky-400",
    icon: TimerReset,
  },
  {
    key: "En revue",
    label: "En revue",
    description: "Validation ou arbitrage en attente",
    accent: "bg-violet-400",
    icon: Sparkles,
  },
  {
    key: "Termine",
    label: "Termine",
    description: "Flux cloture aujourd’hui",
    accent: "bg-emerald-400",
    icon: CheckCircle2,
  },
] satisfies Array<{
  key: TaskItem["status"];
  label: string;
  description: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
}>;

const focusItems = [
  {
    title: "Point de friction",
    description: "3 taches bloquent encore l’ouverture du pilote EMEA.",
  },
  {
    title: "Prochaine fenetre",
    description: "Revue d’alignement produit a 15:30 avec design et ops.",
  },
  {
    title: "Charge equipe",
    description: "Claire et Maya concentrent 5 des 9 actions prioritaires.",
  },
];

const priorityTone: Record<TaskItem["priority"], string> = {
  Critique: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  Haute: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Moyenne: "border-white/12 bg-white/6 text-zinc-300",
};

export default function TasksPage() {
  const [activeStatus, setActiveStatus] = React.useState<TaskItem["status"] | "Tout">("Tout");
  const visibleTasks = React.useMemo(() => {
    return activeStatus === "Tout"
      ? tasks
      : tasks.filter((task) => task.status === activeStatus);
  }, [activeStatus]);

  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
            <ListTodo className="size-4" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">Tasks</h1>
            <p className="truncate text-xs text-zinc-400">
              Pilotage quotidien des actions, priorites et dependances en cours.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="rounded-md" aria-label="Filtrer les taches">
            <Filter className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="rounded-md" aria-label="Autres actions">
            <MoreHorizontal className="size-4" />
          </Button>
          <Button size="sm" className="rounded-md">
            Nouvelle tache
            <Plus className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-violet-400/70 bg-[#252628] px-4 py-2 text-sm text-zinc-300">
        <span className="text-zinc-400">Vue :</span>
        {(["Tout", ...columns.map((column) => column.key)] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              activeStatus === status
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {status}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500">{visibleTasks.length} actions visibles</span>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-[#232426]">
        <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-5">
          <section className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-4">
              {columns.map((column) => {
                const columnTasks = visibleTasks.filter((task) => task.status === column.key);
                const Icon = column.icon;

                return (
                  <section
                    key={column.key}
                    className="rounded-2xl border border-white/10 bg-[#292a2c] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("size-2.5 rounded-full", column.accent)} />
                          <h2 className="text-sm font-semibold text-zinc-100">{column.label}</h2>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-zinc-400">{column.description}</p>
                      </div>
                      <span className="flex size-8 items-center justify-center rounded-md bg-black/15 text-zinc-400">
                        <Icon className="size-4" />
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {columnTasks.length > 0 ? (
                        columnTasks.map((task) => (
                          <article
                            key={task.id}
                            className="rounded-xl border border-white/8 bg-[#232426] p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-medium leading-6 text-zinc-100">
                                {task.title}
                              </h3>
                              <button
                                type="button"
                                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/6 hover:text-zinc-200"
                                aria-label={`Actions pour ${task.title}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                              <span
                                className={cn(
                                  "rounded-full border px-2.5 py-1 font-medium",
                                  priorityTone[task.priority]
                                )}
                              >
                                {task.priority}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
                                {task.project}
                              </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                              <span>{task.due}</span>
                              <span className="rounded-full bg-white/6 px-2 py-1 text-zinc-300">
                                {task.assignee}
                              </span>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-zinc-500">
                          Aucune tache dans cette colonne pour le filtre actif.
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            <section className="rounded-2xl border border-white/10 bg-[#292a2c]">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Couloir d’execution</h2>
                  <p className="text-xs text-zinc-400">
                    Les prochaines decisions a prendre pour eviter le glissement.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-md text-zinc-300">
                  Ouvrir la timeline
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-3">
                {focusItems.map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/8 bg-[#232426] p-4">
                    <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/10 bg-[#292a2c]">
              <div className="border-b border-white/8 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-100">Resume</h2>
                <p className="text-xs text-zinc-400">Lecture rapide avant le stand-up.</p>
              </div>
              <div className="space-y-3 p-4">
                {[
                  { label: "Prioritaires", value: "4", hint: "a traiter aujourd’hui" },
                  { label: "En revue", value: "1", hint: "validation design attendue" },
                  { label: "Bloquantes", value: "2", hint: "dependances externes" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-white/8 bg-[#232426] p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-zinc-300">{metric.label}</span>
                      <span className="text-lg font-semibold text-zinc-100">{metric.value}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{metric.hint}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#292a2c]">
              <div className="border-b border-white/8 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-100">Capacite equipe</h2>
                <p className="text-xs text-zinc-400">Qui porte la charge cette semaine.</p>
              </div>
              <div className="space-y-3 p-4">
                {[
                  { name: "Claire", load: "Charge forte", ratio: "5 actions" },
                  { name: "Maya", load: "Charge stable", ratio: "3 actions" },
                  { name: "Adrien", load: "Disponible", ratio: "2 actions" },
                ].map((person) => (
                  <div key={person.name} className="rounded-xl border border-white/8 bg-[#232426] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-zinc-100">{person.name}</p>
                      <span className="rounded-full bg-white/6 px-2 py-1 text-[11px] text-zinc-300">
                        {person.ratio}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{person.load}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </ScrollArea>
    </div>
  );
}
