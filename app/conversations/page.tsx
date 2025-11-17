'use client';

import React, { useState, useEffect } from 'react';
import { TypingProvider } from '../contexts/typing-context';
import { ReadStatusProvider } from '../contexts/read-status-context';
import { CallProvider } from '../contexts/call-context';
import MessagesList from '../components/messages-list';
import DirectChat from '../components/direct-chat';
import PermissionWelcome from '../components/permission-welcome';

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('2');
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set(['1'])); // Example: conversation 1 is pinned by default
  const [showPermissionWelcome, setShowPermissionWelcome] = useState(false);

  useEffect(() => {
    // Check if it's the first visit
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
          <div className="flex h-full">
            {/* Messages List - Gauche */}
            <MessagesList 
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              pinnedConversations={pinnedConversations}
            />
            
            {/* Direct Chat - Droite */}
            <DirectChat 
              conversationId={selectedConversation} 
              pinnedConversations={pinnedConversations}
              setPinnedConversations={setPinnedConversations}
            />
          </div>
        </CallProvider>
      </ReadStatusProvider>
    </TypingProvider>
  );
}