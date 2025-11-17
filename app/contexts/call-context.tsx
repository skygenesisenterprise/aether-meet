'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';

interface Call {
  id: string;
  type: CallType;
  participant: string;
  participantId: string;
  status: CallStatus;
  startTime?: number;
  duration?: number;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
}

interface CallContextType {
  currentCall: Call | null;
  isInCall: boolean;
  startCall: (type: CallType, participant: string, participantId: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  acceptCall: () => void;
  rejectCall: () => void;
  incomingCall: Call | null;
  setIncomingCall: (call: Call | null) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  const isInCall = currentCall?.status === 'active';

  const startCall = useCallback((type: CallType, participant: string, participantId: string) => {
    const newCall: Call = {
      id: Date.now().toString(),
      type,
      participant,
      participantId,
      status: 'connecting',
      startTime: Date.now(),
      isMuted: false,
      isVideoOn: type === 'video',
      isScreenSharing: false
    };

    setCurrentCall(newCall);

    // Simulate connection
    setTimeout(() => {
      setCurrentCall(prev => prev ? { ...prev, status: 'active' } : null);
    }, 2000);
  }, []);

  const endCall = useCallback(() => {
    if (currentCall) {
      const duration = currentCall.startTime ? Math.floor((Date.now() - currentCall.startTime) / 1000) : 0;
      setCurrentCall(prev => prev ? { ...prev, status: 'ended', duration } : null);
      
      // Clear call after a short delay
      setTimeout(() => {
        setCurrentCall(null);
      }, 1000);
    }
  }, [currentCall]);

  const toggleMute = useCallback(() => {
    setCurrentCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  }, []);

  const toggleVideo = useCallback(() => {
    setCurrentCall(prev => prev ? { ...prev, isVideoOn: !prev.isVideoOn } : null);
  }, []);

  const toggleScreenShare = useCallback(() => {
    setCurrentCall(prev => prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null);
  }, []);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      setCurrentCall({
        ...incomingCall,
        status: 'active',
        startTime: Date.now()
      });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return (
    <CallContext.Provider value={{
      currentCall,
      isInCall,
      startCall,
      endCall,
      toggleMute,
      toggleVideo,
      toggleScreenShare,
      acceptCall,
      rejectCall,
      incomingCall,
      setIncomingCall
    }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}