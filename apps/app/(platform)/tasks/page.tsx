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

import { createTask, listTasks } from "@/lib/api/tasks";
import type { Task } from "@/lib/api/types";
import { usePlatform } from "@/context/PlatformContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

interface TaskCreateFormState {
  title: string;
  description: string;
  project: string;
  priority: "Moyenne" | "Haute" | "Critique";
  status: TaskItem["status"];
  dueAt: string;
}

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

const taskStatusOptions: Array<{ value: TaskItem["status"]; label: string }> = [
  { value: "Inbox", label: "Inbox" },
  { value: "En cours", label: "En cours" },
  { value: "En revue", label: "En revue" },
  { value: "Termine", label: "Termine" },
];

const taskPriorityOptions: Array<{ value: TaskItem["priority"]; label: string }> = [
  { value: "Moyenne", label: "Moyenne" },
  { value: "Haute", label: "Haute" },
  { value: "Critique", label: "Critique" },
];

const initialTaskFormState: TaskCreateFormState = {
  title: "",
  description: "",
  project: "",
  priority: "Moyenne",
  status: "Inbox",
  dueAt: "",
};

function mapTaskStatus(status?: string): TaskItem["status"] {
  switch ((status ?? "").toLowerCase()) {
    case "in_progress":
    case "en cours":
      return "En cours";
    case "in_review":
    case "en revue":
      return "En revue";
    case "done":
    case "completed":
    case "termine":
    case "terminé":
      return "Termine";
    default:
      return "Inbox";
  }
}

function mapTaskPriority(priority?: string): TaskItem["priority"] {
  switch ((priority ?? "").toLowerCase()) {
    case "critical":
    case "critique":
      return "Critique";
    case "high":
    case "haute":
      return "Haute";
    default:
      return "Moyenne";
  }
}

function formatDueDate(value?: string, completedAt?: string): string {
  if (completedAt) {
    return "Clos";
  }
  if (!value) {
    return "Sans échéance";
  }
  return new Date(value).toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string): string {
  if (!name) {
    return "--";
  }
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toTaskItem(task: Task): TaskItem {
  return {
    id: task.id,
    title: task.title,
    assignee: getInitials(task.assigneeName),
    due: formatDueDate(task.dueAt, task.completedAt),
    project: task.project || "Sans projet",
    priority: mapTaskPriority(task.priority),
    status: mapTaskStatus(task.status),
  };
}

function toTaskPayloadStatus(status: TaskItem["status"]): string {
  switch (status) {
    case "En cours":
      return "in_progress";
    case "En revue":
      return "in_review";
    case "Termine":
      return "done";
    default:
      return "inbox";
  }
}

function toTaskPayloadPriority(priority: TaskItem["priority"]): string {
  switch (priority) {
    case "Critique":
      return "critical";
    case "Haute":
      return "high";
    default:
      return "medium";
  }
}

export default function TasksPage() {
  const { activeWorkspaceId } = usePlatform();
  const [activeStatus, setActiveStatus] = React.useState<TaskItem["status"] | "Tout">("Tout");
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<TaskCreateFormState>(initialTaskFormState);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const workspaceId = activeWorkspaceId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await listTasks(workspaceId);
        if (cancelled) {
          return;
        }
        setTasks(response.data.map(toTaskItem));
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les tâches du workspace.");
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
  }, [activeWorkspaceId]);

  const visibleTasks = React.useMemo(() => {
    return activeStatus === "Tout"
      ? tasks
      : tasks.filter((task) => task.status === activeStatus);
  }, [activeStatus, tasks]);

  function updateCreateForm<K extends keyof TaskCreateFormState>(
    key: K,
    value: TaskCreateFormState[K]
  ) {
    setCreateForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeWorkspaceId) {
      setCreateError("Selectionnez un workspace avant de creer une tache.");
      return;
    }

    const trimmedTitle = createForm.title.trim();
    if (!trimmedTitle) {
      setCreateError("Le titre est obligatoire.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const createdTask = await createTask(activeWorkspaceId, {
        title: trimmedTitle,
        description: createForm.description.trim() || undefined,
        project: createForm.project.trim() || undefined,
        priority: toTaskPayloadPriority(createForm.priority),
        status: toTaskPayloadStatus(createForm.status),
        dueAt: createForm.dueAt ? new Date(createForm.dueAt).toISOString() : undefined,
      });

      setTasks((current) => [toTaskItem(createdTask), ...current]);
      setCreateForm(initialTaskFormState);
      setIsCreatePanelOpen(false);
    } catch {
      setCreateError("La creation de tache a echoue. Verifiez que l'API de creation est disponible.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Sheet open={isCreatePanelOpen} onOpenChange={setIsCreatePanelOpen}>
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
          <Button
            size="sm"
            className="rounded-md"
            onClick={() => {
              setCreateError(null);
              setIsCreatePanelOpen(true);
            }}
            disabled={!activeWorkspaceId}
          >
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
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-[#292a2c] p-4 text-sm text-zinc-400">
                Chargement des tâches…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
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
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/2 p-4 text-xs leading-5 text-zinc-500">
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
                  {
                    label: "Prioritaires",
                    value: String(tasks.filter((task) => task.priority === "Critique" || task.priority === "Haute").length),
                    hint: "niveau critique ou haute priorité",
                  },
                  {
                    label: "En revue",
                    value: String(tasks.filter((task) => task.status === "En revue").length),
                    hint: "validation ou arbitrage attendus",
                  },
                  {
                    label: "Bloquantes",
                    value: String(tasks.filter((task) => task.status === "Inbox").length),
                    hint: "éléments encore en attente de tri",
                  },
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

      <SheetContent
        side="right"
        className="w-full border-l border-white/10 bg-[#1f2022] p-0 text-zinc-100 sm:max-w-xl"
      >
        <form className="flex h-full flex-col" onSubmit={handleCreateTask}>
          <SheetHeader className="border-b border-white/8 px-5 py-4">
            <SheetTitle className="text-base text-zinc-100">Nouvelle tache</SheetTitle>
            <SheetDescription className="text-sm text-zinc-400">
              Creez une tache et injectez-la directement dans le flux de pilotage.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium text-zinc-200">
                Titre
              </label>
              <Input
                id="task-title"
                value={createForm.title}
                onChange={(event) => updateCreateForm("title", event.target.value)}
                placeholder="Ex. Finaliser le cadrage du pilote"
                className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-description" className="text-sm font-medium text-zinc-200">
                Description
              </label>
              <Textarea
                id="task-description"
                value={createForm.description}
                onChange={(event) => updateCreateForm("description", event.target.value)}
                placeholder="Contexte, dependances, points d'attention..."
                className="min-h-32 border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Statut initial</label>
                <Select
                  value={createForm.status}
                  onValueChange={(value) => updateCreateForm("status", value as TaskItem["status"])}
                >
                  <SelectTrigger className="w-full border-white/10 bg-white/5 text-zinc-100">
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#26272a] text-zinc-100">
                    {taskStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Priorite</label>
                <Select
                  value={createForm.priority}
                  onValueChange={(value) => updateCreateForm("priority", value as TaskItem["priority"])}
                >
                  <SelectTrigger className="w-full border-white/10 bg-white/5 text-zinc-100">
                    <SelectValue placeholder="Choisir une priorite" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#26272a] text-zinc-100">
                    {taskPriorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="task-project" className="text-sm font-medium text-zinc-200">
                  Projet
                </label>
                <Input
                  id="task-project"
                  value={createForm.project}
                  onChange={(event) => updateCreateForm("project", event.target.value)}
                  placeholder="Sans projet"
                  className="border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="task-due-at" className="text-sm font-medium text-zinc-200">
                  Echeance
                </label>
                <Input
                  id="task-due-at"
                  type="datetime-local"
                  value={createForm.dueAt}
                  onChange={(event) => updateCreateForm("dueAt", event.target.value)}
                  className="border-white/10 bg-white/5 text-zinc-100"
                />
              </div>
            </div>

            {createError ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {createError}
              </div>
            ) : null}
          </div>

          <SheetFooter className="border-t border-white/8 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="rounded-md text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
              onClick={() => setIsCreatePanelOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="rounded-md" disabled={isCreating || !activeWorkspaceId}>
              {isCreating ? "Creation..." : "Creer la tache"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
