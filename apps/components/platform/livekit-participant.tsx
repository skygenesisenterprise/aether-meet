"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { Track, type LocalParticipant, type RemoteParticipant, type TrackPublication } from "livekit-client";
import { PresenceAvatar } from "./presence-avatar";
import { cn } from "@/lib/utils";

interface ParticipantVideoProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

function ParticipantVideo({
  participant,
  isLocal = false,
  width = 400,
  height = 300,
  className,
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Track the number of subscribed tracks to trigger re-render when tracks change
  const subscribedTrackCount = React.useMemo(() => {
    return Array.from(participant.trackPublications.values() as Iterable<TrackPublication>)
      .filter((pub) => pub.isSubscribed && pub.track).length;
  }, [participant]);

  useEffect(() => {
    // Get track publications as array
    const trackPublications = Array.from(participant.trackPublications.values() as Iterable<TrackPublication>);
    
    // Find video track
    const videoPub = trackPublications.find((pub) => pub.track?.kind === Track.Kind.Video && pub.isSubscribed);
    const videoTrack = videoPub?.track;

    // Find audio track
    const audioPub = trackPublications.find((pub) => pub.track?.kind === Track.Kind.Audio && pub.isSubscribed);
    const audioTrack = audioPub?.track;

    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }

    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [participant, subscribedTrackCount]);

  // Check for video and audio tracks
  const trackPublicationsArray = Array.from(participant.trackPublications.values() as Iterable<TrackPublication>);
  const hasVideo = trackPublicationsArray.some((pub) => pub.track?.kind === Track.Kind.Video);
  const hasAudio = trackPublicationsArray.some((pub) => pub.track?.kind === Track.Kind.Audio);
  const isSpeaking = participant.isSpeaking;
  
  // Extract name - participant can have name property or we use identity
  const displayName = participant.name || participant.identity;
  const nameParts = displayName.split(" ");
  const initials = nameParts
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/8 bg-[radial-gradient(circle_at_top,rgba(126,170,255,0.22),transparent_45%),linear-gradient(180deg,#2b2f38_0%,#1e2128_100%)]",
          isSpeaking && "ring-2 ring-emerald-400"
        )}
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_50%)]" />
        
        {hasVideo ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted={isLocal}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 w-full h-full">
            <PresenceAvatar
              initials={initials}
              status={isSpeaking ? "online" : "offline"}
              className="size-20 border-white/15"
              fallbackClassName="text-xl"
            />
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{displayName}</p>
              <p className="text-sm text-zinc-400">
                {hasAudio ? "Audio uniquement" : "Pas de flux"}
              </p>
            </div>
          </div>
        )}
        
        {/* Audio element for remote participants */}
        {!isLocal && hasAudio && (
          <audio ref={audioRef} autoPlay playsInline className="hidden" />
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1.5">
            <div className="flex gap-0.5">
              <div className="size-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="size-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="size-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-white">{displayName}</p>
        <p className="text-xs text-zinc-400">
          {isLocal ? "Vous" : hasAudio ? hasVideo ? "Vidéo" : "Audio" : "Connecté"}
        </p>
      </div>
    </div>
  );
}

interface ParticipantTileProps {
  participant: LocalParticipant | RemoteParticipant;
  isLocal?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ParticipantTile({
  participant,
  isLocal = false,
  size = "md",
}: ParticipantTileProps) {
  const sizes = {
    sm: { width: 160, height: 120 },
    md: { width: 200, height: 150 },
    lg: { width: 400, height: 300 },
  };

  return (
    <ParticipantVideo
      participant={participant}
      isLocal={isLocal}
      width={sizes[size].width}
      height={sizes[size].height}
    />
  );
}

interface ParticipantGridProps {
  localParticipant: LocalParticipant | null;
  remoteParticipants: Map<string, RemoteParticipant>;
  mode: "audio" | "video";
}

export function ParticipantGrid({
  localParticipant,
  remoteParticipants,
  mode,
}: ParticipantGridProps) {
  const allParticipants = React.useMemo(() => {
    const participants: Array<{ participant: LocalParticipant | RemoteParticipant; isLocal: boolean }> = [];
    
    if (localParticipant) {
      participants.push({ participant: localParticipant, isLocal: true });
    }
    
    remoteParticipants.forEach((participant) => {
      participants.push({ participant, isLocal: false });
    });
    
    return participants;
  }, [localParticipant, remoteParticipants]);

  if (allParticipants.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-400">
        En attente de participants...
      </div>
    );
  }

  // For audio mode, show a simpler layout
  if (mode === "audio") {
    return (
      <div className="grid grid-cols-1 gap-4">
        {allParticipants.map(({ participant, isLocal }) => {
          const displayName = participant.name || participant.identity;
          const nameParts = displayName.split(" ");
          const initials = nameParts.slice(0, 2).map((p: string) => p.charAt(0).toUpperCase()).join("");
          const isSpeaking = participant.isSpeaking;
          
          return (
            <div
              key={participant.identity}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#202228] p-4"
            >
              <PresenceAvatar
                initials={initials}
                status={isSpeaking ? "online" : "offline"}
                className="size-12"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {displayName}
                  {isLocal && " (Vous)"}
                </p>
                <p className="text-xs text-zinc-400">
                  {isSpeaking ? "En train de parler" : "En ligne"}
                </p>
              </div>
              {isSpeaking && (
                <div className="flex gap-0.5">
                  <div className="size-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="size-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="size-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // For video mode, show grid layout
  const leadParticipants = allParticipants.slice(0, 4);
  const isSingleParticipant = leadParticipants.length === 1;
  const isTwoParticipants = leadParticipants.length === 2;

  return (
    <div
      className={cn(
        "grid min-h-0 flex-1 auto-rows-fr gap-4 overflow-auto pr-1",
        isSingleParticipant ? "grid-cols-1" : isTwoParticipants ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2"
      )}
    >
      {leadParticipants.map(({ participant, isLocal }) => (
        <ParticipantTile
          key={participant.identity}
          participant={participant}
          isLocal={isLocal}
          size={isSingleParticipant ? "lg" : isTwoParticipants ? "lg" : "md"}
        />
      ))}
    </div>
  );
}

export default ParticipantGrid;
