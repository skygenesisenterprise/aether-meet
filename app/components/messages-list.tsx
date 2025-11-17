'use client';

import React, { useState } from 'react';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useTyping } from '../contexts/typing-context';
import { useReadStatus } from '../contexts/read-status-context';
import { useUserStatus } from '../contexts/user-status-context';

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
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Équipe Marketing',
    lastMessage: 'Sophie: Le rapport est prêt pour review',
    time: '10:30',
    unread: 3,
    type: 'group',
    isOnline: true,
    isTyping: true
  },
  {
    id: '2',
    name: 'Jean Dupont',
    lastMessage: 'Merci pour ton aide !',
    time: '09:45',
    type: 'direct',
    isOnline: true,
    status: 'online'
  },
  {
    id: '3',
    name: 'Projet Alpha',
    lastMessage: 'Réunion à 14h aujourd\'hui',
    time: 'Hier',
    unread: 1,
    type: 'group',
    isOnline: false
  },
  {
    id: '4',
    name: 'Marie Laurent',
    lastMessage: 'As-tu vu les derniers documents ?',
    time: 'Hier',
    type: 'direct',
    status: 'away',
    lastSeen: 'Il y a 2h'
  },
  {
    id: '5',
    name: 'Support Technique',
    lastMessage: 'Ticket #1234 résolu',
    time: 'Lun',
    type: 'group',
    isOnline: false
  },
  {
    id: '6',
    name: 'Thomas Bernard',
    lastMessage: 'À plus tard !',
    time: 'Dim',
    type: 'direct',
    status: 'offline',
    lastSeen: 'Il y a 3 jours'
  },
];

interface MessagesListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  pinnedConversations: Set<string>;
}

export default function MessagesList({ selectedConversation, onSelectConversation, pinnedConversations }: MessagesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'unread' | 'groups'>('recent');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const { getTypingUsers } = useTyping();
  const { getUnreadCount, markConversationAsRead } = useReadStatus();
  const { userStatus, isOnline, lastSeen } = useUserStatus();

  const filteredConversations = React.useMemo(() => {
    return mockConversations.map(conv => {
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
        console.warn('Error getting typing users for conversation:', conv.id, error);
        return {
          ...conv,
          isTyping: false,
          typingUsers: [],
          isPinned: pinnedConversations.has(conv.id)
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
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [searchQuery, getTypingUsers, getUnreadCount, activeTab, pinnedConversations]);

  return (
    <div className="w-80 bg-surface border-r border-theme flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-theme">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Messages</h2>
          <div className="relative">
            <button 
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-secondary" />
            </button>

            {/* Menu déroulant */}
            {showNewMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-surface-elevated border border-theme rounded-lg shadow-lg py-2 z-50">
                <button 
                  onClick={() => {
                    console.log('Nouvelle conversation');
                    setShowNewMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-primary font-medium">Nouvelle conversation</p>
                    <p className="text-xs text-secondary">Discuter avec une personne</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    console.log('Nouveau groupe');
                    setShowNewMenu(false);
                  }}
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
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-theme rounded-lg text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Tabs */}
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
            {/* Badge for total unread count */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
              {mockConversations.reduce((total, conv) => total + getUnreadCount(conv.id), 0)}
            </span>
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
      <div className="flex-1 overflow-y-auto relative">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => {
              onSelectConversation(conversation.id);
              // Mark conversation as read when selected
              markConversationAsRead(conversation.id);
            }}
            className={`flex items-start space-x-3 p-4 hover:bg-surface-elevated cursor-pointer transition-all duration-200 border-b border-theme ${
              selectedConversation === conversation.id 
                ? 'bg-surface-elevated border-l-4 border-l-accent' 
                : conversation.isPinned
                  ? 'bg-blue-50/30 dark:bg-blue-900/10 hover:translate-x-1'
                  : 'hover:translate-x-1'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-surface-elevated rounded-full flex items-center justify-center">
                {conversation.type === 'group' ? (
                  <UserGroupIcon className="h-6 w-6 text-secondary" />
                ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    conversation.status === 'online' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                    conversation.status === 'away' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    conversation.status === 'busy' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    <span className="text-white font-medium">
                      {conversation.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {conversation.isPinned && (
                    <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                  <p className="font-medium text-primary truncate">{conversation.name}</p>
                </div>
                <span className="text-xs text-secondary">{conversation.time}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center flex-1 min-w-0">
                  {conversation.isTyping && (
                    <div className="flex items-center mr-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        {conversation.typingUsers?.length === 1 
                          ? `${conversation.typingUsers[0]}`
                          : `${conversation.typingUsers?.length || 0}`
                        }
                      </span>
                    </div>
                  )}
                  <p className={`text-sm truncate ${conversation.isTyping ? 'text-gray-500 italic' : 'text-secondary'}`}>
                    {conversation.isTyping ? 'écrit...' : conversation.lastMessage}
                  </p>
                </div>
                <div className="flex items-center ml-2 space-x-2">
                  {conversation.unread && (
                    <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full min-w-[20px] text-center font-medium">
                      {conversation.unread}
                    </span>
                  )}
                  {conversation.status === 'away' && !conversation.unread && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                  {conversation.status === 'busy' && !conversation.unread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
              {conversation.lastSeen && conversation.status !== 'online' && (
                <p className="text-xs text-muted mt-1">{conversation.lastSeen}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overlay pour fermer le menu */}
      {showNewMenu && (
        <div 
          className="absolute inset-0 bg-transparent z-40"
          onClick={() => setShowNewMenu(false)}
        />
      )}
    </div>
  );
}