"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Hash,
  Home,
  Image,
  Inbox,
  MessageSquareText,
  MoreHorizontal,
  PhoneIncoming,
  PhoneOff,
  Palette,
  Plus,
  Search,
  Share2,
  Settings2,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
  Video,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { conversations, teams } from "@/lib/platform-data";
import { notifications } from "@/lib/platform-notifications";
import { useChatStore } from "@/lib/chat-store";
import { PresenceAvatar } from "@/components/platform/presence-avatar";

function PanelTitle({ title }: { title: string }) {
  return (
    <div className="flex h-15.5 items-center justify-between border-b border-white/7 px-5">
      <h2 className="text-base font-semibold tracking-tight text-zinc-100">{title}</h2>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" className="rounded-lg">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Plus d’options</span>
        </Button>
        <Button variant="ghost" size="icon-sm" className="rounded-lg">
          <Plus className="size-4" />
          <span className="sr-only">Créer</span>
        </Button>
      </div>
    </div>
  );
}

function ChatPanel() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  return (
    <>
      <PanelTitle title="Conversations" />
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 rounded-md border-white/10 bg-[#242628] pl-9 text-xs"
            placeholder="Filtrer"
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {["Non lus", "Canaux", "Messages"].map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={cn(
                "rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-zinc-400",
                index === 0 && "border-primary/30 bg-primary/10 text-primary"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <Separator className="bg-white/7" />
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <ChevronDown className="size-3.5" />
            <span className="font-medium">Messages récents</span>
          </button>
          <div className="mt-1 space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversation(conversation.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-white/5",
                  activeConversationId === conversation.id && "bg-violet-500/10"
                )}
              >
                <PresenceAvatar
                  initials={conversation.initials}
                  status={conversation.status}
                  className="size-9"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{conversation.name}</span>
                    <span className="text-[10px] text-muted-foreground">{conversation.time}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {conversation.preview}
                    </span>
                    {conversation.unread ? (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

function TeamsPanel() {
  return (
    <>
      <PanelTitle title="Équipes" />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-3">
          <nav className="space-y-1">
            <Link
              href="/teams"
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
            >
              <UsersRound className="size-4" />
              Toutes les équipes
            </Link>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50">
              <Star className="size-4" />
              Favoris
            </button>
          </nav>
          <Separator />
          {teams.map((team) => (
            <div key={team.id}>
              <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted/50">
                <ChevronDown className="size-3.5 text-muted-foreground" />
                <span className="truncate">{team.name}</span>
              </button>
              <div className="ml-5 space-y-0.5">
                {team.channels.slice(0, 3).map((channel) => (
                  <button
                    key={channel}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Hash className="size-3.5" />
                    {channel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}

function CalendarPanel() {
  const miniCalendarDays = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 1, 2, 3, 4, 5,
  ];

  return (
    <>
      <PanelTitle title="Calendrier" />
      <div className="border-b border-white/7 px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="flex items-center gap-2 text-sm font-medium">
            Juin 2026
            <ChevronDown className="size-3.5 text-zinc-500" />
          </button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon-sm" className="rounded-md">
              <ChevronLeft className="size-3.5" />
              <span className="sr-only">Mois précédent</span>
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-md">
              <ChevronRight className="size-3.5" />
              <span className="sr-only">Mois suivant</span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
            <span key={`${day}-${index}`} className="text-[10px] font-medium text-zinc-500">
              {day}
            </span>
          ))}
          {miniCalendarDays.map((day, index) => (
            <button
              key={`${day}-${index}`}
              type="button"
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full text-[11px] text-zinc-300 hover:bg-white/7",
                index >= 30 && "text-zinc-600",
                day === 25 && index === 24 && "bg-violet-500 font-semibold text-white"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 border-b border-white/7 pb-3 text-sm text-violet-300"
          >
            <CalendarPlus className="size-4" />
            Ajouter un calendrier
          </button>
          <div className="mt-5">
            <button
              type="button"
              className="flex w-full items-center gap-2 text-sm font-medium text-zinc-200"
            >
              <ChevronDown className="size-3.5" />
              Mes calendriers
            </button>
            <label className="mt-4 flex cursor-pointer items-center gap-3 pl-6 text-sm text-zinc-300">
              <Checkbox defaultChecked />
              Calendrier Aether
            </label>
            <label className="mt-3 flex cursor-pointer items-center gap-3 pl-6 text-sm text-zinc-300">
              <Checkbox defaultChecked />
              Réunions d’équipe
            </label>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

function CallsPanel() {
  return (
    <>
      <div className="border-b border-white/7 px-4 py-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            className="h-9 rounded-md border-white/8 bg-[#111214] pl-9 text-sm"
            placeholder="Saisir un nom"
          />
        </div>
        <Button
          variant="ghost"
          className="mt-7 w-full rounded-md bg-[#111214] text-zinc-500 hover:bg-[#151618]"
          disabled
        >
          <PhoneIncoming className="size-4" />
          Appeler
        </Button>
      </div>
      <div className="flex-1" />
      <nav className="space-y-1 border-t border-white/7 p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-white/5">
          <PhoneOff className="size-4 text-zinc-400" />
          Ne pas transférer
          <ChevronDown className="ml-auto size-3.5 text-zinc-500" />
        </button>
        <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-zinc-300 hover:bg-white/5">
          <Settings2 className="size-4 text-zinc-400" />
          Installation personnalisée
          <ChevronDown className="ml-auto size-3.5 text-zinc-500" />
        </button>
      </nav>
    </>
  );
}

function DrivePanel() {
  return (
    <>
      <PanelTitle title="Aether Drive" />
      <div className="px-4 py-4">
        <Button className="w-full justify-start rounded-sm">
          <Plus className="size-5" />
          Créer ou charger
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-0.5 px-2">
          {[
            { label: "Accueil", icon: Home, active: true },
            { label: "Mes fichiers", icon: Folder },
            { label: "Partagé", icon: Share2 },
            { label: "Favoris", icon: Star },
            { label: "Corbeille", icon: Trash2 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "relative flex w-full items-center gap-3 rounded-sm px-4 py-2 text-sm text-zinc-300 hover:bg-white/5",
                item.active && "font-semibold"
              )}
            >
              {item.active ? (
                <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-[#7775ff]" />
              ) : null}
              <item.icon className={cn("size-4 text-zinc-400", item.active && "text-[#8b89ff]")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-5 pt-5">
          <h3 className="text-sm font-semibold text-zinc-100">Parcourir les fichiers par</h3>
          <nav className="mt-3 space-y-0.5">
            {[
              { label: "Personnes", icon: UserRound },
              { label: "Réunions", icon: CalendarDays },
              { label: "Média", icon: Image },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-sm py-2 text-sm text-zinc-300 hover:text-white"
              >
                <item.icon className="size-4 text-zinc-400" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-5 pt-5">
          <h3 className="text-sm font-semibold text-zinc-100">Accès rapide</h3>
          <button type="button" className="mt-4 text-xs font-medium text-[#8b89ff] hover:underline">
            Autres emplacements...
          </button>
        </div>
      </ScrollArea>
    </>
  );
}

function HomePanel() {
  return (
    <>
      <PanelTitle title="Aether Meet" />
      <nav className="space-y-1 p-3">
        <Link
          href="/home"
          className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
        >
          <Inbox className="size-4" />
          Vue d’ensemble
        </Link>
        <Link
          href="/calendar"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
        >
          <CalendarDays className="size-4" />
          Ma journée
        </Link>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
        >
          <MessageSquareText className="size-4" />À traiter
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
            4
          </span>
        </Link>
      </nav>
      <Separator />
      <div className="p-4">
        <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 to-transparent p-4">
          <Video className="size-5 text-primary" />
          <p className="mt-3 text-sm font-medium">Revue du nouveau client</p>
          <p className="mt-1 text-xs text-muted-foreground">Aujourd’hui à 15:00</p>
          <Button size="sm" className="mt-4 w-full rounded-xl">
            Rejoindre
          </Button>
        </div>
      </div>
    </>
  );
}

function NotificationsPanel() {
  return (
    <>
      <PanelTitle title="Activité" />
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 rounded-xl bg-muted/35 pl-9" placeholder="Rechercher" />
        </div>
        <div className="mt-3 flex gap-1.5">
          {["Toutes", "Non lues", "Mentions"].map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs text-muted-foreground",
                index === 0 && "border-primary/30 bg-primary/10 text-primary"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <Separator />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {notifications.slice(0, 5).map((notification) => (
            <Link
              key={notification.id}
              href="/notifications"
              className={cn(
                "flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50",
                !notification.read && "bg-primary/7"
              )}
            >
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Bell className="size-4" />
                {!notification.read ? (
                  <span className="absolute right-0 top-0 size-2 rounded-full border-2 border-card bg-primary" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{notification.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {notification.description}
                </span>
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  {notification.time}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}

function SettingsPanel() {
  const entries = [
    { label: "Compte", icon: UserRound },
    { label: "Apparence", icon: Palette },
    { label: "Notifications", icon: Bell },
    { label: "Audio et vidéo", icon: Video },
    { label: "Confidentialité", icon: ShieldCheck },
  ];

  return (
    <>
      <PanelTitle title="Réglages" />
      <nav className="space-y-1 p-3">
        {entries.map((entry, index) => (
          <Link
            key={entry.label}
            href="/setings"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              index === 0 && "bg-violet-500/10 text-violet-300"
            )}
          >
            <entry.icon className="size-4" />
            {entry.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function ContextPanel() {
  const pathname = usePathname();

  let content: React.ReactNode = <HomePanel />;
  if (pathname.startsWith("/notifications")) content = <NotificationsPanel />;
  if (pathname.startsWith("/chat")) content = <ChatPanel />;
  if (pathname.startsWith("/teams")) content = <TeamsPanel />;
  if (pathname.startsWith("/calendar")) content = <CalendarPanel />;
  if (pathname.startsWith("/calls")) content = <CallsPanel />;
  if (pathname.startsWith("/drive")) content = <DrivePanel />;
  if (pathname.startsWith("/setings")) content = <SettingsPanel />;

  return (
    <aside className="hidden h-full w-90 shrink-0 flex-col border-r border-white/7 bg-[#17191b] text-zinc-200 lg:flex">
      {content}
    </aside>
  );
}
