import {
  ArrowRight,
  Hash,
  Lock,
  MessageSquareText,
  Plus,
  Settings2,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { WorkspaceHeader } from "@/components/platform/workspace-header";
import { people, teams } from "@/lib/platform-data";

export default function TeamsPage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <WorkspaceHeader
        title="Équipes"
        description="Organisez les personnes, canaux et ressources de votre organisation."
        icon={UsersRound}
        actions={
          <Button size="sm" className="rounded-md">
            <Plus className="size-4" />
            Créer une équipe
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Vos équipes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                3 espaces actifs · 39 collaborateurs
              </p>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Gérer les équipes
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="group overflow-hidden rounded-md border-white/12 bg-[#292a2c] gap-0 py-0 shadow-none transition-colors hover:border-primary/30"
              >
                <div className={`h-1.5 bg-linear-to-r ${team.color}`} />
                <CardHeader className="border-b py-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex size-11 items-center justify-center rounded-md bg-linear-to-br ${team.color} font-semibold text-white shadow-lg`}
                    >
                      {team.name.slice(0, 1)}
                    </span>
                    <Button variant="ghost" size="icon-sm" className="rounded-md">
                      <Settings2 className="size-4" />
                      <span className="sr-only">Paramètres de l’équipe {team.name}</span>
                    </Button>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">
                      {team.description}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <UsersRound className="size-3.5" />
                      {team.members} membres
                    </span>
                    <span>{team.channels.length} canaux</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    {team.channels.slice(0, 3).map((channel, index) => (
                      <button
                        key={channel}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        {index === 2 && team.id === "operations" ? (
                          <Lock className="size-3.5" />
                        ) : (
                          <Hash className="size-3.5" />
                        )}
                        <span className="flex-1">{channel}</span>
                        {index === 0 ? (
                          <Badge variant="secondary" className="rounded-full text-[9px]">
                            2
                          </Badge>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 w-full rounded-md">
                    Ouvrir l’équipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between border-b py-4">
              <CardTitle className="text-base">Activité des canaux</CardTitle>
              <Button variant="ghost" size="sm">
                Tout voir
              </Button>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {[
                {
                  team: "Produit",
                  channel: "Design",
                  text: "Elena a partagé la version finale du shell.",
                  time: "Il y a 12 min",
                },
                {
                  team: "Ingénierie",
                  channel: "Web",
                  text: "Marcus a ouvert la revue des contrats API.",
                  time: "Il y a 34 min",
                },
                {
                  team: "Opérations",
                  channel: "Incidents",
                  text: "Le déploiement de préproduction est terminé.",
                  time: "Il y a 1 h",
                },
              ].map((activity) => (
                <div key={`${activity.team}-${activity.channel}`} className="flex gap-3 px-5 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <MessageSquareText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {activity.team}{" "}
                      <span className="text-muted-foreground">/ {activity.channel}</span>
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{activity.text}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Membres récents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              {people.map((person) => (
                <div key={person.id} className="flex items-center gap-3">
                  <PresenceAvatar initials={person.initials} status={person.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{person.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{person.role}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="rounded-md">
                    <MessageSquareText className="size-4" />
                    <span className="sr-only">Écrire à {person.name}</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
