"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  Mic,
  PhoneOff,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { ParticipantGrid } from "@/components/platform/livekit-participant";
import { LiveKitControls, LiveKitStatus } from "@/components/platform/livekit-controls";
import { cn, formatDuration } from "@/lib/utils";
import { useLiveKitRoom } from "@/hooks/use-livekit";
import { usePlatform } from "@/context/PlatformContext";
import { getConversation } from "@/lib/api/conversations";
import { createMeeting, createMeetingJoinToken, startMeeting } from "@/lib/api/meetings";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { getMe } from "@/lib/api/me";
import { resolvePresenceStatus, type PresenceStatus } from "@/lib/presence";
import type { Conversation, User as ApiUser } from "@/lib/api/types";

// Local user interface for participant display
interface ParticipantUser {
  id: string;
  name: string;
  displayName?: string;
  initials: string;
  status: string;
  email?: string;
  presenceStatus?: string;
}

// Function to generate room name from conversation
function generateRoomName(conversationId: string | null): string {
  if (!conversationId) return "default-room";
  return `conv-${conversationId}`;
}

// Function to generate participant identity
function generateParticipantIdentity(userId: string): string {
  return `user-${userId}`;
}

// Function to generate participant name
function generateParticipantName(user: { id: string; name?: string; displayName?: string } | ApiUser): string {
  return user.name || user.displayName || `User ${user.id}`;
}

// Helper function to get conversation display info
function getConversationDisplayInfo(conv: Conversation | null) {
  if (!conv) return { initials: '?', status: 'offline', name: 'Chargement...' };
  
  // If conversation has direct properties
  if ((conv as any).initials && (conv as any).status) {
    return { initials: (conv as any).initials, status: (conv as any).status, name: conv.name || 'Conversation' };
  }
  
  // Generate from name
  const name = conv.name || 'Conversation';
  const initials = name.split(' ').map((n: string) => n[0].toUpperCase()).slice(0, 2).join('');
  return { initials, status: 'online', name };
}

// Helper function to get user display info
function getUserDisplayInfo(user: ApiUser | null | undefined): { initials: string; status: PresenceStatus | undefined; name: string } {
  if (!user) return { initials: '?', status: undefined, name: 'Utilisateur' };
  
  const name = user.displayName || user.name || 'Utilisateur';
  const initials = name.split(' ').map((n: string) => n[0].toUpperCase()).slice(0, 2).join('');
  const status = resolvePresenceStatus({
    presenceStatus: user.presenceStatus,
    status: user.status,
    lastSeenAt: user.lastSeenAt,
  });
  
  return { initials, status, name };
}

export default function CallRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeWorkspaceId, currentUser: platformUser } = usePlatform();
  
  // Get parameters from URL
  const conversationId = searchParams.get("conversationId");
  const mode = searchParams.get("mode") === "audio" ? "audio" : "video";
  const urlMeetingId = searchParams.get("meetingId");
  const urlToken = searchParams.get("token");
  const urlSignalingUrl = searchParams.get("signalingUrl");
  
  // State for real data
  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [members, setMembers] = React.useState<ParticipantUser[]>([]);
  const [otherParticipants, setOtherParticipants] = React.useState<ParticipantUser[]>([]);
  const [currentUser, setCurrentUser] = React.useState<ApiUser | null>(null);
  const [startedAt] = React.useState(() => new Date());
  const [, setTick] = React.useState(0);
  const [meetingId, setMeetingId] = React.useState<string | null>(urlMeetingId || null);
  const [token, setToken] = React.useState<string | null>(urlToken || null);
  const [signalingUrl, setSignalingUrl] = React.useState<string | null>(urlSignalingUrl || null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch current user data
  React.useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        // Fallback to platform user if available
        if (platformUser) {
          setCurrentUser(platformUser as ApiUser);
        }
      }
    }
    void fetchCurrentUser();
  }, [platformUser]);

  // Fetch conversation and members data
  React.useEffect(() => {
    if (!conversationId || !activeWorkspaceId) {
      setIsLoading(false);
      return;
    }

    async function fetchConversationData() {
      try {
        if (!conversationId) return;
        // Fetch conversation
        const conv = await getConversation(conversationId);
        setConversation(conv);

        // Extract members from conversation participants or memberIds
        const participants = conv.participants || [];
        const memberIds = conv.memberIds || [];
        
        // Map participants to ParticipantUser objects
        const membersData: ParticipantUser[] = participants.map((p: any) => ({
          id: p.userId,
          name: p.displayName,
          displayName: p.displayName,
          email: p.email,
          status: p.status,
          presenceStatus: p.presenceStatus,
          initials: p.displayName ? p.displayName.split(' ').map((n: string) => n[0].toUpperCase()).slice(0, 2).join('') : '?',
        }));
        
        setMembers(membersData);
        
        // Filter out current user to get other participants
        const otherParticipantsData = membersData.filter(
          (member) => member.id !== currentUser?.id
        );
        setOtherParticipants(otherParticipantsData);
        
      } catch (err) {
        console.error("Failed to fetch conversation data:", err);
        setError("Impossible de charger les données de la conversation");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchConversationData();
  }, [conversationId, activeWorkspaceId, currentUser?.id]);

  // Auto-connect to room on mount
  const {
    isConnecting,
    isConnected,
    isDisconnected,
    error: roomError,
    localParticipant,
    remoteParticipants,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenSharing,
  } = useLiveKitRoom({
    roomName: generateRoomName(conversationId),
    token: token || "",
    signalingUrl: signalingUrl || "",
    participantName: currentUser ? generateParticipantName(currentUser) : "Anonymous",
    participantIdentity: currentUser ? generateParticipantIdentity(currentUser.id) : "anonymous",
    audioEnabled: mode !== "audio",
    videoEnabled: mode === "video",
  });

  // Initialize meeting and get join token if we don't have one
  React.useEffect(() => {
    if (!activeWorkspaceId || !currentUser || !conversationId) {
      setIsLoading(false);
      return;
    }

    // If we already have token and signalingUrl from URL, just connect
    if (token && signalingUrl) {
      setIsLoading(false);
      return;
    }

    async function initializeMeeting() {
      try {
        setIsLoading(true);
        setError(null);

        if (!currentUser || !activeWorkspaceId || !conversationId) {
          throw new Error("Missing required data");
        }

        // Generate idempotency key for meeting creation
        const meetingIdempotencyKey = createIdempotencyKey(`meeting-create-${conversationId}-${currentUser.id}`);
        const startIdempotencyKey = createIdempotencyKey(`meeting-start-${conversationId}-${currentUser.id}`);

        // Create a meeting for this conversation
        const meeting = await createMeeting(
          activeWorkspaceId,
          {
            title: `Appel ${mode === "video" ? "vidéo" : "audio"} - ${conversationId}`,
            conversationId,
          },
          meetingIdempotencyKey
        );

        setMeetingId(meeting.id);

        // Start the meeting to create a session
        try {
          await startMeeting(meeting.id, startIdempotencyKey);
        } catch (startError) {
          console.log("Meeting already started or doesn't exist, proceeding to get join token");
        }

        // Get join token for the current user
        const credentials = await createMeetingJoinToken(meeting.id);

        setToken(credentials.token);
        setSignalingUrl(credentials.signalingUrl);

      } catch (err) {
        console.error("Failed to initialize meeting:", err);
        setError("Impossible d'initialiser la réunion. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    }

    void initializeMeeting();
  }, [activeWorkspaceId, currentUser, conversationId, token, signalingUrl]);

  // Auto-reconnect if disconnected
  React.useEffect(() => {
    if (isDisconnected && token && signalingUrl) {
      const timer = setTimeout(() => {
        void connect();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDisconnected, token, signalingUrl, connect]);

  // Timer for duration
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const duration = formatDuration(startedAt);
  const leadMembers = members.slice(0, 4);
  const participantCount = 1 + remoteParticipants.size;

  // Handle disconnect
  const handleDisconnect = React.useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full min-h-full flex-col items-center justify-center bg-[#18191c] text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
          <p className="text-lg font-semibold">Initialisation de la réunion...</p>
          <p className="text-sm text-zinc-400">Préparation de la connexion {mode === "video" ? "vidéo" : "audio"}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isConnected) {
    return (
      <div className="flex h-full min-h-full flex-col items-center justify-center bg-[#18191c] text-zinc-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-12 flex items-center justify-center rounded-full bg-rose-400/20">
            <PhoneOff className="size-6 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold">Erreur de connexion</h2>
          <p className="text-sm text-zinc-400">{error}</p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className={cn("min-w-30")}
              onClick={() => router.push("/chat")}
            >
              Retour au chat
            </Button>
            <Button
              className={cn("min-w-30")}
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-full flex-col overflow-hidden bg-[#18191c] text-zinc-100")}>
      <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-white/8 bg-[#1d1f23] px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon-sm" className="rounded-md" asChild>
            <Link href="/chat">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Retour au chat</span>
            </Link>
          </Button>
          {conversation && (
            <>
              <PresenceAvatar 
                initials={getConversationDisplayInfo(conversation).initials} 
                status={getConversationDisplayInfo(conversation).status as any} 
                className="size-9" 
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{getConversationDisplayInfo(conversation).name}</p>
                <LiveKitStatus
                  isConnecting={isConnecting}
                  isConnected={isConnected}
                  error={roomError}
                  participantCount={participantCount}
                  mode={mode}
                  conversationName={getConversationDisplayInfo(conversation).name || 'Conversation'}
                />
              </div>
            </>
          )}
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
                {mode === "video" ? "Réunion vidéo" : "Pont audio"} · {conversation?.name || "Chargement..."}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <UsersRound className="size-4" />
              {participantCount} participants
            </div>
          </div>

          {/* LiveKit Participant Grid */}
          <div className="min-h-0 flex-1">
            {isConnected ? (
              <ParticipantGrid
                localParticipant={localParticipant}
                remoteParticipants={remoteParticipants}
                mode={mode}
              />
            ) : isConnecting ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <p className="text-sm text-zinc-400">Connexion à la réunion...</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <PresenceAvatar
                    initials={getUserDisplayInfo(currentUser).initials}
                    status={getUserDisplayInfo(currentUser).status}
                    className="size-20"
                  />
                  <p className="text-lg font-semibold">{getUserDisplayInfo(currentUser).name}</p>
                  <p className="text-sm text-zinc-400">En attente de connexion...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <LiveKitControls
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            isScreenSharing={isScreenSharing}
            mode={mode}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenSharing={toggleScreenSharing}
            onDisconnect={handleDisconnect}
            disabled={isConnecting || !isConnected}
          />
        </section>

        <aside className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <section className="shrink-0 rounded-3xl border border-white/8 bg-[#202228] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Aperçu de session</p>
                <p className="text-xs text-zinc-400">
                  {conversation?.type === "dm" ? "Appel individuel" : "Réunion d'équipe"}
                </p>
              </div>
              {mode === "video" ? <Video className="size-4 text-sky-300" /> : <Mic className="size-4 text-sky-300" />}
            </div>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Statut</p>
                <p className="mt-1 font-medium text-white">
                  {isConnected ? "Connecté" : isConnecting ? "Connexion en cours..." : "Déconnecté"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Durée</p>
                <p className="mt-1 font-medium text-white">{duration}</p>
              </div>
            </div>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/8 bg-[#202228] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Participants</p>
                <p className="text-xs text-zinc-400">{participantCount} membres dans l'appel</p>
              </div>
            </div>

            <div className="mt-4 h-full space-y-2 overflow-auto pr-1">
              {/* Local participant */}
              {localParticipant && currentUser && (
                <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5">
                  <PresenceAvatar
                    initials={getUserDisplayInfo(currentUser).initials}
                    status={getUserDisplayInfo(currentUser).status}
                    className="size-9"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {getUserDisplayInfo(currentUser).name} (Vous)
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {isAudioMuted ? "Micro coupé" : isVideoMuted ? "Caméra coupée" : "Actif"}
                    </p>
                  </div>
                  <CheckCheck className="size-4 text-emerald-400" />
                </div>
              )}

              {/* Remote participants */}
              {Array.from(remoteParticipants.values()).map((participant) => {
                const displayName = participant.name || participant.identity;
                const initials = displayName
                  .split(" ")
                  .map((part) => part.charAt(0).toUpperCase())
                  .slice(0, 2)
                  .join("");

                return (
                  <div
                    key={participant.identity}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5"
                  >
                    <PresenceAvatar
                      initials={initials}
                      status={participant.isSpeaking ? "online" : "offline"}
                      className="size-9"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{displayName}</p>
                      <p className="truncate text-xs text-zinc-400">
                        {participant.isSpeaking ? "En train de parler" : "Connecté"}
                      </p>
                    </div>
                    <CheckCheck className="size-4 text-emerald-400" />
                  </div>
                );
              })}

              {/* Other conversation members who haven't joined yet */}
              {otherParticipants
                .filter((p) => !Array.from(remoteParticipants.values()).some((rp) => 
                  rp.identity.includes(p.id)
                ))
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-3 py-2.5 opacity-60"
                  >
                    <PresenceAvatar
                      initials={member.initials}
                      status={member.status as any}
                      className="size-9"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{member.name}</p>
                      <p className="truncate text-xs text-zinc-400">Invité</p>
                    </div>
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
                Résumé en direct, points d'action et suivi des décisions seront générés à la fin de la session.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
