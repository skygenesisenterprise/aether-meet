'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTyping } from '../contexts/typing-context';
import { useReadStatus } from '../contexts/read-status-context';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isOnline?: boolean;
  isTyping?: boolean;
  type: 'direct' | 'group';
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
  typingUsers?: string[];
  hasError?: boolean;
}

interface MessagesListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  conversations?: Conversation[];
  pinnedConversations?: Set<string>;
  onNewConversation?: (type: 'direct' | 'group') => void;
  onSearch?: (query: string) => void;
  onTogglePin?: (conversationId: string) => void;
  loading?: boolean;
  error?: string | null;
}

const defaultConversations: Conversation[] = [
  {
    id: '1',
    name: 'Alice Dubois',
    lastMessage: 'Super ! On se voit cet après-midi ?',
    time: '14:30',
    unread: 2,
    isOnline: true,
    type: 'direct',
    status: 'online'
  },
  {
    id: '2',
    name: 'Équipe Projet',
    lastMessage: 'Bob: La réunion est confirmée pour 15h',
    time: '13:45',
    type: 'group',
    status: 'online'
  },
  {
    id: '3',
    name: 'Charlie Martin',
    lastMessage: 'rapport.pdf',
    time: 'Hier',
    type: 'direct',
    status: 'away',
    lastSeen: 'Vu il y a 2 heures'
  }
];

export default function MessagesList({ 
  selectedConversation, 
  onSelectConversation,
  conversations = defaultConversations,
  pinnedConversations = new Set(),
  onNewConversation,
  onSearch,
  onTogglePin,
  loading = false,
  error = null
}: MessagesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'unread' | 'groups'>('recent');
  const [showNewMenu, setShowNewMenu] = useState(false);
  
  const { getTypingUsers } = useTyping();
  const { getUnreadCount, markConversationAsRead } = useReadStatus();

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, []);

  const getStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'online': return 'from-green-400 to-green-600';
      case 'away': return 'from-yellow-400 to-orange-500';
      case 'busy': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  }, [onSearch]);

  const handleNewConversationClick = useCallback((type: 'direct' | 'group') => {
    onNewConversation?.(type);
    setShowNewMenu(false);
  }, [onNewConversation]);

  const handleTogglePinClick = useCallback((conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin?.(conversationId);
  }, [onTogglePin]);

  const handleConversationClick = useCallback((conversationId: string) => {
    onSelectConversation(conversationId);
    markConversationAsRead(conversationId);
  }, [onSelectConversation, markConversationAsRead]);

  const filteredConversations = useMemo(() => {
    return conversations.map(conv => {
      try {
        const typingUsers = getTypingUsers(conv.id);
        const unreadCount = getUnreadCount(conv.id);
        return {
          ...conv,
          isTyping: typingUsers.length > 0,
          typingUsers: typingUsers.map(u => u.name).filter(Boolean),
          unread: unreadCount > 0 ? unreadCount : undefined,
          isPinned: pinnedConversations.has(conv.id)
        };
      } catch (error) {
        console.error('Error processing conversation:', conv.id, error);
        return {
          ...conv,
          isTyping: false,
          typingUsers: [],
          isPinned: pinnedConversations.has(conv.id),
          hasError: true
        };
      }
    }).filter(conv => {
      const matchesSearch = 
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === 'unread') {
        return matchesSearch && conv.unread && conv.unread > 0;
      } else if (activeTab === 'groups') {
        return matchesSearch && conv.type === 'group';
      }
      
      return matchesSearch;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [conversations, searchQuery, activeTab, pinnedConversations, getTypingUsers, getUnreadCount]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + getUnreadCount(conv.id), 0);
  }, [conversations, getUnreadCount]);

  if (loading) {
    return (
      <div className="w-80 bg-surface border-r border-theme flex flex-col h-full flex-shrink-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-surface border-r border-theme flex flex-col h-full flex-shrink-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Erreur de chargement</p>
            <p className="text-secondary text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-surface border-r border-theme flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-theme">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Messages</h2>
          <div className="relative">
            <button 
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-secondary" />
            </button>

            {/* Menu déroulant simple */}
            {showNewMenu && (
              <>
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface-elevated border border-theme rounded-lg shadow-lg py-2 z-50">
                  <button 
                    onClick={() => handleNewConversationClick('direct')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-primary font-medium">Nouvelle conversation</p>
                      <p className="text-xs text-secondary">Discuter avec une personne</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleNewConversationClick('group')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                  >
                    <UsersIcon className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-primary font-medium">Créer un groupe</p>
                      <p className="text-xs text-secondary">Discuter avec plusieurs personnes</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('Ajouter des contacts');
                      setShowNewMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-primary font-medium">Ajouter des contacts</p>
                      <p className="text-xs text-secondary">Trouver et ajouter des personnes</p>
                    </div>
                  </button>
                </div>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNewMenu(false)}
                />
              </>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-theme rounded-lg text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Tabs simples */}
        <div className="flex space-x-1 mt-3">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-accent text-white'
                : 'text-secondary hover:bg-surface-elevated hover:text-primary'
            }`}
          >
            Récent
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === 'unread'
                ? 'bg-accent text-white'
                : 'text-secondary hover:bg-surface-elevated hover:text-primary'
            }`}
          >
            Non lus
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-accent text-white'
                : 'text-secondary hover:bg-surface-elevated hover:text-primary'
            }`}
          >
            Groupes
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-secondary" />
              </div>
              <p className="text-secondary mb-2">Aucune conversation trouvée</p>
              <p className="text-secondary text-sm">
                {activeTab === 'unread' ? 'Tous les messages ont été lus' : 
                 activeTab === 'groups' ? 'Aucun groupe de conversation' : 
                 'Essayez de modifier votre recherche'}
              </p>
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleTogglePinClick(conversation.id, e);
              }}
              className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors duration-150 border-b border-theme/30 hover:bg-surface-elevated/50 ${
                selectedConversation === conversation.id ? 'bg-surface-elevated' : ''
              }`}
            >
              {/* Avatar simple */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 relative">
                  {conversation.type === 'group' ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getStatusColor(conversation.status)} rounded-full flex items-center justify-center relative overflow-hidden`}>
                      <span className="text-white font-semibold text-sm">
                        {getInitials(conversation.name)}
                      </span>
                      <div className="absolute inset-0 bg-white/10"></div>
                    </div>
                  )}
                  
                  {/* Status indicator simple */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
                    conversation.isOnline ? 'bg-green-500' : 
                    conversation.status === 'away' ? 'bg-yellow-500' : 
                    conversation.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {/* Pin button simple */}
                    <button
                      onClick={(e) => handleTogglePinClick(conversation.id, e)}
                      className={`p-1 rounded transition-colors ${
                        conversation.isPinned 
                          ? 'text-accent' 
                          : 'text-secondary opacity-0 group-hover:opacity-100 hover:text-primary'
                      }`}
                      title={conversation.isPinned ? 'Désépingler' : 'Épingler'}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    
                    {/* Conversation name */}
                    <p className={`font-medium truncate ${
                      selectedConversation === conversation.id ? 'text-primary' : 'text-primary/90'
                    }`}>
                      {conversation.name}
                    </p>
                  </div>
                  
                  {/* Time */}
                  <span className={`text-xs ${
                    selectedConversation === conversation.id ? 'text-accent' : 'text-secondary'
                  }`}>
                    {conversation.time}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {/* Typing indicator simple */}
                    {conversation.isTyping && (
                      <div className="flex items-center mr-2 flex-shrink-0">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-accent font-medium ml-1.5">
                          {conversation.typingUsers?.length === 1 
                            ? `${conversation.typingUsers[0]} écrit...`
                            : `${conversation.typingUsers?.length || 0} écrivent...`
                          }
                        </span>
                      </div>
                    )}
                    
                    {/* Last message preview */}
                    <p className={`text-sm truncate ${
                      conversation.isTyping ? 'text-accent font-medium' : 
                      selectedConversation === conversation.id ? 'text-secondary' : 'text-secondary/70'
                    }`}>
                      {conversation.isTyping ? '' : conversation.lastMessage}
                    </p>
                  </div>
                  
                  {/* Unread count badge simple */}
                  {conversation.unread && (
                    <span className="ml-2 px-2 py-0.5 bg-accent text-white text-xs font-medium rounded-full min-w-[20px] text-center flex-shrink-0">
                      {conversation.unread > 99 ? '99+' : conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}