'use client';

import React, { useState, useEffect } from 'react';
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

const mockConversations: Conversation[] = [
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
  },
  {
    id: '4',
    name: 'Support Technique',
    lastMessage: 'Votre ticket a été résolu',
    time: 'Lun',
    unread: 1,
    type: 'direct',
    status: 'offline'
  },
  {
    id: '5',
    name: 'Département Marketing',
    lastMessage: 'Marie: Nouvelles campagnes à valider',
    time: 'Dim',
    type: 'group',
    status: 'online'
  }
];

interface MessagesListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  conversations?: Conversation[];
  dataSource?: 'json' | 'api' | 'props';
  apiUrl?: string;
  jsonPath?: string;
  pinnedConversations?: Set<string>;
  onNewConversation?: (type: 'direct' | 'group') => void;
  onSearch?: (query: string) => void;
  showTabs?: boolean;
  compact?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
}

export default function MessagesList({ 
  selectedConversation, 
  onSelectConversation,
  conversations: propConversations,
  dataSource = 'json',
  apiUrl = '/api/conversations',
  jsonPath = '/conversations.json',
  pinnedConversations = new Set(),
  onNewConversation,
  onSearch,
  showTabs = true,
  compact = false,
  loadingComponent,
  errorComponent
}: MessagesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'unread' | 'groups'>('recent');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [internalPinned, setInternalPinned] = useState<Set<string>>(new Set(['1', '2']));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { getTypingUsers } = useTyping();
  const { getUnreadCount, markConversationAsRead } = useReadStatus();
  
  // Utiliser les props si fournies, sinon utiliser l'état interne
  const currentPinnedConversations = pinnedConversations.size > 0 ? pinnedConversations : internalPinned;

  // Charger les conversations selon la source de données
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        let data: Conversation[];
        
        if (dataSource === 'props' && propConversations) {
          // Utiliser les conversations fournies en props
          data = propConversations;
        } else if (dataSource === 'api') {
          // Charger depuis une API
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
          }
          data = await response.json();
        } else {
          // Charger depuis le fichier JSON (défaut)
          const response = await fetch(jsonPath);
          if (!response.ok) {
            throw new Error(`Fichier JSON non trouvé: ${jsonPath}`);
          }
          data = await response.json();
        }
        
        setConversations(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('Erreur lors du chargement des conversations:', error);
        setLoadError(errorMessage);
        
        // Utiliser les données mockées en fallback
        setConversations(mockConversations);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [dataSource, propConversations, apiUrl, jsonPath]);

  // Gérer le toggle d'épinglage
  const handleTogglePin = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedConversations.size > 0) {
      // Si les pinned sont gérés par le parent, on ne fait rien (le parent gère)
      return;
    } else {
      // Gestion interne
      setInternalPinned(prev => {
        const newSet = new Set(prev);
        if (newSet.has(conversationId)) {
          newSet.delete(conversationId);
        } else {
          newSet.add(conversationId);
        }
        return newSet;
      });
    }
  };

  // Gérer la création de nouvelle conversation
  const handleNewConversation = (type: 'direct' | 'group') => {
    if (onNewConversation) {
      onNewConversation(type);
    } else {
      console.log(`Création d'une nouvelle conversation ${type}`);
      // Logique interne si nécessaire
    }
    setShowNewMenu(false);
  };

  // Gérer le changement de recherche
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Helper pour générer les initiales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Helper pour obtenir la couleur de statut
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'from-green-400 to-green-600';
      case 'away': return 'from-yellow-400 to-orange-500';
      case 'busy': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Helper pour obtenir la couleur de fond selon l'état
  const getConversationBg = (conversation: any) => {
    if (conversation.hasError) return 'bg-red-50/30 dark:bg-red-900/10';
    if (conversation.isPinned) return 'bg-blue-50/30 dark:bg-blue-900/10';
    if (selectedConversation === conversation.id) return 'bg-surface-elevated';
    return 'hover:bg-surface-elevated/50';
  };

  const filteredConversations = React.useMemo(() => {
    setContextError(null);
    return conversations.map(conv => {
      try {
        const typingUsers = getTypingUsers(conv.id);
        const unreadCount = getUnreadCount(conv.id);
        return {
          ...conv,
          isTyping: typingUsers.length > 0,
          typingUsers: typingUsers.map(u => u.name).filter(Boolean),
          unread: unreadCount > 0 ? unreadCount : undefined,
          isPinned: currentPinnedConversations.has(conv.id)
        };
      } catch (error) {
        const errorMessage = `Erreur lors du chargement de la conversation "${conv.name}"`;
        console.error('Error getting conversation data:', conv.id, error);
        setContextError(errorMessage);
        return {
          ...conv,
          isTyping: false,
          typingUsers: [],
          isPinned: currentPinnedConversations.has(conv.id),
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
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [searchQuery, getTypingUsers, getUnreadCount, activeTab, currentPinnedConversations, conversations]);

  // Afficher le composant de chargement personnalisé
  if (isLoading) {
    return (
      <div className="w-80 bg-surface border-r-4 border-theme flex flex-col h-full">
        {loadingComponent || (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des conversations...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Afficher le composant d'erreur personnalisé
  if (loadError && errorComponent) {
    return (
      <div className="w-80 bg-surface border-r-4 border-theme flex flex-col h-full">
        {errorComponent(loadError)}
      </div>
    );
  }

  return (
    <div className="w-80 bg-surface border-r-4 border-theme flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-theme">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary text-left">Messages</h2>
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
                    onClick={() => handleNewConversation('direct')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-secondary" />
                    <div className="text-left">
                      <p className="text-primary font-medium text-left">Nouvelle conversation</p>
                      <p className="text-xs text-secondary text-left">Discuter avec une personne</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleNewConversation('group')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-surface transition-colors"
                  >
                    <UsersIcon className="h-5 w-5 text-secondary" />
                    <div className="text-left">
                      <p className="text-primary font-medium text-left">Créer un groupe</p>
                      <p className="text-xs text-secondary text-left">Discuter avec plusieurs personnes</p>
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
                    <div className="text-left">
                      <p className="text-primary font-medium text-left">Ajouter des contacts</p>
                      <p className="text-xs text-secondary text-left">Trouver et ajouter des personnes</p>
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-theme rounded-lg text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-left"
          />
        </div>

        {/* Tabs */}
        {showTabs && (
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
                {conversations.reduce((total, conv) => total + getUnreadCount(conv.id), 0)}
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
        )}
      </div>

      {/* Error Banner */}
      {contextError && (
        <div className="mx-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">Erreur de chargement</p>
              <p className="text-xs text-red-600 dark:text-red-300">{contextError}</p>
            </div>
            <button
              onClick={() => setContextError(null)}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Fermer"
            >
              <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto relative min-h-0">
        {filteredConversations.map((conversation) => (
           <div
             key={conversation.id}
             onClick={() => {
               onSelectConversation(conversation.id);
               // Mark conversation as read when selected
               markConversationAsRead(conversation.id);
             }}
             onContextMenu={(e) => {
               e.preventDefault();
               handleTogglePin(conversation.id, e);
             }}
              className={`flex items-start space-x-3 ${compact ? 'p-3' : 'p-4'} cursor-pointer transition-all duration-200 border-b border-theme/50 group relative ${
                selectedConversation === conversation.id 
                  ? 'bg-surface-elevated border-l-4 border-l-accent shadow-sm' 
                  : getConversationBg(conversation)
              } hover:shadow-sm hover:border-theme/80`}
           >
             {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} relative`}>
                  {conversation.type === 'group' ? (
                    <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-sm`}>
                      <UserGroupIcon className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
                    </div>
                  ) : (
                   <div className={`w-full h-full bg-gradient-to-br ${getStatusColor(conversation.status)} rounded-full flex items-center justify-center shadow-sm relative overflow-hidden`}>
                     <span className="text-white font-semibold text-sm">
                       {getInitials(conversation.name)}
                     </span>
                     {/* Subtle pattern overlay */}
                     <div className="absolute inset-0 bg-white/10"></div>
                   </div>
                 )}
                 {/* Status indicator */}
                 <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-surface shadow-sm ${
                   conversation.isOnline ? 'bg-green-500' : 
                   conversation.status === 'away' ? 'bg-yellow-500' : 
                   conversation.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                 }`}>
                   {conversation.isOnline && (
                     <div className="w-full h-full rounded-full bg-green-500 animate-ping"></div>
                   )}
                 </div>
               </div>
             </div>

             {/* Content */}
             <div className="flex-1 min-w-0">
               {/* Header with name and actions */}
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {/* Pin button - always visible for pinned, on hover for others */}
                    <button
                      onClick={(e) => handleTogglePin(conversation.id, e)}
                      className={`p-1 rounded-full transition-all duration-200 ${
                        conversation.isPinned 
                          ? 'text-accent bg-accent/10' 
                          : 'text-secondary opacity-0 group-hover:opacity-100 hover:bg-surface-elevated'
                      }`}
                      title={conversation.isPinned ? 'Désépingler' : 'Épingler'}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    
                    {/* Error indicator */}
                    {conversation.hasError && (
                      <div className="p-1 rounded-full bg-red-100">
                        <svg className="h-3.5 w-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Conversation name */}
                    <p className={`font-semibold truncate text-left ${
                      conversation.hasError ? 'text-red-600 dark:text-red-400' : 
                      selectedConversation === conversation.id ? 'text-primary' : 'text-primary/90'
                    }`}>
                      {conversation.name}
                    </p>
                  </div>
                  
                  {/* Time */}
                  <span className={`text-xs font-medium ${
                    selectedConversation === conversation.id ? 'text-accent' : 'text-secondary/70'
                  }`}>
                    {conversation.time}
                  </span>
               </div>
               
               {/* Message preview and indicators */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center flex-1 min-w-0">
                   {/* Typing indicator */}
                   {conversation.isTyping && (
                     <div className="flex items-center mr-2 flex-shrink-0">
                       <div className="flex space-x-0.5">
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
                   <p className={`text-sm truncate text-left ${
                     conversation.isTyping ? 'text-accent font-medium' : 
                     selectedConversation === conversation.id ? 'text-secondary/80' : 'text-secondary/60'
                   }`}>
                     {conversation.isTyping ? '' : conversation.lastMessage}
                   </p>
                 </div>
                 
                 {/* Right side indicators */}
                 <div className="flex items-center ml-2 space-x-1.5 flex-shrink-0">
                   {/* Unread count badge */}
                   {conversation.unread && (
                     <span className="px-2 py-0.5 bg-accent text-white text-xs font-semibold rounded-full min-w-[20px] text-center shadow-sm">
                       {conversation.unread > 99 ? '99+' : conversation.unread}
                     </span>
                   )}
                   
                   {/* Status dots for offline/away/busy */}
                   {!conversation.isOnline && conversation.status && conversation.status !== 'online' && (
                     <div className={`w-2 h-2 rounded-full ${
                       conversation.status === 'away' ? 'bg-yellow-500' : 
                       conversation.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                     }`}></div>
                   )}
                 </div>
               </div>
               
               {/* Last seen info */}
               {conversation.lastSeen && conversation.status !== 'online' && !conversation.isTyping && (
                 <p className="text-xs text-secondary/50 mt-1 italic text-left">{conversation.lastSeen}</p>
               )}
             </div>
          </div>
        ))}
        {/* Espace vide pour étendre la liste jusqu'en bas */}
        <div className="flex-1 border-b border-theme min-h-0"></div>
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