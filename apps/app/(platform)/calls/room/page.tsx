"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCheck,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  MessageSquareText,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { cn } from "@/lib/utils";
import { conversations, currentUser, people, type Person } from "@/lib/platform-data";

function formatDuration(startedAt: Date) {
  const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function CallRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId") ?? "product";
  const mode = searchParams.get("mode") === "audio" ? "audio" : "video";
  const conversation = conversations.find((item) => item.id === conversationId) ?? conversations[0];
  const members = conversation.memberIds
    .map((memberId) => people.find((person) => person.id === memberId))
    .filter((member): member is Person => Boolean(member));
  const [startedAt] = React.useState(() => new Date());
  const [, setTick] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [cameraEnabled, setCameraEnabled] = React.useState(mode === "video");
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);
  const duration = formatDuration(startedAt);
  const leadMembers = members.slice(0, 4);

  return (
    <div className="flex h-full min-h-full flex-col overflow-hidden bg-[#18191c] text-zinc-100">
      <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-white/8 bg-[#1d1f23] px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon-sm" className="rounded-md" asChild>
            <Link href="/chat">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Retour au chat</span>
            </Link>
          </Button>
          <PresenceAvatar initials={conversation.initials} status={conversation.status} className="size-9" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{conversation.name}</p>
            <p className="truncate text-xs text-zinc-400">
              {mode === "video" ? "Réunion en direct" : "Appel audio en direct"} · {duration}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="size-4 text-emerald-400" />
          Chiffrement actif
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-6">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#202228] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Salle</p>
              <h1 className="text-xl font-semibold">
                {mode === "video" ? "Réunion vidéo" : "Pont audio"} · {conversation.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <UsersRound className="size-4" />
              {members.length} participants
            </div>
          </div>

          <div
            className={cn(
              "grid min-h-0 flex-1 auto-rows-fr gap-4 overflow-auto pr-1",
              leadMembers.length <= 2 ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2"
            )}
          >
            {leadMembers.map((member) => {
              const isCurrentUser = member.id === currentUser.id;

              return (
                <article
                  key={member.id}
                  className="relative overflow-hidden rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top,rgba(126,170,255,0.22),transparent_45%),linear-gradient(180deg,#2b2f38_0%,#1e2128_100%)] p-5"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_50%)]" />
                  <div className="relative flex h-full min-h-56 flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-zinc-300">
                        {isCurrentUser ? "Vous" : member.role}
                      </span>
                      <span className="rounded-full bg-black/25 px-2 py-1 text-xs text-zinc-300">
                        {mode === "video" && (isCurrentUser ? cameraEnabled : true) ? "Caméra active" : "Audio"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
                      <PresenceAvatar
                        initials={member.initials}
                        status={member.status}
                        className="size-20 border-white/15"
                        fallbackClassName="text-xl"
                      />
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">{member.name}</p>
                        <p className="text-sm text-zinc-400">
                          {mode === "video" && (isCurrentUser ? cameraEnabled : true)
                            ? "Flux vidéo disponible"
                            : "Participation audio"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{member.status}</span>
                      <div className="flex items-center gap-2">
                        {isCurrentUser && muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                        {mode === "video" ? (
                          isCurrentUser && !cameraEnabled ? (
                            <CameraOff className="size-4" />
                          ) : (
                            <Camera className="size-4" />
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex shrink-0 flex-wrap items-center justify-center gap-3 border-t border-white/8 pt-4">
            <Button
              variant={muted ? "secondary" : "outline"}
              size="lg"
              className="rounded-full"
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {muted ? "Activer le micro" : "Couper le micro"}
            </Button>
            {mode === "video" && (
              <Button
                variant={cameraEnabled ? "outline" : "secondary"}
                size="lg"
                className="rounded-full"
                onClick={() => setCameraEnabled((value) => !value)}
              >
                {cameraEnabled ? <Camera className="size-4" /> : <CameraOff className="size-4" />}
                {cameraEnabled ? "Couper la caméra" : "Activer la caméra"}
              </Button>
            )}
            <Button variant="outline" size="lg" className="rounded-full">
              <MonitorUp className="size-4" />
              Partager
            </Button>
            <Button variant="outline" size="lg" className="rounded-full">
              <MoreHorizontal className="size-4" />
              Plus
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full"
              onClick={() => router.push("/chat")}
            >
              <PhoneOff className="size-4" />
              Quitter
            </Button>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <section className="shrink-0 rounded-3xl border border-white/8 bg-[#202228] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Aperçu de session</p>
                <p className="text-xs text-zinc-400">
                  {conversation.type === "dm" ? "Appel individuel" : "Réunion d’équipe"}
                </p>
              </div>
              {mode === "video" ? <Video className="size-4 text-sky-300" /> : <Mic className="size-4 text-sky-300" />}
            </div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Statut</p>
                <p className="mt-1 font-medium text-white">Connexion stable, audio HD activé</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Prochaine étape</p>
                <p className="mt-1 font-medium text-white">
                  Présentation du shell compact puis arbitrage sur le flux mobile.
                </p>
              </div>
            </div>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/8 bg-[#202228] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Participants</p>
                <p className="text-xs text-zinc-400">{members.length} membres dans l’appel</p>
              </div>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <UsersRound className="size-4" />
              </Button>
            </div>

            <div className="mt-4 h-full space-y-2 overflow-auto pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5"
                >
                  <PresenceAvatar initials={member.initials} status={member.status} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {member.id === currentUser.id ? `${member.name} (Vous)` : member.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">{member.role}</p>
                  </div>
                  <CheckCheck className="size-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </section>

          <section className="shrink-0 rounded-3xl border border-white/8 bg-[#202228] p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-sky-300" />
              <p className="text-sm font-semibold">Assistant de réunion</p>
            </div>
            <div className="mt-3 rounded-2xl border border-sky-400/15 bg-sky-400/5 p-3 text-sm text-zinc-300">
              <div className="flex items-center gap-2 text-sky-200">
                <Sparkles className="size-4" />
                Aether AI suit les décisions
              </div>
              <p className="mt-2">
                Résumé en direct, points d’action et suivi des décisions seront générés à la fin de la session.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
