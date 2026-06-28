"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Hash,
  MessageSquareText,
  Plus,
  Search,
  Settings2,
  UsersRound,
} from "lucide-react";

import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createChannel, listChannels } from "@/lib/api/channels";
import { listConversations } from "@/lib/api/conversations";
import { listMessages } from "@/lib/api/messages";
import { listWorkspaceMembers } from "@/lib/api/members";
import { createTeam, listTeams } from "@/lib/api/teams";
import type { Channel, Conversation, Team, WorkspaceMember } from "@/lib/api/types";
import { usePlatform } from "@/context/PlatformContext";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

type TeamFilter = "all" | "active" | "compact";

interface TeamActivity {
  channel: string;
  text: string;
  time: string;
}

const TEAM_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

function getTeamGradient(teamId: string): string {
  const index = Math.abs(
    Array.from(teamId).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % TEAM_GRADIENTS.length;
  return TEAM_GRADIENTS[index];
}

function getInitials(value: string): string {
  return value
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeWorkspaceId, currentUser } = usePlatform();
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = React.useState<WorkspaceMember[]>([]);
  const [selectedTeamId, setSelectedTeamId] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<TeamFilter>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftDescription, setDraftDescription] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [recentActivity, setRecentActivity] = React.useState<TeamActivity[]>([]);
  const requestedView = searchParams.get("view") ?? "all";
  const requestedTeamId = searchParams.get("team");
  const requestedChannel = searchParams.get("channel");

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      setTeams([]);
      setChannels([]);
      setConversations([]);
      setWorkspaceMembers([]);
      setLoading(false);
      return;
    }

    const workspaceId = activeWorkspaceId;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [teamItems, channelItems, conversationItems, memberItems] = await Promise.all([
          listTeams(workspaceId),
          listChannels(workspaceId),
          listConversations(workspaceId),
          listWorkspaceMembers(workspaceId).catch(() => []),
        ]);
        if (cancelled) {
          return;
        }
        setTeams(teamItems);
        setChannels(channelItems);
        setConversations(conversationItems);
        setWorkspaceMembers(memberItems);
        setSelectedTeamId((current) => current || teamItems[0]?.id || "");
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les équipes du workspace.");
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

  const visibleTeams = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teams.filter((team) => {
      const teamChannels = channels.filter((channel) => channel.teamId === team.id);
      if (requestedView === "favorites" && !team.name.toLowerCase().includes("prod")) return false;
      if (filter === "active" && teamChannels.length < 2) return false;
      if (filter === "compact" && teamChannels.length >= 2) return false;
      if (!normalizedQuery) return true;

      return [team.name, team.description ?? "", ...teamChannels.map((channel) => channel.name)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [channels, filter, query, requestedView, teams]);

  React.useEffect(() => {
    if (!requestedTeamId) return;
    setSelectedTeamId(requestedTeamId);
  }, [requestedTeamId]);

  React.useEffect(() => {
    if (visibleTeams.some((team) => team.id === selectedTeamId)) return;
    setSelectedTeamId(visibleTeams[0]?.id ?? "");
  }, [selectedTeamId, visibleTeams]);

  const selectedTeam = visibleTeams.find((team) => team.id === selectedTeamId) ?? visibleTeams[0] ?? null;
  const selectedTeamChannels = React.useMemo(
    () => channels.filter((channel) => channel.teamId === selectedTeam?.id),
    [channels, selectedTeam]
  );
  const selectedChannel = selectedTeamChannels.find((channel) => channel.name === requestedChannel) ?? null;

  const linkedConversation = React.useMemo(() => {
    if (!selectedTeamChannels.length) return null;
    const channelIds = new Set(selectedTeamChannels.map((channel) => channel.id));
    return conversations.find((conversation) => conversation.channelId && channelIds.has(conversation.channelId)) ?? null;
  }, [conversations, selectedTeamChannels]);

  const selectedTeamMembers = React.useMemo(() => {
    if (!selectedTeam) {
      return [];
    }

    const creator = workspaceMembers.find((member) => member.userId === selectedTeam.createdBy);

    const orderedMembers = creator
      ? [creator, ...workspaceMembers.filter((member) => member.userId !== creator.userId)]
      : workspaceMembers;

    if (currentUser?.id) {
      orderedMembers.sort((left, right) => {
        if (left.userId === currentUser.id) return -1;
        if (right.userId === currentUser.id) return 1;
        return 0;
      });
    }

    return orderedMembers.slice(0, 6);
  }, [currentUser?.id, selectedTeam, workspaceMembers]);

  React.useEffect(() => {
    if (!selectedTeamChannels.length) {
      setRecentActivity([]);
      return;
    }

    let cancelled = false;

    async function loadActivity() {
      const teamConversations = selectedTeamChannels
        .map((channel) => ({
          channel,
          conversation: conversations.find((conversation) => conversation.channelId === channel.id),
        }))
        .filter((item): item is { channel: Channel; conversation: Conversation } => Boolean(item.conversation));

      try {
        const entries = await Promise.all(
          teamConversations.map(async ({ channel, conversation }) => {
            const response = await listMessages(conversation.id, { limit: 1 });
            const message = response.data[0];
            if (!message) {
              return null;
            }
            return {
              channel: channel.name,
              text: message.content,
              time: formatMessageTime(message.createdAt),
            } satisfies TeamActivity;
          })
        );

        if (!cancelled) {
          setRecentActivity(entries.filter((item): item is TeamActivity => Boolean(item)));
        }
      } catch {
        if (!cancelled) {
          setRecentActivity([]);
        }
      }
    }

    void loadActivity();
    return () => {
      cancelled = true;
    };
  }, [conversations, selectedTeamChannels]);

  async function handleCreateTeam() {
    const workspaceId = activeWorkspaceId;

    if (!workspaceId || !draftName.trim()) return;

    try {
      const created = await createTeam(workspaceId, {
        name: draftName.trim(),
        description: draftDescription.trim() || undefined,
      });
      const generalChannel = await createChannel(workspaceId, {
        teamId: created.id,
        name: "General",
        description: "Canal initial de l’équipe",
        type: "channel",
        visibility: "team",
      }).catch(() => null);

      setTeams((current) => [created, ...current]);
      if (generalChannel) {
        setChannels((current) => [generalChannel, ...current]);
      }
      setSelectedTeamId(created.id);
      setDraftName("");
      setDraftDescription("");
      setCreateOpen(false);
    } catch {
      setError("Création d’équipe impossible.");
    }
  }

  function openConversation() {
    if (linkedConversation) {
      setActiveConversation(linkedConversation.id);
    }
    router.push("/chat");
  }

  return (
    <>
      <div className="flex h-full min-h-180 flex-col overflow-hidden bg-[#232426]">
        <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" className="rounded-md">
              <UsersRound className="size-4" />
              <span className="sr-only">Afficher le panneau équipes</span>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-md font-semibold">
              Équipes
            </Button>
            <ButtonGroup>
              <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>
                Toutes
              </Button>
              <Button variant={filter === "active" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("active")}>
                Actives
              </Button>
              <Button variant={filter === "compact" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("compact")}>
                Compactes
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative min-w-0 flex-1 md:w-80 md:flex-none">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-9 border-white/12 bg-[#202123] pl-9 text-sm"
                placeholder="Filtrer une équipe ou un canal"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-md" onClick={() => setQuery("")}>
              <Filter className="size-4" />
              Réinitialiser
            </Button>
            <Button size="sm" className="rounded-md" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Créer
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-h-0 flex-col border-r border-white/10">
            <div className="grid gap-3 border-b border-white/10 px-4 py-4 md:grid-cols-3">
              <article className="rounded-xl border border-white/10 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sélection</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">
                  {selectedChannel ? `${selectedTeam?.name} / ${selectedChannel.name}` : selectedTeam?.name ?? "Aucune équipe"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedChannel
                    ? selectedChannel.description || "Canal actif sélectionné depuis la navigation latérale."
                    : selectedTeam?.description ?? "Aucun contexte disponible"}
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Équipes visibles</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-100">{visibleTeams.length}</p>
                <p className="mt-1 text-sm text-zinc-400">après filtres et recherche</p>
              </article>
              <article className="rounded-xl border border-white/10 bg-white/3 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Conversation liée</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">
                  {linkedConversation?.name ?? "Aucune conversation liée"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {linkedConversation
                    ? `Canal ${selectedTeamChannels.find((channel) => channel.id === linkedConversation.channelId)?.name ?? "lié"}`
                    : "Aucune activité de conversation disponible"}
                </p>
              </article>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[20rem_minmax(0,1fr)]">
              <aside className="min-h-0 overflow-auto border-b border-r border-white/10 bg-[#252628] lg:border-b-0">
                <div className="border-b border-white/10 px-4 py-4">
                  <h2 className="text-base font-semibold text-zinc-100">Vos équipes</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Sélectionne une équipe pour afficher ses canaux et son activité.
                  </p>
                </div>

                <div className="p-3">
                  {loading ? (
                    <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm text-zinc-400">
                      Chargement des équipes…
                    </div>
                  ) : error ? (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleTeams.map((team) => {
                        const isSelected = selectedTeam?.id === team.id;
                        const teamChannels = channels.filter((channel) => channel.teamId === team.id);

                        return (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => setSelectedTeamId(team.id)}
                            className={cn(
                              "w-full rounded-xl border p-3 text-left transition-colors",
                              isSelected ? "border-violet-400/45 bg-violet-500/10" : "border-white/10 bg-white/3 hover:bg-white/4"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br font-semibold text-white",
                                  getTeamGradient(team.id)
                                )}
                              >
                                {team.name.slice(0, 1)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate text-sm font-semibold text-zinc-100">{team.name}</p>
                                  <span className="text-[10px] text-zinc-500">{teamChannels.length} canaux</span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                                  {team.description || "Équipe sans description"}
                                </p>
                                <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                                  <span>créée</span>
                                  <span>{new Date(team.createdAt).toLocaleDateString("fr-FR")}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {visibleTeams.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                          <p className="text-sm font-medium text-zinc-200">Aucune équipe trouvée</p>
                          <p className="mt-1 text-sm text-zinc-400">Ajuste la recherche ou change le filtre actif.</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </aside>

              <div className="min-h-0 overflow-auto px-4 py-4">
                {selectedTeam ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-lg font-semibold text-white",
                              getTeamGradient(selectedTeam.id)
                            )}
                          >
                            {selectedTeam.name.slice(0, 1)}
                          </span>
                          <div className="min-w-0">
                            <h2 className="truncate text-xl font-semibold text-zinc-100">{selectedTeam.name}</h2>
                            <p className="mt-1 text-sm text-zinc-400">{selectedTeam.description || "Aucune description"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          onClick={openConversation}
                        >
                          <MessageSquareText className="size-4" />
                          Ouvrir la conversation
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-md">
                          <Settings2 className="size-4" />
                          Paramètres
                        </Button>
                      </div>
                    </div>

                    <section>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-zinc-100">Canaux actifs</h3>
                          <p className="mt-1 text-sm text-zinc-400">Passe rapidement d’un canal de travail à l’autre.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedTeamChannels.length > 0 ? (
                          selectedTeamChannels.map((channel) => {
                            const channelConversation = conversations.find((conversation) => conversation.channelId === channel.id);

                            return (
                              <button
                                key={channel.id}
                                type="button"
                                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#292a2c] px-4 py-3 text-left transition-colors hover:bg-white/3"
                                onClick={() => router.push(`/teams?team=${selectedTeam.id}&channel=${encodeURIComponent(channel.name)}`)}
                              >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
                                  <Hash className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2">
                                    <span className={cn("truncate text-sm font-medium text-zinc-100", selectedChannel?.id === channel.id && "text-violet-100")}>
                                      {channel.name}
                                    </span>
                                  </span>
                                  <span className="mt-1 block truncate text-xs text-zinc-500">
                                    {channel.description || (channelConversation ? "Canal relié à une conversation active" : "Canal opérationnel pour cette équipe")}
                                  </span>
                                </span>
                                <ArrowRight className="size-4 text-zinc-500" />
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4 text-sm text-zinc-400">
                            Aucun canal rattaché à cette équipe.
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="mt-6">
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-zinc-100">Activité récente</h3>
                        <p className="mt-1 text-sm text-zinc-400">Derniers mouvements visibles dans les canaux de l’équipe.</p>
                      </div>

                      <div className="space-y-2">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((activity) => (
                            <article
                              key={`${selectedTeam.id}-${activity.channel}-${activity.time}`}
                              className="rounded-xl border border-white/10 bg-[#292a2c] p-4"
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/12 text-violet-200">
                                  <MessageSquareText className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-zinc-100">
                                      {selectedTeam.name} <span className="text-zinc-500">/ {activity.channel}</span>
                                    </p>
                                    <span className="text-[10px] text-zinc-500">{activity.time}</span>
                                  </div>
                                  <p className="mt-1 text-sm leading-6 text-zinc-300">{activity.text}</p>
                                </div>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                            <p className="text-sm font-medium text-zinc-200">Aucune activité récente</p>
                            <p className="mt-1 text-sm text-zinc-400">
                              Les équipes afficheront leur activité ici dès qu’un message sera posté dans un canal.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                    <p className="text-sm font-medium text-zinc-200">Aucune équipe sélectionnée</p>
                    <p className="mt-1 text-sm text-zinc-400">Choisis une équipe dans la liste pour afficher son contexte.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col overflow-hidden bg-[#252628]">
            <div className="shrink-0 border-b border-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sélection</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">{selectedTeam?.name ?? "Aucune équipe"}</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {selectedTeamMembers.length > 0
                  ? `${selectedTeamMembers.length} membre${selectedTeamMembers.length > 1 ? "s" : ""} visible${selectedTeamMembers.length > 1 ? "s" : ""}`
                  : "Aucun membre visible"}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <div className="space-y-3">
                {selectedTeamMembers.length > 0 ? (
                  selectedTeamMembers.map((member) => (
                    <article key={member.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
                      <div className="flex items-center gap-3">
                        <PresenceAvatar
                          initials={getInitials(member.displayName ?? member.email ?? member.userId)}
                          status={(member.presenceStatus as "online" | "busy" | "away" | "offline" | undefined) ?? "offline"}
                          className="size-10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-zinc-100">{member.displayName ?? member.email ?? member.userId}</p>
                          <p className="truncate text-xs text-zinc-400">{member.role}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-md"
                          onClick={openConversation}
                        >
                          <MessageSquareText className="size-4" />
                          <span className="sr-only">Écrire</span>
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                    <p className="text-sm font-medium text-zinc-200">Aucun membre visible</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Sélectionne une équipe existante pour afficher ce panneau.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                  <p className="text-sm font-medium text-zinc-200">Résumé</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Cette page conserve la liste des équipes à gauche et le contexte de l’équipe active à droite avec des données issues du workspace réel.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-md"
                      onClick={openConversation}
                    >
                      <MessageSquareText className="size-4" />
                      Conversation
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-md">
                      <ChevronDown className="size-4" />
                      Plus
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-white/12 bg-[#27282b] text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer une équipe</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Prépare rapidement un nouvel espace de coordination.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="team-name" className="text-sm font-medium text-zinc-200">
                Nom
              </label>
              <Input
                id="team-name"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Ex. Support enterprise"
                className="border-white/10 bg-black/15"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="team-description" className="text-sm font-medium text-zinc-200">
                Description
              </label>
              <Input
                id="team-description"
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder="Mission, périmètre ou contexte"
                className="border-white/10 bg-black/15"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => void handleCreateTeam()} disabled={!draftName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
