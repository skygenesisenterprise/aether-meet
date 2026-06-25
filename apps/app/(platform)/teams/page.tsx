"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Hash,
  Lock,
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
import { cn } from "@/lib/utils";
import { conversations, currentUser, people, teams, type Team } from "@/lib/platform-data";

type TeamFilter = "all" | "active" | "compact";

const teamMemberIds: Record<string, string[]> = {
  product: ["liam", "elena", "marcus", "sarah"],
  engineering: ["liam", "marcus", "noah"],
  operations: ["sarah", "noah", "marcus"],
};

const teamActivities: Record<string, Array<{ channel: string; text: string; time: string }>> = {
  product: [
    {
      channel: "Design",
      text: "Elena a partagé la version finale du shell de navigation.",
      time: "Il y a 12 min",
    },
    {
      channel: "Recherche",
      text: "Nouvelle synthèse des retours utilisateurs du sprint.",
      time: "Il y a 44 min",
    },
  ],
  engineering: [
    {
      channel: "Web",
      text: "Marcus a ouvert la revue des contrats API côté client.",
      time: "Il y a 34 min",
    },
    {
      channel: "Infrastructure",
      text: "Capacité prévisionnelle mise à jour pour juillet.",
      time: "Il y a 1 h",
    },
  ],
  operations: [
    {
      channel: "Incidents",
      text: "Le déploiement de préproduction est terminé sans alerte bloquante.",
      time: "Il y a 1 h",
    },
    {
      channel: "Sécurité",
      text: "Noah a partagé les nouvelles exigences de conformité.",
      time: "Aujourd’hui",
    },
  ],
};

function getChannelBadge(teamId: string, channel: string) {
  if (teamId === "product" && channel === "Général") return 3;
  if (teamId === "engineering" && channel === "Web") return 2;
  if (teamId === "operations" && channel === "Incidents") return 1;
  return 0;
}

export default function TeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customTeams, setCustomTeams] = React.useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = React.useState(teams[0]?.id ?? "");
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<TeamFilter>("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState("");
  const [draftDescription, setDraftDescription] = React.useState("");
  const requestedView = searchParams.get("view") ?? "all";
  const requestedTeamId = searchParams.get("team");
  const requestedChannel = searchParams.get("channel");

  const allTeams = React.useMemo(() => [...customTeams, ...teams], [customTeams]);

  const visibleTeams = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allTeams.filter((team) => {
      if (requestedView === "favorites" && !["product", "engineering"].includes(team.id)) return false;
      if (filter === "active" && team.members < 10) return false;
      if (filter === "compact" && team.members >= 10) return false;
      if (!normalizedQuery) return true;

      return [team.name, team.description, ...team.channels]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [allTeams, filter, query, requestedView]);

  React.useEffect(() => {
    if (!requestedTeamId) return;
    setSelectedTeamId(requestedTeamId);
  }, [requestedTeamId]);

  React.useEffect(() => {
    if (visibleTeams.some((team) => team.id === selectedTeamId)) return;
    setSelectedTeamId(visibleTeams[0]?.id ?? "");
  }, [selectedTeamId, visibleTeams]);

  const selectedTeam =
    visibleTeams.find((team) => team.id === selectedTeamId) ?? visibleTeams[0] ?? null;

  const selectedTeamMembers = React.useMemo(() => {
    if (!selectedTeam) return selectedTeam;
    const ids = teamMemberIds[selectedTeam.id] ?? [];
    const members = ids
      .map((memberId) => people.find((person) => person.id === memberId))
      .filter((member): member is (typeof people)[number] => Boolean(member));

    if (members.length > 0) return members;
    if (selectedTeam.id.startsWith("custom-")) return [currentUser];
    return [];
  }, [selectedTeam]);

  const selectedTeamActivity = selectedTeam ? teamActivities[selectedTeam.id] ?? [] : [];
  const selectedChannel = selectedTeam?.channels.find((channel) => channel === requestedChannel) ?? null;
  const linkedConversation = selectedTeam
    ? conversations.find((conversation) => conversation.id === selectedTeam.id)
    : null;

  function handleCreateTeam() {
    if (!draftName.trim()) return;

    const nextTeam: Team = {
      id: `custom-${Date.now()}`,
      name: draftName.trim(),
      description: draftDescription.trim() || "Nouvel espace de coordination créé depuis Teams.",
      members: 1,
      channels: ["Général"],
      color: "from-fuchsia-500 to-rose-500",
    };

    setCustomTeams((current) => [nextTeam, ...current]);
    setSelectedTeamId(nextTeam.id);
    setDraftName("");
    setDraftDescription("");
    setCreateOpen(false);
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
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Toutes
              </Button>
              <Button
                variant={filter === "active" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                Actives
              </Button>
              <Button
                variant={filter === "compact" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("compact")}
              >
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
                  {selectedChannel ? `${selectedTeam?.name} / ${selectedChannel}` : selectedTeam?.name ?? "Aucune équipe"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedChannel
                    ? "Canal actif sélectionné depuis la navigation latérale."
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
                  {linkedConversation?.subtitle ?? "Aucune conversation liée"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {linkedConversation?.preview ??
                    (selectedTeam?.id.startsWith("custom-")
                      ? `${currentUser.name} a créé cette équipe.`
                      : "Aucune activité de conversation disponible")}
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
                  <div className="space-y-2">
                    {visibleTeams.map((team) => {
                      const isSelected = selectedTeam?.id === team.id;

                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setSelectedTeamId(team.id)}
                          className={cn(
                            "w-full rounded-xl border p-3 text-left transition-colors",
                            isSelected
                              ? "border-violet-400/45 bg-violet-500/10"
                              : "border-white/10 bg-white/3 hover:bg-white/4"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br font-semibold text-white",
                                team.color
                              )}
                            >
                              {team.name.slice(0, 1)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-zinc-100">{team.name}</p>
                                <span className="text-[10px] text-zinc-500">{team.channels.length} canaux</span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                                {team.description}
                              </p>
                              <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                                <span>{team.members} membres</span>
                                <span>
                                  {teamMemberIds[team.id]?.length ?? (team.id.startsWith("custom-") ? 1 : 0)} visibles
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {visibleTeams.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                        <p className="text-sm font-medium text-zinc-200">Aucune équipe trouvée</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Ajuste la recherche ou change le filtre actif.
                        </p>
                      </div>
                    ) : null}
                  </div>
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
                              selectedTeam.color
                            )}
                          >
                            {selectedTeam.name.slice(0, 1)}
                          </span>
                          <div className="min-w-0">
                            <h2 className="truncate text-xl font-semibold text-zinc-100">
                              {selectedTeam.name}
                            </h2>
                          <p className="mt-1 text-sm text-zinc-400">{selectedTeam.description}</p>
                        </div>
                      </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md"
                          onClick={() => linkedConversation && router.push("/chat")}
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
                          <p className="mt-1 text-sm text-zinc-400">
                            Passe rapidement d’un canal de travail à l’autre.
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-md">
                          <Plus className="size-4" />
                          Nouveau canal
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {selectedTeam.channels.map((channel, index) => {
                          const isLocked =
                            selectedTeam.id === "operations" &&
                            index === selectedTeam.channels.length - 1;
                          const unread = getChannelBadge(selectedTeam.id, channel);

                          return (
                            <button
                              key={channel}
                              type="button"
                              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#292a2c] px-4 py-3 text-left transition-colors hover:bg-white/3"
                              onClick={() =>
                                router.push(`/teams?team=${selectedTeam.id}&channel=${encodeURIComponent(channel)}`)
                              }
                            >
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
                                {isLocked ? <Lock className="size-4" /> : <Hash className="size-4" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "truncate text-sm font-medium text-zinc-100",
                                      selectedChannel === channel && "text-violet-100"
                                    )}
                                  >
                                    {channel}
                                  </span>
                                  {unread > 0 ? (
                                    <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-100">
                                      {unread}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="mt-1 block truncate text-xs text-zinc-500">
                                  {isLocked
                                    ? "Canal réservé aux opérations sensibles"
                                    : "Canal opérationnel pour cette équipe"}
                                </span>
                              </span>
                              <ArrowRight className="size-4 text-zinc-500" />
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="mt-6">
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-zinc-100">Activité récente</h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          Derniers mouvements visibles dans les canaux de l’équipe.
                        </p>
                      </div>

                      <div className="space-y-2">
                        {selectedTeamActivity.length > 0 ? (
                          selectedTeamActivity.map((activity) => (
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
                              Les nouvelles équipes afficheront leur activité ici dès qu’un canal sera utilisé.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                    <p className="text-sm font-medium text-zinc-200">Aucune équipe sélectionnée</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Choisis une équipe dans la liste pour afficher son contexte.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col overflow-hidden bg-[#252628]">
            <div className="shrink-0 border-b border-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sélection</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">
                {selectedTeam?.name ?? "Aucune équipe"}
              </h2>
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
                        <PresenceAvatar initials={member.initials} status={member.status} className="size-10" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-zinc-100">{member.name}</p>
                          <p className="truncate text-xs text-zinc-400">{member.role}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-md"
                          onClick={() => router.push("/chat")}
                        >
                          <MessageSquareText className="size-4" />
                          <span className="sr-only">Écrire à {member.name}</span>
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                    <p className="text-sm font-medium text-zinc-200">Aucun membre visible</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Ajoute des personnes ou sélectionne une équipe existante pour afficher ce panneau.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                  <p className="text-sm font-medium text-zinc-200">Résumé</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Cette page garde la liste des équipes à gauche et le contexte de l’équipe active à droite, comme un espace de travail continu.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-md"
                      onClick={() => linkedConversation && router.push("/chat")}
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
            <Button onClick={handleCreateTeam} disabled={!draftName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
