'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCall } from '../contexts/call-context';
import {
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

interface ChatHeaderProps {
  conversationId: string | null;
  conversationName?: string;
  conversationType?: 'direct' | 'group';
  participants?: string[];
  pinnedConversations?: Set<string>;
  onTogglePin?: () => void;
}

const conversationsData: { [key: string]: { name: string; type: 'direct' | 'group'; participants?: string[] } } = {
  '1': { name: 'Alice Dubois', type: 'direct' },
  '2': { name: 'Équipe Projet', type: 'group', participants: ['Alice', 'Bob', 'Charlie', 'David'] },
  '3': { name: 'Charlie Martin', type: 'direct' }
};

export default function ChatHeader({ 
  conversationId, 
  conversationName,
  conversationType,
  participants = [],
  pinnedConversations = new Set(),
  onTogglePin
}: ChatHeaderProps) {
  const { startCall, currentCall, incomingCall } = useCall();
  
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);

  const conversation = conversationId ? conversationsData[conversationId] : null;
  const name = conversationName || conversation?.name || 'Conversation';
  const type = conversationType || conversation?.type || 'direct';
  const participantCount = participants.length || conversation?.participants?.length || 0;

  useEffect(() => {
    if (currentCall) {
      setCallStatus('connected');
    } else if (incomingCall) {
      setCallStatus('ringing');
    } else {
      setCallStatus('idle');
    }
  }, [currentCall, incomingCall]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev: number) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleCallStart = useCallback(async (callType: 'audio' | 'video') => {
    if (!conversationId) return;
    
    setCallStatus('connecting');
    startCall(callType, name, conversationId);
  }, [conversationId, name, startCall]);

  const formatCallDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, []);

  if (!conversationId) {
    return null; // Ne pas afficher le header si aucune conversation
  }

  return (
    <div className="h-16 bg-surface-elevated border-b border-theme flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-10 h-10 relative">
            {type === 'group' ? (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.448 0A5.002 5.002 0 0112 14.586m0 0a5.002 5.002 0 019.448 0" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm relative overflow-hidden">
                <span className="text-white font-semibold text-sm">
                  {getInitials(name)}
                </span>
                <div className="absolute inset-0 bg-white/10"></div>
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface shadow-sm"></div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-primary truncate">
              {name}
            </h3>
            {callStatus !== 'idle' && (
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-surface rounded-full">
                {callStatus === 'ringing' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-600 font-medium">Sonnerie...</span>
                  </>
                )}
                {callStatus === 'connecting' && (
                  <>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin"></div>
                    <span className="text-xs text-blue-600 font-medium">Connexion...</span>
                  </>
                )}
                {callStatus === 'connected' && (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">{formatCallDuration(callDuration)}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-secondary">
            {type === 'group' 
              ? `${participantCount} participants`
              : callStatus === 'connected' ? 'En appel' : 'En ligne'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={() => handleCallStart('audio')}
          disabled={callStatus !== 'idle'}
          className={`p-3 rounded-full transition-all duration-200 ${
            callStatus === 'idle' 
              ? 'hover:bg-surface-elevated' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          title="Appel audio"
        >
          <PhoneIcon className={`h-5 w-5 ${
            callStatus === 'idle' ? 'text-secondary' : 'text-secondary/50'
          }`} />
        </button>
        <button 
          onClick={() => handleCallStart('video')}
          disabled={callStatus !== 'idle'}
          className={`p-3 rounded-full transition-all duration-200 ${
            callStatus === 'idle' 
              ? 'hover:bg-surface-elevated' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          title="Appel vidéo"
        >
          <VideoCameraIcon className={`h-5 w-5 ${
            callStatus === 'idle' ? 'text-secondary' : 'text-secondary/50'
          }`} />
        </button>
        {onTogglePin && (
          <button 
            onClick={onTogglePin}
            className={`p-2 rounded-lg hover:bg-surface transition-colors ${
              pinnedConversations.has(conversationId || '') ? 'text-accent' : 'text-secondary'
            }`}
            title={pinnedConversations.has(conversationId || '') ? 'Désépingler' : 'Épingler'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}