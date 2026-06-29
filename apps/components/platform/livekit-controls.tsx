"use client";

import * as React from "react";
import { Mic, MicOff, Camera, CameraOff, MonitorUp, PhoneOff, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveKitControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  mode: "audio" | "video";
  onToggleAudio: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onToggleScreenSharing: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  disabled?: boolean;
}

export function LiveKitControls({
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  mode,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenSharing,
  onDisconnect,
  disabled = false,
}: LiveKitControlsProps) {
  return (
    <div className="mt-4 flex shrink-0 flex-wrap items-center justify-center gap-3 border-t border-white/8 pt-4">
      <Button
        variant={isAudioMuted ? "secondary" : "outline"}
        size="lg"
        className="rounded-full"
        onClick={onToggleAudio}
        disabled={disabled}
        aria-label={isAudioMuted ? "Activer le micro" : "Couper le micro"}
      >
        {isAudioMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        {isAudioMuted ? "Activer le micro" : "Couper le micro"}
      </Button>
      
      {mode === "video" && (
        <Button
          variant={isVideoMuted ? "secondary" : "outline"}
          size="lg"
          className="rounded-full"
          onClick={onToggleVideo}
          disabled={disabled}
          aria-label={isVideoMuted ? "Activer la caméra" : "Couper la caméra"}
        >
          {isVideoMuted ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
          {isVideoMuted ? "Activer la caméra" : "Couper la caméra"}
        </Button>
      )}
      
      <Button
        variant={isScreenSharing ? "secondary" : "outline"}
        size="lg"
        className="rounded-full"
        onClick={onToggleScreenSharing}
        disabled={disabled}
        aria-label={isScreenSharing ? "Arrêter le partage" : "Partager l'écran"}
      >
        <MonitorUp className="size-4" />
        {isScreenSharing ? "Arrêter le partage" : "Partager"}
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        className="rounded-full"
        disabled={disabled}
        aria-label="Plus d'options"
      >
        <MoreHorizontal className="size-4" />
        Plus
      </Button>
      
      <Button
        variant="destructive"
        size="lg"
        className="rounded-full"
        onClick={onDisconnect}
        disabled={disabled}
        aria-label="Quitter l'appel"
      >
        <PhoneOff className="size-4" />
        Quitter
      </Button>
    </div>
  );
}

interface LiveKitStatusProps {
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  participantCount: number;
  mode: "audio" | "video";
  conversationName: string;
}

export function LiveKitStatus({
  isConnecting,
  isConnected,
  error,
  participantCount,
  mode,
  conversationName,
}: LiveKitStatusProps) {
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <div className="size-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        Connexion en cours...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-rose-400">
        Erreur de connexion
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      {participantCount} participants · {mode === "video" ? "Réunion vidéo" : "Appel audio"} avec {conversationName}
    </div>
  );
}

export default LiveKitControls;
