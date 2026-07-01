import * as React from "react";
import { AppWindow, Blocks, ChevronDown, Search, Workflow } from "lucide-react";

import { applicationNavSections } from "@/lib/applications";
import { cn } from "@/lib/utils";

export function ApplicationsCatalogSidebar() {
  return (
    <aside className="hidden h-full min-h-0 w-73 shrink-0 overflow-hidden border-r border-[#3a3a3a] bg-[#111111] text-[#d7d7d7] lg:flex lg:flex-col">
      <div className="flex h-15.5 items-center border-b border-[#303030] px-4">
        <h1 className="text-xl font-semibold">Applications</h1>
      </div>
      <div className="px-1.5 py-2.5">
        <label className="flex h-8.5 items-center gap-2 rounded-[4px] bg-[#2d2d2d] px-3 text-sm text-[#b7b7b7] ring-1 ring-white/4">
          <span className="sr-only">Rechercher des applications</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-[#aaa]"
            placeholder="Rechercher des applications et bien plus encore"
          />
          <Search className="size-4 shrink-0" />
        </label>
      </div>
      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1.5 pb-6 text-sm" aria-label="Catalogue d'applications">
        {applicationNavSections.map((section, sectionIndex) => (
          <div key={section.label}>
            <div
              className={cn(
                "flex h-10 w-full items-center justify-between font-semibold text-white",
                sectionIndex === 0 ? "rounded-[4px] border border-[#343434] bg-[#242424]" : "px-9"
              )}
            >
              <span className={cn("flex items-center gap-2", sectionIndex === 0 && "px-3")}>
                {sectionIndex === 0 ? <AppWindow className="size-4" /> : null}
                {section.label}
              </span>
              {sectionIndex === 0 ? (
                <span className="flex h-full w-11 items-center justify-center border-l border-[#3a3a3a]">
                  <ChevronDown className="size-4" />
                </span>
              ) : null}
            </div>
            <div className="mt-2 space-y-1.5 pl-9">
              {section.items.map((item, itemIndex) => (
                <a
                  key={`${section.label}-${item.label}`}
                  className={cn(
                    "block rounded-[3px] px-2 py-0.5 leading-6 text-[#d0d0d0] transition hover:bg-white/5 hover:text-white",
                    sectionIndex === 0 && itemIndex === 0 && "font-semibold text-white"
                  )}
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
              {sectionIndex > 0 ? (
                <a
                  className="block px-2 py-0.5 text-xs font-medium text-[#8b89ff] hover:text-[#a5a3ff]"
                  href={section.items[0]?.href}
                >
                  Voir plus
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-[#303030] bg-[#111111] px-1.5 py-1.5">
        <a
          className="flex h-11 items-center justify-between rounded-[4px] border border-[#343434] bg-[#171717] text-sm font-semibold text-white hover:bg-[#202020]"
          href="#populaires-sur-aether"
        >
          <span className="flex items-center gap-2 px-3">
            <Workflow className="size-4" />
            Flux de travail
          </span>
          <span className="flex h-full w-11 items-center justify-center border-l border-[#343434]">
            <ChevronDown className="size-4" />
          </span>
        </a>
        <a
          className="mt-1 flex h-9 items-center gap-2 rounded-[4px] px-3 text-sm text-zinc-200 hover:bg-white/6 hover:text-white"
          href="#recommandes"
        >
          <Blocks className="size-4" />
          Gérer vos applications
        </a>
      </div>
    </aside>
  );
}
