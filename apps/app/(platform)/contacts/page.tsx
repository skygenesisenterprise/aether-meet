import {
  Building2,
  ChevronDown,
  ContactRound,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  UserPlus,
  Video,
} from "lucide-react";

import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { Button } from "@/components/ui/button";
import { people } from "@/lib/platform-data";
import { cn } from "@/lib/utils";

const filters = ["Tous", "En ligne", "Équipe cœur", "Clients", "Partenaires"] as const;

const contactGroups = [
  {
    title: "Produit & design",
    members: "8 personnes",
    icon: Building2,
  },
  {
    title: "Comptes stratégiques",
    members: "5 personnes",
    icon: ContactRound,
  },
  {
    title: "Support prioritaire",
    members: "3 personnes",
    icon: Phone,
  },
] as const;

export default function ContactsPage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#202123]">
      <header className="flex min-h-15.5 shrink-0 items-center justify-between border-b border-white/12 bg-[#202123] px-5">
        <div className="flex h-full items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-sm bg-[#5d5bd4] text-white">
              <ContactRound className="size-4.5" />
            </span>
            <h1 className="text-lg font-semibold">Contacts</h1>
          </div>
          <button
            type="button"
            className="relative flex h-full items-center px-1 text-sm font-semibold"
          >
            Annuaire
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7775ff]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-sm">
            Ajouter un contact
            <UserPlus className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="rounded-sm" aria-label="Plus d’options">
            <MoreHorizontal className="size-4 text-[#8b89ff]" />
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(560px,1fr)_minmax(300px,0.68fr)]">
        <section className="flex min-h-0 flex-col border-r border-white/12">
          <div className="flex min-h-12.5 flex-wrap items-center gap-2 border-b border-white/12 px-5 py-2">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold">
              <ChevronDown className="size-3.5" />
              Personnes
            </button>
            <div className="relative ml-auto min-w-60 flex-1 xl:max-w-xs xl:flex-none">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                className="h-8 w-full rounded-sm border border-white/10 bg-white/5 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500"
                placeholder="Rechercher un nom, rôle ou équipe"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-white/12 px-5 py-3">
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
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {people.map((person) => (
              <article
                key={person.id}
                className="group flex items-center gap-3 border-b border-white/7 px-5 py-3 transition-colors hover:bg-white/2.5"
              >
                <PresenceAvatar initials={person.initials} status={person.status} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{person.role}</p>
                </div>
                <div className="hidden items-center gap-1 sm:flex">
                  <Button variant="ghost" size="icon-sm" className="rounded-sm opacity-70 group-hover:opacity-100">
                    <Mail className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="rounded-sm opacity-70 group-hover:opacity-100">
                    <Phone className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="rounded-sm opacity-70 group-hover:opacity-100">
                    <Video className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="hidden min-h-0 flex-col xl:flex">
          <div className="flex h-12.5 shrink-0 items-center justify-between border-b border-white/12 px-5">
            <h2 className="text-base font-semibold">Groupes</h2>
            <Button variant="ghost" size="icon-sm" className="rounded-sm" aria-label="Créer un groupe">
              <UserPlus className="size-4" />
            </Button>
          </div>
          <div className="space-y-3 p-5">
            {contactGroups.map((group) => {
              const Icon = group.icon;

              return (
                <button
                  key={group.title}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-sm border border-white/8 bg-white/2 p-3 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex size-8 items-center justify-center rounded-sm bg-white/5 text-zinc-200">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{group.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{group.members}</span>
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
