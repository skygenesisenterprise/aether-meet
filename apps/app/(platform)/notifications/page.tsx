import {
  Bell,
  CalendarDays,
  CheckCheck,
  FileText,
  MessageCircleMore,
  Settings2,
  ShieldCheck,
  UsersRound,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { WorkspaceHeader } from "@/components/platform/workspace-header";
import { notifications, type PlatformNotification } from "@/lib/platform-notifications";

const categoryIcons: Record<PlatformNotification["category"], typeof Bell> = {
  message: MessageCircleMore,
  meeting: Video,
  team: UsersRound,
  file: FileText,
  system: ShieldCheck,
};

const categoryColors: Record<PlatformNotification["category"], string> = {
  message: "bg-violet-500/12 text-violet-400",
  meeting: "bg-cyan-500/12 text-cyan-400",
  team: "bg-emerald-500/12 text-emerald-400",
  file: "bg-amber-500/12 text-amber-400",
  system: "bg-zinc-500/12 text-zinc-400",
};

export default function NotificationsPage() {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <WorkspaceHeader
        title="Notifications"
        description={`${unreadCount} activités nécessitent votre attention.`}
        icon={Bell}
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden rounded-md sm:inline-flex">
              <Settings2 className="size-4" />
              Préférences
            </Button>
            <Button size="sm" className="rounded-md">
              <CheckCheck className="size-4" />
              Tout marquer comme lu
            </Button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 lg:grid-cols-[1fr_320px]">
        <section>
          <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between border-b py-4">
              <div>
                <CardTitle className="text-base">Activité récente</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Messages, réunions, équipes et sécurité
                </p>
              </div>
              <div className="flex rounded-md border border-white/12 p-0.5 text-xs">
                <button className="rounded-md bg-muted px-3 py-1.5 font-medium">Toutes</button>
                <button className="px-3 py-1.5 text-muted-foreground">Non lues</button>
              </div>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {notifications.map((notification) => {
                const Icon = categoryIcons[notification.category];

                return (
                  <article
                    key={notification.id}
                    className={`relative flex gap-3 px-4 py-4 transition-colors hover:bg-muted/25 sm:px-5 ${
                      notification.read ? "" : "bg-primary/5"
                    }`}
                  >
                    {!notification.read ? (
                      <span className="absolute left-0 top-0 h-full w-0.5 bg-primary" />
                    ) : null}
                    {notification.initials ? (
                      <PresenceAvatar
                        initials={notification.initials}
                        status="online"
                        className="size-10"
                      />
                    ) : (
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
                          categoryColors[notification.category]
                        }`}
                      >
                        <Icon className="size-5" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold">{notification.title}</h2>
                        {!notification.read ? (
                          <Badge variant="secondary" className="rounded-full text-[9px]">
                            Nouveau
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {notification.description}
                      </p>
                      <time className="mt-2 block font-mono text-[10px] text-muted-foreground">
                        {notification.time}
                      </time>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden self-center rounded-md sm:inline-flex"
                    >
                      Ouvrir
                    </Button>
                  </article>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              {[
                {
                  label: "Messages",
                  value: 1,
                  icon: MessageCircleMore,
                  color: "text-violet-400",
                },
                {
                  label: "Réunions et appels",
                  value: 2,
                  icon: CalendarDays,
                  color: "text-cyan-400",
                },
                {
                  label: "Équipes et fichiers",
                  value: 2,
                  icon: UsersRound,
                  color: "text-emerald-400",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className={`size-4 ${item.color}`} />
                  <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-mono text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-md border-primary/20 bg-linear-to-br from-primary/12 to-[#292a2c] shadow-none">
            <CardContent className="px-5">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold">Notifications sécurisées</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Les alertes sensibles restent limitées aux membres et appareils autorisés de votre
                organisation.
              </p>
              <Button variant="outline" size="sm" className="mt-4 rounded-md">
                Gérer les préférences
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
