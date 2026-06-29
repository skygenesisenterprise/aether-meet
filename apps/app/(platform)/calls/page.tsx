"use client";

import * as React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ContactRound,
  Filter,
  MoreHorizontal,
  Phone,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/context/PlatformContext";
import { listCallHistory } from "@/lib/api/calls";
import { listConversations } from "@/lib/api/conversations";
import { listContacts } from "@/lib/api/contacts";
import { ApiError } from "@/lib/api/errors";
import { listMeetings } from "@/lib/api/meetings";
import { listWorkspaceMembers } from "@/lib/api/members";
import type { CallHistoryItem, Contact, Conversation, Meeting, User, WorkspaceMember } from "@/lib/api/types";

interface CallLogItem {
  id: string;
  name: string;
  initials: string;
  type: "Sortant" | "Manqué" | "Entrant";
  time: string;
  duration: string;
  missed: boolean;
  video: boolean;
  timestamp: number;
}

const filters = ["Tout", "Manqué(s)", "Entrant", "Sortant", "Messagerie vocale"];

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function formatCallTime(isoString: string | undefined): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (days === 0) return `Aujourd’hui, ${time}`;
  if (days === 1) return `Hier, ${time}`;
  return `${date.toLocaleDateString("fr-FR")}, ${time}`;
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const min = Math.floor(seconds / 60);
  if (min < 1) return "< 1 min";
  return `${min} min`;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseTimestamp(value: unknown): number | undefined {
  const raw = getString(value);
  if (!raw) return undefined;
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
}

function looksLikeOpaqueIdentifier(value: string | undefined): boolean {
  if (!value) return false;

  const normalized = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized);
}

function resolveContactName(source: string | undefined, contacts: Contact[]): string | undefined {
  if (!source) return undefined;

  const normalized = source.trim().toLowerCase();

  return contacts.find((contact) => {
    const name = contact.name.trim().toLowerCase();
    const email = contact.email?.trim().toLowerCase();
    const phone = contact.phone?.trim().toLowerCase();

    return name === normalized || email === normalized || phone === normalized;
  })?.name;
}

function getMemberDisplayName(member: WorkspaceMember | undefined): string | undefined {
  const displayName = member?.displayName?.trim();
  if (displayName && !looksLikeOpaqueIdentifier(displayName)) {
    return displayName;
  }

  const email = member?.email?.trim();
  if (email) {
    return email.split("@")[0] || email;
  }

  return undefined;
}

function resolveConversationCallName(
  conversationId: string | undefined,
  conversationsById: Map<string, Conversation>,
  membersById: Map<string, WorkspaceMember>,
  currentUser: User | null
): string | undefined {
  if (!conversationId) return undefined;

  const conversation = conversationsById.get(conversationId);
  if (!conversation) return undefined;

  if (conversation.type === "dm") {
    const otherParticipant = conversation.participants?.find((participant) => participant.userId !== currentUser?.id);
    if (otherParticipant) {
      return otherParticipant.displayName?.trim() || otherParticipant.email?.split("@")[0] || "Contact";
    }

    const otherMemberId = conversation.memberIds?.find((memberId) => memberId !== currentUser?.id);
    if (otherMemberId) {
      return getMemberDisplayName(membersById.get(otherMemberId)) ?? "Contact";
    }
  }

  const name = conversation.name?.trim();
  if (name && !looksLikeOpaqueIdentifier(name)) {
    return name;
  }

  return undefined;
}

function resolveCallName(item: CallHistoryItem, contacts: Contact[], currentUser: User | null): string {
  const rawCandidates = [
    item.callerName,
    item.calleeName,
    item.contactName,
    item.participantName,
    item.name,
    item.title,
    item.phoneNumber,
    item.callerId,
  ];

  for (const candidate of rawCandidates) {
    const resolved = resolveContactName(getString(candidate), contacts) ?? getString(candidate);
    if (resolved && resolved !== currentUser?.displayName && resolved !== currentUser?.email) {
      return resolved;
    }
  }

  return "Inconnu";
}

function toCallLogItem(item: CallHistoryItem, contacts: Contact[], currentUser: User | null): CallLogItem {
  const name = resolveCallName(item, contacts, currentUser);
  const direction = getString(item.direction);
  const missed = getBoolean(item.missed) ?? false;
  const isVideo = getBoolean(item.video) ?? false;
  const durationSec = getNumber(item.durationSeconds);
  const startedAt = getString(item.startedAt) ?? getString(item.createdAt);
  const timestamp = parseTimestamp(startedAt) ?? 0;

  let type: CallLogItem["type"] = "Entrant";
  if (direction === "outbound" || direction === "outgoing") type = "Sortant";
  if (missed) type = "Manqué";

  return {
    id: item.id,
    name,
    initials: initialsFromName(name),
    type,
    time: formatCallTime(startedAt),
    duration: formatDuration(durationSec),
    missed,
    video: isVideo,
    timestamp,
  };
}

function inferMeetingCallType(meeting: Meeting, currentUser: User | null): CallLogItem["type"] {
  if (meeting.status === "cancelled" || meeting.status === "expired") {
    return "Manqué";
  }

  if (currentUser?.id && meeting.createdBy === currentUser.id) {
    return "Sortant";
  }

  return "Entrant";
}

function toMeetingCallLogItemWithContext(
  meeting: Meeting,
  contacts: Contact[],
  conversationsById: Map<string, Conversation>,
  membersById: Map<string, WorkspaceMember>,
  currentUser: User | null
): CallLogItem {
  const conversationName = resolveConversationCallName(meeting.conversationId, conversationsById, membersById, currentUser);
  const titleName = getString(meeting.title)?.replace(/^Appel (vidéo|audio)\s*-\s*/i, "");
  const name =
    conversationName ??
    resolveContactName(titleName, contacts) ??
    (titleName && !looksLikeOpaqueIdentifier(titleName) ? titleName : undefined) ??
    "Appel";

  const startedAt = meeting.startedAt ?? meeting.createdAt;
  const startedTimestamp = parseTimestamp(startedAt) ?? 0;
  const endedTimestamp = parseTimestamp(meeting.endedAt);
  const durationSeconds =
    endedTimestamp && endedTimestamp > startedTimestamp
      ? Math.round((endedTimestamp - startedTimestamp) / 1000)
      : undefined;
  const type = inferMeetingCallType(meeting, currentUser);

  return {
    id: meeting.id,
    name,
    initials: initialsFromName(name),
    type,
    time: formatCallTime(startedAt),
    duration: formatDuration(durationSeconds),
    missed: type === "Manqué",
    video: /vid[eé]o/i.test(meeting.title),
    timestamp: startedTimestamp,
  };
}

function shouldFallbackToMeetings(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 501 || error.code === "NOT_IMPLEMENTED");
}

async function loadContactsSafely(workspaceId: string): Promise<Contact[]> {
  try {
    return await listContacts(workspaceId);
  } catch (error) {
    if (shouldFallbackToMeetings(error)) {
      return [];
    }

    throw error;
  }
}

async function loadConversationsSafely(workspaceId: string): Promise<Conversation[]> {
  try {
    return await listConversations(workspaceId);
  } catch (error) {
    if (shouldFallbackToMeetings(error)) {
      return [];
    }

    throw error;
  }
}

async function loadWorkspaceMembersSafely(workspaceId: string): Promise<WorkspaceMember[]> {
  try {
    return await listWorkspaceMembers(workspaceId);
  } catch (error) {
    if (shouldFallbackToMeetings(error)) {
      return [];
    }

    throw error;
  }
}

export default function CallsPage() {
  const { activeWorkspaceId, currentUser } = usePlatform();
  const [calls, setCalls] = React.useState<CallLogItem[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [activeFilter, setActiveFilter] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      setCalls([]);
      setContacts([]);
      setLoading(false);
      return;
    }
    const workspaceId: string = activeWorkspaceId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const contactList = await loadContactsSafely(workspaceId);
        if (cancelled) return;
        setContacts(contactList);

        try {
          const callHistory = await listCallHistory(workspaceId);
          if (cancelled) return;
          setCalls(
            callHistory
              .map((item) => toCallLogItem(item, contactList, currentUser))
              .sort((left, right) => right.timestamp - left.timestamp)
          );
        } catch (historyError) {
          if (!shouldFallbackToMeetings(historyError)) {
            throw historyError;
          }

          const [meetings, conversations, members] = await Promise.all([
            listMeetings(workspaceId),
            loadConversationsSafely(workspaceId),
            loadWorkspaceMembersSafely(workspaceId),
          ]);
          if (cancelled) return;
          const conversationsById = new Map(conversations.map((conversation) => [conversation.id, conversation]));
          const membersById = new Map(members.map((member) => [member.userId, member]));
          setCalls(
            meetings
              .map((meeting) =>
                toMeetingCallLogItemWithContext(
                  meeting,
                  contactList,
                  conversationsById,
                  membersById,
                  currentUser
                )
              )
              .sort((left, right) => right.timestamp - left.timestamp)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError("Impossible de charger l'historique des appels.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId, currentUser]);

  const filteredCalls = React.useMemo(() => {
    if (activeFilter === 0) return calls;
    const filterLabel = filters[activeFilter];
    if (filterLabel === "Manqué(s)") return calls.filter((c) => c.missed);
    if (filterLabel === "Entrant") return calls.filter((c) => c.type === "Entrant");
    if (filterLabel === "Sortant") return calls.filter((c) => c.type === "Sortant");
    return calls;
  }, [calls, activeFilter]);

  return (
    <div className="flex h-full min-h-180 flex-col bg-[#202123]">
      <header className="flex min-h-15.5 shrink-0 items-center justify-between border-b border-white/12 bg-[#202123] px-5">
        <div className="flex h-full items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-sm bg-[#5d5bd4] text-white">
              <Phone className="size-4.5" />
            </span>
            <h1 className="text-lg font-semibold">Appels</h1>
          </div>
          <button
            type="button"
            className="relative flex h-full items-center px-1 text-sm font-semibold"
          >
            Personnel
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7775ff]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-sm">
            Afficher les contacts
            <ContactRound className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-sm"
            aria-label="Gérer les groupes d’appels"
          >
            <UsersRound className="size-4 text-[#8b89ff]" />
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(520px,1fr)_minmax(300px,0.72fr)]">
        <section className="flex min-h-0 flex-col border-r border-white/12">
          <div className="flex min-h-12.5 flex-wrap items-center gap-2 border-b border-white/12 px-5 py-2">
            <button type="button" className="flex items-center gap-2 text-sm font-semibold">
              <ChevronDown className="size-3.5" />
              Historique
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(index)}
                  className={cn(
                    "rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-200 transition-colors hover:bg-white/5",
                    activeFilter === index && "border-[#7775ff] bg-[#7775ff] font-semibold text-white"
                  )}
                >
                  {filter}
                </button>
              ))}
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-sm"
                aria-label="Filtrer les appels"
              >
                <Filter className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-sm"
                aria-label="Plus d’options"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                Chargement de l’historique…
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-rose-200">
                {error}
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Aucun appel pour le moment.
              </div>
            ) : (
            filteredCalls.map((call) => (
              <article
                key={call.id}
                className="group flex items-center gap-3 border-b border-white/7 px-5 py-3 transition-colors hover:bg-white/2.5"
              >
                <PresenceAvatar
                  initials={call.initials}
                  status={call.missed ? "offline" : "online"}
                  className="size-9"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{call.name}</p>
                  <p
                    className={cn(
                      "mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500",
                      call.missed && "text-rose-400"
                    )}
                  >
                    {call.type === "Sortant" ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownLeft className="size-3" />
                    )}
                    {call.type} · {call.time} · {call.duration}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-sm opacity-70 group-hover:opacity-100"
                  aria-label={`Appeler ${call.name}`}
                >
                  {call.video ? <Video className="size-4" /> : <Phone className="size-4" />}
                </Button>
              </article>
            ))
            )}
          </div>
        </section>

        <aside className="hidden min-h-0 flex-col xl:flex">
          <div className="flex h-12.5 shrink-0 items-center justify-between border-b border-white/12 px-5">
            <h2 className="text-base font-semibold">Numérotation rapide</h2>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-sm"
              aria-label="Ajouter un contact rapide"
            >
              <UserPlus className="size-4" />
            </Button>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-zinc-500">Chargement des contacts…</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun contact rapide.</p>
            ) : (
              contacts.slice(0, 5).map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  className="mt-3 flex w-full items-center gap-3 rounded-sm p-1 text-left transition-colors hover:bg-white/5 first:mt-0"
                >
                  <PresenceAvatar
                    initials={initialsFromName(contact.name)}
                    status="online"
                    className="size-9"
                  />
                  <span className="truncate text-sm font-medium">{contact.name}</span>
                  <Phone className="ml-auto size-3.5 shrink-0 text-zinc-500" />
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
