import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircleMore,
  Phone,
  Plus,
  Sparkles,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { WorkspaceHeader } from "@/components/platform/workspace-header";
import { conversations, meetings, people } from "@/lib/platform-data";

export default function HomePlatformPage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <WorkspaceHeader
        title="Bonjour, Liam"
        description="Voici l’essentiel de votre journée sur Aether Meet."
        icon={Sparkles}
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden rounded-md sm:inline-flex">
              <Plus className="size-4" />
              Planifier
            </Button>
            <Button size="sm" className="rounded-md">
              <Video className="size-4" />
              Réunion instantanée
            </Button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-5">
          <Card className="overflow-hidden rounded-md border-primary/15 bg-linear-to-br from-primary/12 via-[#292a2c] to-[#292a2c] py-0 shadow-none">
            <CardContent className="grid min-h-52 gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <Badge className="rounded-full bg-emerald-500/15 text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Prochaine réunion
                </Badge>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                  Revue du nouveau client
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Validation du shell, des conversations et des nouveaux parcours de réunion.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock3 className="size-4" />
                    15:00 – 16:00
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    Aujourd’hui
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-stretch gap-2 sm:flex-row md:flex-col">
                <Button className="rounded-md px-6">
                  <Video className="size-4" />
                  Rejoindre
                </Button>
                <Button variant="outline" className="rounded-md">
                  Voir les détails
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Messages non lus",
                value: "4",
                icon: MessageCircleMore,
                href: "/chat",
                tone: "text-violet-400 bg-violet-500/12",
              },
              {
                label: "Réunions aujourd’hui",
                value: "2",
                icon: CalendarDays,
                href: "/calendar",
                tone: "text-cyan-400 bg-cyan-500/12",
              },
              {
                label: "Appels manqués",
                value: "2",
                icon: Phone,
                href: "/calls",
                tone: "text-rose-400 bg-rose-500/12",
              },
            ].map((stat) => (
              <Link key={stat.label} href={stat.href}>
                <Card className="h-full gap-3 rounded-md border-white/12 bg-[#292a2c] py-4 shadow-none transition-colors hover:border-primary/30 hover:bg-muted/25">
                  <CardContent className="flex items-center gap-3 px-4">
                    <span
                      className={`flex size-10 items-center justify-center rounded-md ${stat.tone}`}
                    >
                      <stat.icon className="size-5" />
                    </span>
                    <span>
                      <strong className="block text-xl font-semibold">{stat.value}</strong>
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between border-b py-4">
              <CardTitle className="text-base">Agenda</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/calendar">
                  Tout afficher
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {meetings.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 shrink-0 text-center">
                    <span className="block font-mono text-sm font-semibold">{meeting.start}</span>
                    <span className="text-[10px] text-muted-foreground">{meeting.end}</span>
                  </div>
                  <span className="h-10 w-0.5 rounded-full bg-primary/70" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{meeting.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{meeting.location}</p>
                  </div>
                  <div className="hidden -space-x-2 sm:flex">
                    {meeting.participants.slice(0, 3).map((initials) => (
                      <PresenceAvatar
                        key={initials}
                        initials={initials}
                        status="online"
                        className="size-7"
                        fallbackClassName="text-[9px]"
                      />
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-md">
                    Rejoindre
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Disponibilité de l’équipe</CardTitle>
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
                    <MessageCircleMore className="size-4" />
                    <span className="sr-only">Écrire à {person.name}</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">À traiter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {conversations.slice(0, 3).map((conversation) => (
                <Link
                  key={conversation.id}
                  href="/chat"
                  className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{conversation.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {conversation.preview}
                    </span>
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
