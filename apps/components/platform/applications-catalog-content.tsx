import * as React from "react";
import { Bot, CheckCircle2, ChevronLeft, ChevronRight, Search, Star } from "lucide-react";

import {
  appreciatedApplications,
  applicationCategoryPills,
  applicationIndustryPills,
  applicationNavSections,
  featuredApplications,
  popularApplications,
  type MarketplaceApp,
} from "@/lib/applications";
import { cn } from "@/lib/utils";

const mobileNavItems = applicationNavSections[0].items.slice(0, 4);

function AppRating({ rating, reviews }: Pick<MarketplaceApp, "rating" | "reviews">) {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-zinc-200">
      <Star className="size-3.5 fill-[#8385ff] text-[#8385ff]" />
      <span>{rating}</span>
      <span className="font-normal text-zinc-400">({reviews})</span>
    </div>
  );
}

function AppTile({ app }: { app: MarketplaceApp }) {
  const Icon = app.icon;

  return (
    <article className="group overflow-hidden rounded-[5px] border border-white/6 bg-[#292929] shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition hover:border-white/14 hover:bg-[#303030]">
      <div className={cn("relative flex h-32 items-center justify-center bg-linear-to-br", app.accent)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_30%)]" />
        <span className="relative flex size-20 items-center justify-center rounded-3xl border border-white/35 bg-white/78 shadow-sm backdrop-blur">
          <Icon className="size-9 text-[#137c84]" strokeWidth={1.8} />
        </span>
        {app.promoted ? (
          <span className="absolute bottom-3 right-3 flex size-6 items-center justify-center rounded-full bg-[#222] text-white shadow">
            <CheckCircle2 className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{app.name}</h3>
            <p className="truncate text-xs text-zinc-300">{app.publisher}</p>
          </div>
          <button className="rounded-lg border border-white/18 px-2.5 py-1 text-xs font-semibold text-white transition hover:border-white/35 hover:bg-white/8">
            {app.action}
          </button>
        </div>
        <p className="line-clamp-2 min-h-9 text-xs leading-4 text-zinc-100">{app.description}</p>
        <AppRating rating={app.rating} reviews={app.reviews} />
      </div>
    </article>
  );
}

function CompactAppRow({ app }: { app: MarketplaceApp }) {
  const Icon = app.icon;

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[5px] border border-white/6 bg-[#292929] p-3 transition hover:border-white/14 hover:bg-[#303030]">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br", app.accent)}>
        <Icon className="size-4.5 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">{app.name}</h3>
        <p className="truncate text-xs text-zinc-300">{app.publisher}</p>
        <AppRating rating={app.rating} reviews={app.reviews} />
      </div>
      <button className="rounded-lg border border-white/18 px-2.5 py-1 text-xs font-semibold text-white transition hover:border-white/35 hover:bg-white/8">
        {app.action}
      </button>
    </article>
  );
}

export function ApplicationsCatalogContent() {
  const hero = featuredApplications[0];
  const HeroIcon = hero.icon;

  return (
    <main
      className="h-full min-w-0 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-5"
      aria-label="Contenu du centre d'applications"
    >
      <div className="mb-5 lg:hidden">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-[#2f2f2f] px-3 text-sm text-zinc-400">
          <span className="sr-only">Rechercher des applications</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-400"
            placeholder="Rechercher des applications"
          />
          <Search className="size-4 shrink-0" />
        </label>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Navigation applications mobile">
          {mobileNavItems.map((item) => (
            <a
              key={item.label}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-100"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <section className="relative overflow-hidden rounded-[5px] bg-[#505050] px-5 py-8 sm:px-16 lg:px-18">
        <button className="absolute left-3 top-1/2 hidden -translate-y-1/2 text-white/90 lg:block" aria-label="Application précédente">
          <ChevronLeft className="size-7" />
        </button>
        <div className="grid min-h-52 gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#c4b5fd] text-[#3b247c]">
                <HeroIcon className="size-5" />
              </span>
              <h2 className="text-2xl font-semibold">{hero.name}</h2>
            </div>
            <p className="max-w-155 text-sm leading-6 text-white">{hero.description}</p>
            <button className="mt-8 text-[11px] font-medium uppercase tracking-wide text-zinc-200 hover:text-white">
              Afficher les détails
            </button>
          </div>
          <div className={cn("relative hidden h-40 overflow-hidden rounded-[3px] bg-linear-to-br lg:block", hero.accent)}>
            <div className="absolute left-8 top-9 h-28 w-52 rounded-sm bg-white/82 shadow-2xl" />
            <div className="absolute left-14 top-14 h-3 w-24 rounded bg-[#5b5fc7]" />
            <div className="absolute left-14 top-24 grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <span key={item} className="size-8 rounded bg-white/75" />
              ))}
            </div>
            <div className="absolute -right-12 bottom-0 size-28 rotate-45 bg-black/28" />
          </div>
        </div>
        <button className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-white/90 lg:block" aria-label="Application suivante">
          <ChevronRight className="size-7" />
        </button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-white" />
          <span className="h-1 w-10 rounded-full bg-white/55" />
          <span className="h-1 w-10 rounded-full bg-white/35" />
          <span className="h-1 w-6 rounded-full bg-white/60" />
        </div>
      </section>

      <section className="mt-7 scroll-mt-6" id="recommandes">
        <h2 className="mb-5 text-base font-semibold">Applications appréciées</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {appreciatedApplications.map((app) => (
            <AppTile key={app.name} app={app} />
          ))}
        </div>
      </section>

      <section className="mt-14 scroll-mt-6" id="populaires-sur-aether">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Populaires sur Aether</h2>
            <p className="text-xs text-zinc-300">Ajouté et utilisé le plus sur Aether Meet</p>
          </div>
          <button className="text-sm font-semibold text-[#8b89ff] hover:text-[#a5a3ff]">Afficher tout</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {popularApplications.map((app) => (
            <CompactAppRow key={app.name} app={app} />
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div id="agents" className="scroll-mt-6 rounded-[5px] border border-white/6 bg-[#292929] p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Agents</h2>
              <p className="mt-1 text-xs text-zinc-300">Extensions intelligentes pour résumer, classer et déclencher des actions.</p>
            </div>
            <Bot className="size-5 text-[#8b89ff]" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featuredApplications.slice(1).map((app) => {
              const Icon = app.icon;

              return (
                <article key={app.name} className={cn("rounded-[5px] bg-linear-to-br p-px", app.accent)}>
                  <div className="h-full rounded-[5px] bg-[#232323] p-4">
                    <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="size-5 text-white" />
                    </span>
                    <h3 className="font-semibold text-white">{app.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-zinc-300">{app.description}</p>
                    <button className="mt-4 rounded-lg border border-white/16 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/8">
                      Demander
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div id="selections" className="scroll-mt-6 rounded-[5px] border border-white/6 bg-[#292929] p-5">
          <h2 className="text-base font-semibold">Sélections</h2>
          <p className="mt-1 text-xs text-zinc-300">Collections prêtes pour les besoins les plus fréquents.</p>
          <div className="mt-5 space-y-3">
            {["Onboarding collaborateur", "Pilotage projet", "Support client"].map((selection) => (
              <a
                key={selection}
                className="flex items-center justify-between rounded-lg border border-white/8 bg-white/4 p-3 text-sm font-semibold text-white hover:bg-white/8"
                href="#populaires-sur-aether"
              >
                {selection}
                <ChevronRight className="size-4 text-zinc-400" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 pb-8 xl:grid-cols-2">
        <div id="categories" className="scroll-mt-6 rounded-[5px] border border-white/6 bg-[#292929] p-5">
          <h2 className="text-base font-semibold">Catégories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {applicationCategoryPills.map((category) => (
              <a key={category} className="rounded-full bg-white/6 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white" href="#recommandes">
                {category}
              </a>
            ))}
          </div>
        </div>
        <div id="secteurs" className="scroll-mt-6 rounded-[5px] border border-white/6 bg-[#292929] p-5">
          <h2 className="text-base font-semibold">Secteurs d'activité</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {applicationIndustryPills.map((industry) => (
              <a key={industry} className="rounded-full bg-white/6 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white" href="#populaires-sur-aether">
                {industry}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
