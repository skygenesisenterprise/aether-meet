"use client";

import * as React from "react";
import { Phone, Video, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallStore } from "@/lib/call-store";
import { cn } from "@/lib/utils";

interface ConversationCallIndicatorProps {
  conversationId: string;
  conversationName: string;
  className?: string;
}

export function ConversationCallIndicator({
  conversationId,
  conversationName,
  className,
}: ConversationCallIndicatorProps) {
  const {
    hasIncomingCall,
    hasOutgoingCall,
    isInCall,
    getIncomingCallForConversation,
  } = useCallStore();

  const incomingCall = getIncomingCallForConversation(conversationId);

  // Show incoming call indicator
  if (hasIncomingCall(conversationId) && incomingCall) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2",
          className
        )}
      >
        <div className="flex gap-0.5">
          <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "200ms" }} />
          <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "400ms" }} />
        </div>
        <span className="text-xs font-medium text-emerald-300">
          {incomingCall.callerName} vous appelle
        </span>
        <span className="text-xs text-emerald-400/70">
          {incomingCall.mode === "video" ? "📹" : "📞"}
        </span>
      </div>
    );
  }

  // Show outgoing call indicator (ringing)
  if (hasOutgoingCall(conversationId)) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-3 py-2",
          className
        )}
      >
        <Clock className="size-3 text-sky-400" />
        <span className="text-xs font-medium text-sky-300">
          Appel en cours...
        </span>
      </div>
    );
  }

  // Show in-call indicator
  if (isInCall(conversationId)) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2",
          className
        )}
      >
        <Check className="size-3 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-300">
          En appel
        </span>
      </div>
    );
  }

  return null;
}

/**
 * Call action buttons for conversation header
 */
export function ConversationCallActions({
  conversationId,
  conversationName,
  onAudioCall,
  onVideoCall,
  disabled,
}: {
  conversationId: string;
  conversationName: string;
  onAudioCall: () => void;
  onVideoCall: () => void;
  disabled?: boolean;
}) {
  const { isInCall } = useCallStore();
  const isInActiveCall = isInCall(conversationId);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full border-white/8 hover:bg-white/5"
        onClick={onAudioCall}
        disabled={disabled || isInActiveCall}
        aria-label="Appel audio"
      >
        <Phone className="size-4 text-zinc-400" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full border-white/8 hover:bg-white/5"
        onClick={onVideoCall}
        disabled={disabled || isInActiveCall}
        aria-label="Appel vidéo"
      >
        <Video className="size-4 text-zinc-400" />
      </Button>
    </div>
  );
}
