"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Info,
  MoreHorizontal,
  Phone,
  Search,
  UsersRound,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageComposer } from "@/components/platform/message-composer";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { useChatStore } from "@/lib/chat-store";
import {
  conversations,
  conversationMessages,
  currentUser,
  people,
  type Person,
} from "@/lib/platform-data";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const router = useRouter();
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const customConversations = useChatStore((s) => s.customConversations);
  const customMessages = useChatStore((s) => s.customMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const allConversations = React.useMemo(() => {
    const customConversationIds = new Set(customConversations.map((conversation) => conversation.id));
    return [
      ...customConversations,
      ...conversations.filter((conversation) => !customConversationIds.has(conversation.id)),
    ];
  }, [customConversations]);
  const conversation =
    allConversations.find((item) => item.id === activeConversationId) ?? allConversations[0];
  const messages = customMessages[activeConversationId] ?? conversationMessages[activeConversationId] ?? [];
  const [callMode, setCallMode] = React.useState<"audio" | "video" | null>(null);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const members = conversation.memberIds
    .map((memberId) => peopleById.get(memberId))
    .filter((member): member is Person => Boolean(member));
  const otherMembers = members.filter((member) => member.id !== currentUser.id);
  const openCall = (mode: "audio" | "video") => {
    setInfoOpen(false);
    setCallMode(mode);
  };
  const launchCall = () => {
    if (!callMode) return;
    const params = new URLSearchParams({
      conversationId: conversation.id,
      mode: callMode,
    });
    setCallMode(null);
    router.push(`/calls/room?${params.toString()}`);
  };
  const callTargets =
    conversation.type === "dm"
      ? otherMembers.map((member) => member.name).join(", ")
      : conversation.name;
  const callDescription =
    conversation.type === "dm"
      ? `${callMode === "video" ? "Visioconférence" : "Appel audio"} avec ${callTargets}.`
      : `${callMode === "video" ? "Réunion vidéo" : "Appel de groupe"} dans ${conversation.name}.`;

  return (
    <>
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
              onClick={() => openCall("audio")}
            >
              <Phone className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-label="Démarrer un appel vidéo"
              onClick={() => openCall("video")}
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
                onClick={() => setInfoOpen(true)}
              >
                <UsersRound className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-label="Informations de la conversation"
              onClick={() => setInfoOpen(true)}
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
            {messages.map((message) => {
              const isOwnMessage = message.authorId === currentUser.id;
              const author = peopleById.get(message.authorId);

              return (
                <article
                  key={message.id}
                  className={cn("group flex gap-3", isOwnMessage && "justify-end")}
                >
                  {!isOwnMessage && (
                    <PresenceAvatar
                      initials={message.initials}
                      status={author?.status ?? "offline"}
                      className="size-9"
                    />
                  )}
                  <div
                    className={cn(
                      "min-w-0 max-w-[min(100%,42rem)]",
                      isOwnMessage && "flex flex-col items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isOwnMessage && "justify-end"
                      )}
                    >
                      {!isOwnMessage && <h2 className="text-sm font-semibold">{message.author}</h2>}
                      <time className="font-mono text-[10px] text-muted-foreground">
                        {message.time}
                      </time>
                      {isOwnMessage && <h2 className="text-sm font-semibold">Vous</h2>}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={cn(
                          "rounded-md opacity-0 transition-opacity group-hover:opacity-100",
                          isOwnMessage ? "order-first" : "ml-auto"
                        )}
                        aria-label="Actions du message"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "mt-1 rounded-2xl px-4 py-3",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-[#2b2d31] text-foreground/90"
                      )}
                    >
                      <p className="text-sm leading-6">{message.content}</p>
                    </div>
                  </div>
                </article>
              );
            })}
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
                  <Button
                    size="sm"
                    className="rounded-md"
                    onClick={() => router.push("/calls/room?conversationId=product&mode=video")}
                  >
                    Rejoindre
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="shrink-0 bg-[#232426] px-4 pb-5 pt-3 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <MessageComposer
              placeholder={`Écrire un message à ${conversation.name}`}
              onSend={(message) => sendMessage(conversation.id, message)}
            />
          </div>
        </div>
      </div>

      <Dialog open={callMode !== null} onOpenChange={(open) => !open && setCallMode(null)}>
        <DialogContent className="border-white/12 bg-[#27282b] text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                {callMode === "video" ? <Video className="size-5" /> : <Phone className="size-5" />}
              </span>
              {callMode === "video" ? "Démarrer une visioconférence" : "Démarrer un appel audio"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {callDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-white/10 bg-black/10 p-4">
            <p className="text-sm font-medium text-zinc-100">
              {conversation.type === "dm" ? callTargets : conversation.name}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {conversation.type === "dm"
                ? `${otherMembers[0]?.role ?? "Contact"} · ${otherMembers[0]?.status ?? "offline"}`
                : `${members.length} participants disponibles dans cette conversation`}
            </p>
            {conversation.type === "channel" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {members.map((member) => (
                  <span
                    key={member.id}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCallMode(null)}>
              Annuler
            </Button>
            <Button onClick={launchCall}>
              {callMode === "video" ? "Lancer la réunion" : "Lancer l’appel"}
              <ArrowRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
        <SheetContent side="right" className="border-white/12 bg-[#27282b] text-zinc-100 sm:max-w-md">
          <SheetHeader className="border-b border-white/8 pb-4">
            <div className="flex items-center gap-3">
              <PresenceAvatar initials={conversation.initials} status={conversation.status} className="size-10" />
              <div className="min-w-0">
                <SheetTitle className="truncate">{conversation.name}</SheetTitle>
                <SheetDescription className="text-zinc-400">
                  {conversation.type === "dm" ? "Conversation individuelle" : "Conversation de groupe"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 px-4 pb-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-100">Détails</h3>
              <div className="rounded-lg border border-white/8 bg-black/10 p-4 text-sm text-zinc-300">
                <p>{conversation.subtitle}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {conversation.type === "dm"
                    ? "Accès rapide aux appels et aux informations du contact."
                    : "Accès rapide aux appels de groupe et à la liste des participants."}
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {conversation.type === "dm" ? "Contact" : "Participants"}
                </h3>
                <span className="text-xs text-zinc-500">{members.length}</span>
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5"
                  >
                    <PresenceAvatar initials={member.initials} status={member.status} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {member.id === currentUser.id ? `${member.name} (Vous)` : member.name}
                      </p>
                      <p className="truncate text-xs text-zinc-400">{member.role}</p>
                    </div>
                    <span className="text-xs capitalize text-zinc-500">{member.status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-100">Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button className="justify-start gap-2" onClick={() => openCall("audio")}>
                  <Phone className="size-4" />
                  {conversation.type === "dm" ? "Appeler ce contact" : "Démarrer un appel de groupe"}
                </Button>
                <Button variant="outline" className="justify-start gap-2" onClick={() => openCall("video")}>
                  <Video className="size-4" />
                  {conversation.type === "dm" ? "Lancer une visioconférence" : "Démarrer une réunion vidéo"}
                </Button>
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
