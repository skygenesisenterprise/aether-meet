"use client";

import { ChevronDown, Info, MoreHorizontal, Phone, Search, UsersRound, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageComposer } from "@/components/platform/message-composer";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { useChatStore } from "@/lib/chat-store";
import { conversations, conversationMessages } from "@/lib/platform-data";

export default function ChatPage() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversation = conversations.find((c) => c.id === activeConversationId) ?? conversations[0];
  const messages = conversationMessages[activeConversationId] ?? [];

  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <PresenceAvatar initials={conversation.initials} status={conversation.status} className="size-8" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{conversation.name}</h1>
            <p className="truncate text-xs text-zinc-400">{conversation.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Démarrer un appel audio"
          >
            <Phone className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Démarrer un appel vidéo"
          >
            <Video className="size-4" />
          </Button>
          {conversation.type === "channel" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden rounded-md sm:inline-flex"
              aria-label="Rechercher dans la conversation"
            >
              <Search className="size-4" />
            </Button>
          )}
          {conversation.type === "channel" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden rounded-md sm:inline-flex"
              aria-label="Afficher les membres"
            >
              <UsersRound className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label="Informations de la conversation"
          >
            <Info className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex h-10.5 shrink-0 items-center border-b border-violet-400/70 bg-[#252628] px-4 text-sm text-zinc-300">
        <span className="mr-2 text-zinc-400">À :</span>
        <span className="truncate">{conversation.name}</span>
        {conversation.type === "channel" && <span className="truncate text-zinc-500">, canal Design</span>}
        <ChevronDown className="ml-auto size-4 text-zinc-500" />
      </div>

      <ScrollArea key={activeConversationId} className="min-h-0 flex-1 bg-[#232426]">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 lg:px-8">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-white/10" />
            {messages.length > 0 ? "Aujourd’hui" : "Aucun message"}
            <span className="h-px flex-1 bg-white/10" />
          </div>
          {messages.map((message) => (
            <article key={message.id} className="group flex gap-3">
              <PresenceAvatar initials={message.initials} status="online" className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{message.author}</h2>
                  <time className="font-mono text-[10px] text-muted-foreground">
                    {message.time}
                  </time>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ml-auto rounded-md opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Actions du message"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
                <p className="mt-1 text-sm leading-6 text-foreground/90">{message.content}</p>
              </div>
            </article>
          ))}
          {activeConversationId === "product" && (
            <div className="rounded-md border border-primary/20 bg-primary/8 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Video className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Revue du nouveau client</p>
                  <p className="text-xs text-muted-foreground">Aujourd’hui · 15:00 – 16:00</p>
                </div>
                <Button size="sm" className="rounded-md">
                  Rejoindre
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="shrink-0 bg-[#232426] px-4 pb-5 pt-3 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <MessageComposer />
        </div>
      </div>
    </div>
  );
}
