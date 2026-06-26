import {
  BookOpenText,
  ChevronDown,
  FileCode2,
  FileStack,
  GraduationCap,
  MoreHorizontal,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = ["Toutes", "Runbooks", "Architecture", "Onboarding", "Support"] as const;

const resources = [
  {
    id: "res-1",
    title: "Guide d’exploitation incidents",
    description: "Runbook · Révisé par l’équipe support",
    label: "Critique",
    accent: "bg-rose-500/15 text-rose-300 border-rose-400/20",
  },
  {
    id: "res-2",
    title: "Référentiel API workspace",
    description: "Technique · Endpoints, auth et quotas",
    label: "Technique",
    accent: "bg-sky-500/15 text-sky-300 border-sky-400/20",
  },
  {
    id: "res-3",
    title: "Kit onboarding partenaire",
    description: "Enablement · Présentation, scripts et checklists",
    label: "Nouveau",
    accent: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  },
  {
    id: "res-4",
    title: "Politique de classification documentaire",
    description: "Sécurité · Accès, conservation et partage",
    label: "Conformité",
    accent: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  },
] as const;

const quickAccess = [
  {
    title: "Base de connaissance",
    description: "Articles, guides et procédures de référence",
    icon: BookOpenText,
  },
  {
    title: "Architecture plateforme",
    description: "Schemas, conventions et composants clés",
    icon: FileCode2,
  },
  {
    title: "Cadre sécurité",
    description: "Politiques, contrôle d’accès et revues",
    icon: ShieldCheck,
  },
  {
    title: "Parcours onboarding",
    description: "Ressources d’accueil et transferts de contexte",
    icon: GraduationCap,
  },
] as const;

export default function ResourcesPage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#202123]">
      <header className="flex min-h-15.5 shrink-0 items-center justify-between border-b border-white/12 bg-[#202123] px-5">
        <div className="flex h-full items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-sm bg-[#5d5bd4] text-white">
              <BookOpenText className="size-4.5" />
            </span>
            <h1 className="text-lg font-semibold">Ressources</h1>
          </div>
          <button
            type="button"
            className="relative flex h-full items-center px-1 text-sm font-semibold"
          >
            Bibliothèque
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7775ff]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-sm">
            Nouvelle ressource
            <Plus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="rounded-sm" aria-label="Plus d’options">
            <MoreHorizontal className="size-4 text-[#8b89ff]" />
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(520px,1fr)_minmax(320px,0.72fr)]">
        <section className="flex min-h-0 flex-col border-r border-white/12">
          <div className="flex min-h-12.5 flex-wrap items-center gap-2 border-b border-white/12 px-5 py-2">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold">
              <ChevronDown className="size-3.5" />
              Vue d’ensemble
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {categories.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  className={cn(
                    "rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200 transition-colors hover:bg-white/5",
                    index === 0 && "border-[#7775ff] bg-[#7775ff] font-semibold text-white"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="group flex items-center gap-3 border-b border-white/7 px-5 py-3 transition-colors hover:bg-white/2.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/5 text-zinc-200">
                  <FileStack className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{resource.title}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{resource.description}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    resource.accent
                  )}
                >
                  {resource.label}
                </span>
              </article>
            ))}
          </div>
        </section>

        <aside className="hidden min-h-0 flex-col xl:flex">
          <div className="flex h-12.5 shrink-0 items-center justify-between border-b border-white/12 px-5">
            <h2 className="text-base font-semibold">Accès rapide</h2>
            <Button variant="ghost" size="icon-sm" className="rounded-sm" aria-label="Gérer l’accès rapide">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
          <div className="space-y-3 p-5">
            {quickAccess.map((entry) => {
              const Icon = entry.icon;

              return (
                <button
                  key={entry.title}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-sm border border-white/8 bg-white/2 p-3 text-left transition-colors hover:bg-white/5"
                >
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-sm bg-white/5 text-zinc-200">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{entry.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{entry.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
