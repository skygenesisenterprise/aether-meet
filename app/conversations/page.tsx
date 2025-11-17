'use client';

import React, { useState, useEffect } from 'react';
import { TypingProvider } from '../contexts/typing-context';
import { ReadStatusProvider } from '../contexts/read-status-context';
import { CallProvider } from '../contexts/call-context';
import MessagesList from '../components/messages-list';
import DirectChat from '../components/direct-chat';
import PermissionWelcome from '../components/permission-welcome';

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const [showPermissionWelcome, setShowPermissionWelcome] = useState(false);

  useEffect(() => {
    // Check if it's first visit
    const hasVisitedBefore = localStorage.getItem('aether-meet-visited');
    
    if (!hasVisitedBefore) {
      setShowPermissionWelcome(true);
      localStorage.setItem('aether-meet-visited', 'true');
    }
  }, []);

  const handlePermissionsGranted = () => {
    setShowPermissionWelcome(false);
  };

  const handlePermissionsSkipped = () => {
    setShowPermissionWelcome(false);
  };

  return (
    <TypingProvider>
      <ReadStatusProvider>
        <CallProvider>
          {showPermissionWelcome && (
            <PermissionWelcome
              onPermissionsGranted={handlePermissionsGranted}
              onPermissionsSkipped={handlePermissionsSkipped}
            />
          )}
          <div className="flex h-screen bg-surface">
            {/* Messages List - Gauche */}
            <MessagesList 
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              pinnedConversations={pinnedConversations}
            />
            
            {/* Direct Chat - Droite */}
            <div className="flex-1 min-w-0 h-full">
              <DirectChat 
                conversationId={selectedConversation}
                pinnedConversations={pinnedConversations}
                setPinnedConversations={setPinnedConversations}
              />
            </div>
          </div>
        </CallProvider>
      </ReadStatusProvider>
    </TypingProvider>
  );
}