'use client';

import React, { useState, useEffect } from 'react';
import { TypingProvider } from '../contexts/typing-context';
import { ReadStatusProvider } from '../contexts/read-status-context';
import { CallProvider } from '../contexts/call-context';
import MessagesList from '../components/messages-list';
import DirectChat from '../components/direct-chat';
import ConversationHeader from '../components/conversation-header';
import PermissionWelcome from '../components/permission-welcome';

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set(['1', '2']));
  const [showPermissionWelcome, setShowPermissionWelcome] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    // Check if it's first visit
    const hasVisitedBefore = localStorage.getItem('aether-meet-visited');
    
    if (!hasVisitedBefore) {
      setShowPermissionWelcome(true);
      localStorage.setItem('aether-meet-visited', 'true');
    }

    // Load conversations from JSON
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch('/conversations.json');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handlePermissionsGranted = () => {
    setShowPermissionWelcome(false);
  };

  const handlePermissionsSkipped = () => {
    setShowPermissionWelcome(false);
  };

  const handleNewConversation = (type: 'direct' | 'group') => {
    const newConversation = {
      id: Date.now().toString(),
      name: type === 'direct' ? 'Nouvelle conversation' : 'Nouveau groupe',
      lastMessage: 'Commencez à discuter...',
      time: 'Maintenant',
      type: type,
      status: 'online'
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation.id);
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
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
          <div className="flex h-[calc(100vh-3.5rem)] bg-surface overflow-hidden">
            {/* Messages List - Gauche */}
            <div className="flex-shrink-0">
              <MessagesList 
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
                conversations={conversations}
                pinnedConversations={pinnedConversations}
                onNewConversation={handleNewConversation}
                onSearch={handleSearch}
                onTogglePin={(id) => {
                  setPinnedConversations(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }}
              />
            </div>
            
            {/* Direct Chat - Droite */}
            <div className="flex-1 min-w-0 h-full overflow-hidden">
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