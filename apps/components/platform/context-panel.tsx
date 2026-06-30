"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  UserRound, 
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
  Pencil,
  PhoneIncoming,
  PhoneOff,
  Plus,
  Search,
  Share2,
  Settings2,
  Star,
  UsersRound,
  Trash2,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { currentUser, people, teams } from "@/lib/platform-data";
import { notifications } from "@/lib/platform-notifications";
import { useChatStore } from "@/lib/chat-store";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { usePlatform } from "@/context/PlatformContext";
import { getSharedRealtimeClient } from "@/lib/api/realtime/client";
import { getMembers } from "@/lib/api/chat-service";
import type { ChatServiceDeps } from "@/lib/api/chat-service";
import { normalizePresenceStatus, resolvePresenceStatus } from "@/lib/presence";

interface PanelTitleProps {
  title: string;
  onCreate?: () => void;
  onEdit?: () => void;
  editActive?: boolean;
  editLabel?: string;
}

function PanelTitle({ title, onCreate, onEdit, editActive = false, editLabel }: PanelTitleProps) {
  return (
    <div className="flex h-15.5 items-center justify-between border-b border-white/7 px-5">
      <h2 className="text-base font-semibold tracking-tight text-zinc-100">{title}</h2>
      <div className="flex items-center gap-1">
        {onEdit ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-lg text-zinc-500 hover:text-white",
              editActive && "bg-violet-500/15 text-violet-200 hover:text-violet-100"
            )}
            onClick={onEdit}
            aria-label={editLabel ?? "Sélectionner des conversations"}
          >
            <Pencil className="size-4" />
            <span className="sr-only">{editLabel ?? "Sélectionner des conversations"}</span>
          </Button>
        ) : (
          <Button variant="ghost" size="icon-sm" className="rounded-lg">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Plus d’options</span>
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" className="rounded-lg" onClick={onCreate}>
          <Plus className="size-4" />
          <span className="sr-only">Créer</span>
        </Button>
      </div>
    </div>
  );
}

function formatPresenceLabel(status?: string): string {
  switch (status) {
    case "online":
      return "Connecté";
    case "busy":
      return "Occupé";
    case "away":
      return "Absent";
    default:
      return "Hors ligne";
  }
}

function ChatPanel() {
  const { activeWorkspaceId, currentUser, lastRealtimeEvent, isRealtimeConnected } = usePlatform();
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const customConversations = useChatStore((s) => s.customConversations);
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const customMessages = useChatStore((s) => s.customMessages);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const createConversation = useChatStore((s) => s.createConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const typingByConversation = useChatStore((s) => s.typingByConversation);
  const [activeFilter, setActiveFilter] = React.useState<"unread" | "channel" | "dm">("dm");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedConversationIds, setSelectedConversationIds] = React.useState<string[]>([]);
  const [pendingDeleteConversations, setPendingDeleteConversations] = React.useState<Array<{
    id: string;
    name: string;
  }> | null>(null);
  const [conversationType, setConversationType] = React.useState<"dm" | "channel">("dm");
  const [groupName, setGroupName] = React.useState("");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [members, setMembers] = React.useState<Array<{ id: string; displayName: string; initials: string; presenceStatus?: string; status?: string; lastSeenAt?: string }>>([]);
  const [memberSearch, setMemberSearch] = React.useState("");
  const [realtimePresence, setRealtimePresence] = React.useState<Record<string, string>>({});

  const deps: ChatServiceDeps = React.useMemo(
    () => ({ workspaceId: activeWorkspaceId, currentUser: currentUser ?? null }),
    [activeWorkspaceId, currentUser]
  );

  const loadMembers = React.useCallback(async () => {
    const items = await getMembers(deps).catch(() => []);
    setMembers(
      items.map((m) => ({
        ...m,
        initials: m.displayName
          .split(" ")
          .map((p) => p[0] ?? "")
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }))
    );
  }, [deps]);

  React.useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      return;
    }

    const refreshMembers = () => {
      void loadMembers();
    };

    const interval = window.setInterval(refreshMembers, 15000);
    const handleFocus = () => refreshMembers();

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [activeWorkspaceId, loadMembers]);

  React.useEffect(() => {
    if (!activeWorkspaceId || !lastRealtimeEvent?.workspaceId) {
      return;
    }

    if (lastRealtimeEvent.workspaceId !== activeWorkspaceId) {
      return;
    }

    const type = lastRealtimeEvent.type.toLowerCase();
    const shouldRefreshMembers =
      type.startsWith("presence.") ||
      type.startsWith("user.") ||
      type.startsWith("member.") ||
      type.startsWith("membership.");

    if (!shouldRefreshMembers) {
      return;
    }

    void loadMembers();
  }, [activeWorkspaceId, lastRealtimeEvent, loadMembers]);

  React.useEffect(() => {
    if (!activeWorkspaceId) return;

    const realtime = getSharedRealtimeClient();
    const subscription = realtime.subscribe((event) => {
      if (event.type === "presence.updated" && event.actorId) {
        const state = (event.data as Record<string, unknown>)?.state;
        if (typeof state === "string") {
          setRealtimePresence((prev) => ({ ...prev, [event.actorId!]: state }));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      setRealtimePresence({});
    };
  }, [activeWorkspaceId]);

  const membersById = React.useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const getConversationIdentity = React.useCallback(
    (conversation: { type: "dm" | "channel"; name: string; initials: string; memberIds: string[] }) => {
      if (conversation.type !== "dm") {
        return { label: conversation.name, initials: conversation.initials, status: undefined as string | undefined };
      }

      const currentUserId = currentUser?.id ?? "";
      const otherMemberId = conversation.memberIds.find((memberId) => memberId !== currentUserId);
      const isSelf = !otherMemberId;
      const otherMember = otherMemberId ? membersById.get(otherMemberId) : null;

      let status: string | undefined;
      if (otherMemberId && realtimePresence[otherMemberId]) {
        status = normalizePresenceStatus(realtimePresence[otherMemberId]);
      } else if (isSelf && currentUser) {
        status = resolvePresenceStatus({
          presenceStatus: currentUser.presenceStatus,
          status: currentUser.status,
          lastSeenAt: currentUser.lastSeenAt,
          isRealtimeConnected,
          isCurrentSession: true,
        });
      } else if (otherMember) {
        status = resolvePresenceStatus({
          presenceStatus: otherMember.presenceStatus,
          status: otherMember.status,
          lastSeenAt: otherMember.lastSeenAt,
          isRealtimeConnected,
        });
      }

      return {
        label: otherMember?.displayName ?? conversation.name,
        initials: otherMember?.initials ?? conversation.initials,
        status,
      };
    },
    [currentUser, membersById, isRealtimeConnected, realtimePresence]
  );

  const availableMembers = React.useMemo(() => {
    const currentUserId = currentUser?.id ?? "";
    return members.filter((m) => {
      if (m.id === currentUserId) return false;
      if (!memberSearch.trim()) return true;
      return m.displayName.toLowerCase().includes(memberSearch.toLowerCase());
    });
  }, [members, currentUser, memberSearch]);

  const conversationList = React.useMemo(() => {
    const customConversationIds = new Set(customConversations.map((conversation) => conversation.id));
    const mergedConversations = [
      ...customConversations,
      ...conversations.filter((conversation) => !customConversationIds.has(conversation.id)),
    ];

    const getLatestActivity = (conversationId: string, fallback?: string) => {
      const conversationMessages = customMessages[conversationId] ?? messages[conversationId] ?? [];
      const datedMessages = conversationMessages.filter((message) => Boolean(message.createdAt));

      if (datedMessages.length > 0) {
        const latestTimestamp = Math.max(
          ...datedMessages.map((message) =>
            new Date(message.editedAt ?? message.createdAt ?? 0).getTime()
          )
        );
        return latestTimestamp;
      }

      return fallback ? new Date(fallback).getTime() : 0;
    };

    return [...mergedConversations].sort(
      (left, right) =>
        getLatestActivity(right.id, right.lastActivityAt) - getLatestActivity(left.id, left.lastActivityAt)
    );
  }, [conversations, customConversations, messages, customMessages]);
  const filteredConversations = React.useMemo(() => {
    if (activeFilter === "unread") {
      return conversationList.filter((conversation) => (conversation.unread ?? 0) > 0);
    }

    if (activeFilter === "channel") {
      return conversationList.filter((conversation) => conversation.type === "channel");
    }

    return conversationList.filter((conversation) => conversation.type === "dm");
  }, [activeFilter, conversationList]);
  function toggleMember(memberId: string) {
    setSelectedMemberIds((current) =>
      current.includes(memberId) ? current.filter((item) => item !== memberId) : [...current, memberId]
    );
  }

  function toggleConversationSelection(conversationId: string) {
    setSelectedConversationIds((current) =>
      current.includes(conversationId)
        ? current.filter((item) => item !== conversationId)
        : [...current, conversationId]
    );
  }

  function resetDraft() {
    setConversationType("dm");
    setGroupName("");
    setSelectedMemberIds([]);
    setMemberSearch("");
  }

  async function handleCreateConversation() {
    if (conversationType === "dm" && selectedMemberIds.length !== 1) return;
    if (conversationType === "channel" && (selectedMemberIds.length === 0 || !groupName.trim())) return;

    await createConversation({
      type: conversationType,
      name: conversationType === "channel" ? groupName : undefined,
      memberIds: selectedMemberIds,
    }, { workspaceId: activeWorkspaceId, currentUser: currentUser ?? null });
    setCreateOpen(false);
    resetDraft();
  }

  function exitSelectionMode() {
    setIsSelectionMode(false);
    setSelectedConversationIds([]);
  }

  async function handleDeleteConversation() {
    if (!pendingDeleteConversations || pendingDeleteConversations.length === 0) return;

    for (const conversation of pendingDeleteConversations) {
      await deleteConversation(conversation.id, {
        workspaceId: activeWorkspaceId,
        currentUser: currentUser ?? null,
      });
    }

    setPendingDeleteConversations(null);
    exitSelectionMode();
  }

  return (
    <>
      <PanelTitle
        title="Conversations"
        onEdit={() => {
          if (isSelectionMode) {
            exitSelectionMode();
            return;
          }
          setIsSelectionMode(true);
        }}
        editActive={isSelectionMode}
        editLabel={isSelectionMode ? "Quitter la sélection" : "Sélectionner des conversations"}
        onCreate={() => {
          resetDraft();
          setCreateOpen(true);
        }}
      />
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 rounded-md border-white/10 bg-[#242628] pl-9 text-xs"
            placeholder="Filtrer"
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {([
            { label: "Messages", value: "dm" },
            { label: "Canaux", value: "channel" },
            { label: "Non lus", value: "unread" },
          ] as const).map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-zinc-400",
                activeFilter === filter.value && "border-primary/30 bg-primary/10 text-primary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {isSelectionMode ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-violet-500/20 bg-violet-500/8 px-3 py-2">
            <p className="text-[11px] text-zinc-300">
              {selectedConversationIds.length > 0
                ? `${selectedConversationIds.length} conversation${selectedConversationIds.length > 1 ? "s" : ""} sélectionnée${selectedConversationIds.length > 1 ? "s" : ""}`
                : "Sélectionnez les conversations à supprimer"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-md px-2 text-[11px] text-zinc-300"
                onClick={exitSelectionMode}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 rounded-md px-2 text-[11px]"
                disabled={selectedConversationIds.length === 0}
                onClick={() =>
                  setPendingDeleteConversations(
                    filteredConversations
                      .filter((conversation) => selectedConversationIds.includes(conversation.id))
                      .map((conversation) => ({
                        id: conversation.id,
                        name: getConversationIdentity(conversation).label,
                      }))
                  )
                }
              >
                Supprimer
              </Button>
            </div>
          </div>
        ) : null}
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
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const conversationIdentity = getConversationIdentity(conversation);
                const isSelected = selectedConversationIds.includes(conversation.id);

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex w-full items-center rounded-md px-2.5 py-2.5 text-left transition-colors hover:bg-white/5",
                      !isSelectionMode && activeConversationId === conversation.id && "bg-violet-500/10",
                      isSelectionMode && isSelected && "bg-violet-500/10"
                    )}
                  >
                    {isSelectionMode ? (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleConversationSelection(conversation.id)}
                        className={cn(
                          "mr-3 shrink-0 border-white/20 data-[state=checked]:border-violet-400 data-[state=checked]:bg-violet-500/20",
                          isSelected && "border-violet-400"
                        )}
                        aria-label={`Sélectionner ${conversationIdentity.label}`}
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelectionMode) {
                          toggleConversationSelection(conversation.id);
                          return;
                        }

                        setActiveConversation(
                          activeConversationId === conversation.id ? null : conversation.id
                        );
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <PresenceAvatar
                        initials={conversationIdentity.initials}
                        status={conversationIdentity.status}
                        className="size-9"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">{conversationIdentity.label}</span>
                          <span className="text-[10px] text-muted-foreground">{conversation.time}</span>
                        </span>
                        <span className="mt-0.5 flex items-start gap-2">
                          {typingByConversation[conversation.id]?.length > 0 ? (
                            <span className="flex min-w-0 flex-1 items-center gap-1 text-xs text-emerald-400">
                              {typingByConversation[conversation.id][0].name}
                              <span className="text-zinc-500">écrit</span>
                              {[0, 1].map((index) => (
                                <span
                                  key={index}
                                  className="inline-block size-1 rounded-full bg-emerald-400 animate-bounce"
                                  style={{ animationDelay: `${index * 200}ms`, animationDuration: "1s" }}
                                />
                              ))}
                            </span>
                          ) : (
                            <span className="line-clamp-2 min-w-0 flex-1 text-xs leading-5 text-muted-foreground">
                              {conversation.preview}
                            </span>
                          )}
                          {conversation.unread ? (
                            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                              {conversation.unread}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="rounded-md border border-dashed border-white/10 bg-black/10 px-3 py-4 text-sm text-zinc-400">
                Aucun résultat pour ce filtre.
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetDraft();
        }}
      >
        <DialogContent className="border-white/10 bg-[#1f2123] text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Nouvelle conversation</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Choisissez un type de conversation et sélectionnez les participants.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={conversationType === "dm" ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "rounded-lg text-xs",
                  conversationType === "dm" && "bg-violet-500/15 text-violet-200 border-violet-500/30"
                )}
                onClick={() => {
                  setConversationType("dm");
                  setGroupName("");
                  setSelectedMemberIds((current) => current.slice(0, 1));
                }}
              >
                Conversation privée
              </Button>
              <Button
                type="button"
                variant={conversationType === "channel" ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "rounded-lg text-xs",
                  conversationType === "channel" && "bg-violet-500/15 text-violet-200 border-violet-500/30"
                )}
                onClick={() => setConversationType("channel")}
              >
                Groupe
              </Button>
            </div>

            {conversationType === "channel" && (
              <div className="space-y-1.5">
                <label htmlFor="group-name" className="text-xs font-medium text-zinc-300">
                  Nom du groupe
                </label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Ex. Squad lancement"
                  className="h-9 rounded-lg border-white/10 bg-black/20 text-sm placeholder:text-zinc-600"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-300">
                {conversationType === "dm" ? "Choisir une personne" : "Ajouter des participants"}
              </p>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="h-8 rounded-lg border-white/10 bg-black/20 pl-8 text-xs placeholder:text-zinc-600"
                />
              </div>
              <div className="max-h-56 space-y-0.5 overflow-auto rounded-lg border border-white/8 bg-black/15 p-1.5">
                {availableMembers.length > 0 ? (
                  availableMembers.map((member) => {
                    const checked = selectedMemberIds.includes(member.id);

                    return (
                      <label
                        key={member.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-white/5",
                          checked && "bg-violet-500/10"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          className={cn(checked && "border-violet-400 text-violet-400")}
                          onCheckedChange={() => {
                            if (conversationType === "dm") {
                              setSelectedMemberIds(checked ? [] : [member.id]);
                              return;
                            }
                            toggleMember(member.id);
                          }}
                        />
                        <PresenceAvatar
                          initials={member.initials}
                          status={
                            realtimePresence[member.id]
                              ? normalizePresenceStatus(realtimePresence[member.id])
                              : resolvePresenceStatus({
                                  presenceStatus: member.presenceStatus,
                                  status: member.status,
                                  lastSeenAt: member.lastSeenAt,
                                  isRealtimeConnected,
                                })
                          }
                          className="size-7"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-zinc-200">
                            {member.displayName}
                          </span>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-6 text-xs text-zinc-500">
                    Aucun membre trouvé
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border-white/10 text-xs"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={
                conversationType === "dm"
                  ? selectedMemberIds.length !== 1
                  : selectedMemberIds.length === 0 || !groupName.trim()
              }
              className="rounded-lg bg-violet-500/90 text-xs hover:bg-violet-500 disabled:opacity-40"
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDeleteConversations !== null} onOpenChange={(open) => !open && setPendingDeleteConversations(null)}>
        <DialogContent className="border-white/10 bg-[#1f2123] text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {pendingDeleteConversations && pendingDeleteConversations.length > 1
                ? "Supprimer les conversations"
                : "Supprimer la conversation"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              {pendingDeleteConversations && pendingDeleteConversations.length > 1
                ? "Ces conversations disparaîtront de votre liste. Les autres participants peuvent encore y accéder si elles existent pour eux."
                : "Cette conversation disparaîtra de votre liste. Les autres participants peuvent encore y accéder si elle existe pour eux."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-sm text-zinc-300">
            {pendingDeleteConversations?.map((conversation) => (
              <div key={conversation.id}>{conversation.name}</div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDeleteConversations(null)}
              className="rounded-lg border-white/10 text-xs"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              className="rounded-lg text-xs"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TeamsPanel() {
  const searchParams = useSearchParams();
  const activeTeam = searchParams.get("team");
  const activeChannel = searchParams.get("channel");
  const activeView = searchParams.get("view") ?? "all";
  const [expandedTeams, setExpandedTeams] = React.useState<string[]>(teams.map((team) => team.id));

  function toggleTeam(teamId: string) {
    setExpandedTeams((current) =>
      current.includes(teamId) ? current.filter((item) => item !== teamId) : [...current, teamId]
    );
  }

  return (
    <>
      <PanelTitle title="Équipes" />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-3">
          <nav className="space-y-1">
            <Link
              href="/teams?view=all"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                activeView === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <UsersRound className="size-4" />
              Toutes les équipes
            </Link>
            <Link
              href="/teams?view=favorites"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
                activeView === "favorites"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Star className="size-4" />
              Favoris
            </Link>
          </nav>
          <Separator />
          {teams.map((team) => (
            <div key={team.id}>
              <button
                type="button"
                onClick={() => toggleTeam(team.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted/50",
                  activeTeam === team.id && "text-primary"
                )}
              >
                <ChevronDown
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform",
                    expandedTeams.includes(team.id) && "rotate-0",
                    !expandedTeams.includes(team.id) && "-rotate-90"
                  )}
                />
                <span className="truncate">{team.name}</span>
              </button>
              {expandedTeams.includes(team.id) ? (
                <div className="ml-5 space-y-0.5">
                  {team.channels.slice(0, 3).map((channel) => (
                    <Link
                      key={channel}
                      href={`/teams?team=${team.id}&channel=${encodeURIComponent(channel)}`}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/50",
                        activeTeam === team.id && activeChannel === channel
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Hash className="size-3.5" />
                      {channel}
                    </Link>
                  ))}
                </div>
              ) : null}
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
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") ?? "home";

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
            { label: "Accueil", icon: Home, value: "home" },
            { label: "Mes fichiers", icon: Folder, value: "my-files" },
            { label: "Partagé", icon: Share2, value: "shared" },
            { label: "Favoris", icon: Star, value: "favorites" },
            { label: "Corbeille", icon: Trash2, value: "trash" },
          ].map((item) => (
            <Link
              key={item.label}
              href={`/drive?section=${item.value}`}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-sm px-4 py-2 text-sm text-zinc-300 hover:bg-white/5",
                activeSection === item.value && "font-semibold"
              )}
            >
              {activeSection === item.value ? (
                <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-[#7775ff]" />
              ) : null}
              <item.icon
                className={cn("size-4 text-zinc-400", activeSection === item.value && "text-[#8b89ff]")}
              />
              {item.label}
            </Link>
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

export function ContextPanel() {
  const pathname = usePathname();

  let content: React.ReactNode = <HomePanel />;
  if (pathname.startsWith("/notifications")) content = <NotificationsPanel />;
  if (pathname.startsWith("/chat")) content = <ChatPanel />;
  if (pathname.startsWith("/teams")) content = <TeamsPanel />;
  if (pathname.startsWith("/calendar")) content = <CalendarPanel />;
  if (pathname.startsWith("/calls")) content = <CallsPanel />;
  if (pathname.startsWith("/drive")) content = <DrivePanel />;

  return (
    <aside className="hidden h-full w-90 shrink-0 flex-col border-r border-white/7 bg-[#17191b] text-zinc-200 lg:flex">
      {content}
    </aside>
  );
}
