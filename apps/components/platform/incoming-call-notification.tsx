"use client";

import * as React from "react";
import { Phone, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PresenceAvatar } from "./presence-avatar";
import { useCallStore } from "@/lib/call-store";
import { useRouter } from "next/navigation";
import { acceptCall as apiAcceptCall, rejectCall as apiRejectCall } from "@/lib/api/calls";
import type { IncomingCallNotification } from "@/types/call";

interface IncomingCallNotificationProps {
  notification: IncomingCallNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export function IncomingCallNotification({
  notification,
  onAccept,
  onReject,
}: IncomingCallNotificationProps) {
  const router = useRouter();
  const { acceptCall, rejectCall } = useCallStore();
  const [isRinging, setIsRinging] = React.useState(true);
  const [timeElapsed, setTimeElapsed] = React.useState(0);

  // Calculate time elapsed
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  const handleAccept = async () => {
    setIsRinging(false);
    
    try {
      // Accepter l'appel via l'API
      await apiAcceptCall(notification.id);
      
      // Mettre à jour le store local
      acceptCall(notification.id);
      
      // Rediriger vers la room d'appel
      const params = new URLSearchParams({
        conversationId: notification.conversationId,
        mode: notification.mode,
        meetingId: notification.meetingId,
        token: notification.token,
        signalingUrl: notification.signalingUrl,
      });
      
      router.push(`/calls/room?${params.toString()}`);
      onAccept?.();
    } catch (error) {
      console.error("Failed to accept call:", error);
      setIsRinging(false);
    }
  };

  const handleReject = async () => {
    setIsRinging(false);
    
    try {
      // Rejeter l'appel via l'API
      await apiRejectCall(notification.id);
      
      // Mettre à jour le store local
      rejectCall(notification.id);
      onReject?.();
    } catch (error) {
      console.error("Failed to reject call:", error);
      rejectCall(notification.id);
      onReject?.();
    }
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto z-50 ${
        isRinging ? "animate-shake" : ""
      }`}
    >
      <div className="rounded-3xl border border-white/8 bg-[#202228] p-4 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <PresenceAvatar
              initials={notification.callerName.split(" ").map((n) => n[0]).join("")}
              status="online"
              className="size-16 border-2 border-emerald-400"
            />
            {/* Ringing indicator */}
            {isRinging && (
              <div className="absolute -right-1 -top-1 flex gap-0.5">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "200ms" }} />
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "400ms" }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {notification.callerName}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {notification.mode === "video" ? "Appel vidéo" : "Appel audio"}
            </p>
            <p className="text-xs text-zinc-500">
              {notification.conversationName}
            </p>
          </div>

          {/* Timer */}
          <div className="text-xs text-zinc-500 tabular-nums">
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full hover:bg-zinc-700"
            onClick={handleReject}
            aria-label="Refuser l'appel"
          >
            <X className="size-5 text-zinc-400" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="size-10 rounded-full bg-emerald-500 hover:bg-emerald-600"
            onClick={handleAccept}
            aria-label={notification.mode === "video" ? "Accepter l'appel vidéo" : "Accepter l'appel audio"}
          >
            {notification.mode === "video" ? (
              <Video className="size-5 text-white" />
            ) : (
              <Phone className="size-5 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Container component that displays all incoming call notifications
 */
export function IncomingCallNotifications() {
  const { incomingCalls } = useCallStore();
  
  if (incomingCalls.size === 0) {
    return null;
  }

  return (
    <>
      {Array.from(incomingCalls.values()).map((notification) => (
        <IncomingCallNotification
          key={notification.id}
          notification={notification}
        />
      ))}
    </>
  );
}

/**
 * Hook to check if there's an incoming call for the current conversation
 */
export function useIncomingCall(conversationId: string) {
  const { hasIncomingCall, getIncomingCallForConversation } = useCallStore();
  
  return {
    hasIncomingCall: hasIncomingCall(conversationId),
    incomingCall: getIncomingCallForConversation(conversationId),
  };
}
