"use client";

import * as React from "react";
import {
  ArrowRight,
  FolderKanban,
  Gauge,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { listProjects } from "@/lib/api/projects";
import type { Project } from "@/lib/api/types";
import { usePlatform } from "@/context/PlatformContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProjectItem {
  id: string;
  name: string;
  owner: string;
  phase: "Actif" | "Pilotage" | "A risque";
  progress: number;
  cadence: string;
  summary: string;
}

const phaseTones: Record<ProjectItem["phase"], string> = {
  Actif: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Pilotage: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  "A risque": "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

const portfolioMoments = [
  {
    title: "Alignement a arbitrer",
    description: "Le lot support attend encore la validation des owners produit et infra.",
  },
  {
    title: "Signal positif",
    description: "Design Review peut sortir du portefeuille prioritaire cette semaine.",
  },
  {
    title: "Capacite critique",
    description: "Le meme noyau d’experts couvre deux sujets de migration en parallele.",
  },
];

function mapProjectPhase(status?: string): ProjectItem["phase"] {
  switch ((status ?? "").toLowerCase()) {
    case "pilotage":
    case "planning":
    case "pilot":
      return "Pilotage";
    case "at_risk":
    case "a risque":
    case "à risque":
    case "risk":
      return "A risque";
    default:
      return "Actif";
  }
}

function toProjectItem(project: Project): ProjectItem {
  return {
    id: project.id,
    name: project.name,
    owner: project.ownerName || "Owner non assigne",
    phase: mapProjectPhase(project.status),
    progress: Math.max(0, Math.min(100, Number(project.progress ?? 0))),
    cadence: project.cadence || "Cadence non definie",
    summary: project.summary || "Aucun resume disponible pour ce projet.",
  };
}

export default function ProjectsPage() {
  const { activeWorkspaceId } = usePlatform();
  const [activePhase, setActivePhase] = React.useState<ProjectItem["phase"] | "Tous">("Tous");
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    const workspaceId = activeWorkspaceId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await listProjects(workspaceId);
        if (cancelled) {
          return;
        }
        setProjects(response.data.map(toProjectItem));
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les projets du workspace.");
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

  const visibleProjects = React.useMemo(() => {
    return activePhase === "Tous"
      ? projects
      : projects.filter((project) => project.phase === activePhase);
  }, [activePhase, projects]);
  const featuredProject = visibleProjects[0] ?? projects[0] ?? null;

  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
            <FolderKanban className="size-4" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">Projects</h1>
            <p className="truncate text-xs text-zinc-400">
              Lecture portefeuille des initiatives, risques et rythmes de delivery.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="rounded-md" aria-label="Changer la vue">
            <LayoutGrid className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="rounded-md" aria-label="Autres actions">
            <MoreHorizontal className="size-4" />
          </Button>
          <Button size="sm" className="rounded-md">
            Nouveau projet
            <Plus className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-violet-400/70 bg-[#252628] px-4 py-2 text-sm text-zinc-300">
        <span className="text-zinc-400">Portefeuille :</span>
        {(["Tous", "Actif", "Pilotage", "A risque"] as const).map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setActivePhase(phase)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              activePhase === phase
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {phase}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500">{visibleProjects.length} projets visibles</span>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-[#232426]">
        <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-5">
          <section className="space-y-5">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-[#292a2c] p-4 text-sm text-zinc-400">
                Chargement des projets…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <section className="rounded-2xl border border-white/10 bg-[#292a2c] p-4 lg:p-5">
              {featuredProject ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-primary/30 bg-primary/12 px-2.5 py-1 text-[11px] font-medium text-primary">
                          Projet en focus
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            phaseTones[featuredProject.phase]
                          )}
                        >
                          {featuredProject.phase}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold text-zinc-100">{featuredProject.name}</h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                        {featuredProject.summary}
                      </p>
                    </div>
                    <Button variant="outline" className="rounded-md">
                      Ouvrir la fiche
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-white/8 bg-[#232426] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Owner</p>
                      <p className="mt-2 text-sm font-medium text-zinc-100">{featuredProject.owner}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-[#232426] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Cadence</p>
                      <p className="mt-2 text-sm font-medium text-zinc-100">{featuredProject.cadence}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-[#232426] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Progression</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${featuredProject.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-zinc-100">{featuredProject.progress}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-zinc-400">Aucun projet disponible dans ce workspace.</div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#292a2c]">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Portefeuille actif</h2>
                  <p className="text-xs text-zinc-400">
                    Lecture compacte des sujets a piloter cette semaine.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-md text-zinc-300">
                  Voir la roadmap
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="space-y-3 p-4">
                {visibleProjects.length > 0 ? (
                  visibleProjects.map((project) => (
                    <article
                      key={project.id}
                      className="rounded-xl border border-white/8 bg-[#232426] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-zinc-100">{project.name}</h3>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                phaseTones[project.phase]
                              )}
                            >
                              {project.phase}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{project.summary}</p>
                        </div>
                        <button
                          type="button"
                          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/6 hover:text-zinc-200"
                          aria-label={`Actions pour ${project.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_11rem_9rem]">
                        <div>
                          <p className="text-xs text-zinc-500">Owner</p>
                          <p className="mt-1 text-sm text-zinc-200">{project.owner}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Cadence</p>
                          <p className="mt-1 text-sm text-zinc-200">{project.cadence}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Progression</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-white/8">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-300">{project.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/2 p-4 text-xs leading-5 text-zinc-500">
                    Aucun projet pour ce portefeuille.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#292a2c]">
              <div className="border-b border-white/8 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-100">Signals portefeuille</h2>
                <p className="text-xs text-zinc-400">Ce qui demande une attention de pilotage.</p>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-3">
                {portfolioMoments.map((item) => (
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
                <h2 className="text-sm font-semibold text-zinc-100">Vue exec</h2>
                <p className="text-xs text-zinc-400">Chiffres de lecture immediate.</p>
              </div>
              <div className="space-y-3 p-4">
                {[
                  {
                    icon: Gauge,
                    label: "Progression moyenne",
                    value: `${projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0}%`,
                  },
                  {
                    icon: Sparkles,
                    label: "Sujets a arbitrer",
                    value: String(projects.filter((project) => project.phase === "A risque").length),
                  },
                  {
                    icon: UsersRound,
                    label: "Equipes engagees",
                    value: String(new Set(projects.map((project) => project.owner)).size),
                  },
                ].map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div key={metric.label} className="rounded-xl border border-white/8 bg-[#232426] p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-md bg-white/6 text-zinc-300">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-zinc-300">{metric.label}</p>
                          <p className="text-lg font-semibold text-zinc-100">{metric.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#292a2c]">
              <div className="border-b border-white/8 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-100">Reunions a venir</h2>
                <p className="text-xs text-zinc-400">Cadences qui structurent la semaine.</p>
              </div>
              <div className="space-y-3 p-4">
                {[
                  { title: "Steering Migration", when: "Jeudi · 14:00", room: "Room Atlas" },
                  { title: "Risk Sync Support", when: "Aujourd’hui · 17:00", room: "Canal Launch" },
                  { title: "Demo Orion", when: "Vendredi · 10:00", room: "Studio Client" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/8 bg-[#232426] p-3">
                    <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-400">{item.when}</p>
                    <p className="mt-2 text-xs text-zinc-500">{item.room}</p>
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
