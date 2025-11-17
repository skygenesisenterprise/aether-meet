'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface FolderItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  adminOnly?: boolean;
  items?: { id: string; label: string; href: string }[];
}

const folderItems: FolderItem[] = [
  {
    id: 'conversations',
    label: 'Discussions',
    icon: ChatBubbleLeftRightIcon,
    href: '/conversations',
    items: [
      { id: 'unread', label: 'Non lus', href: '/conversations/unread' },
      { id: 'channels', label: 'Salons', href: '/conversations/channels' },
      { id: 'direct', label: 'Messages directs', href: '/conversations/direct' },
    ]
  },
  {
    id: 'teams',
    label: 'Espaces de travail',
    icon: UserGroupIcon,
    href: '/teams',
    items: [
      { id: 'active', label: 'Actifs', href: '/teams/active' },
      { id: 'archived', label: 'Archivés', href: '/teams/archived' },
      { id: 'discover', label: 'Découvrir', href: '/teams/discover' },
    ]
  },
  {
    id: 'meetings',
    label: 'Visioconférences',
    icon: CalendarIcon,
    href: '/meetings',
    items: [
      { id: 'today', label: 'Aujourd\'hui', href: '/meetings/today' },
      { id: 'week', label: 'Cette semaine', href: '/meetings/week' },
      { id: 'recordings', label: 'Enregistrements', href: '/meetings/recordings' },
    ]
  },
  {
    id: 'files',
    label: 'Documents',
    icon: DocumentIcon,
    href: '/files',
    items: [
      { id: 'recent', label: 'Récemment modifiés', href: '/files/recent' },
      { id: 'shared', label: 'Partagés avec moi', href: '/files/shared' },
      { id: 'cloud', label: 'Cloud personnel', href: '/files/cloud' },
    ]
  },
  {
    id: 'whiteboard',
    label: 'Tableaux blancs',
    icon: ClipboardDocumentListIcon,
    href: '/whiteboard',
    items: [
      { id: 'active', label: 'Actifs', href: '/whiteboard/active' },
      { id: 'templates', label: 'Modèles', href: '/whiteboard/templates' },
      { id: 'shared', label: 'Partagés', href: '/whiteboard/shared' },
    ]
  },
  {
    id: 'activity',
    label: 'Centre de notifications',
    icon: BellIcon,
    href: '/activity',
    items: [
      { id: 'important', label: 'Important', href: '/activity/important' },
      { id: 'mentions', label: 'Mentions', href: '/activity/mentions' },
      { id: 'all', label: 'Toutes les notifications', href: '/activity/all' },
    ]
  },
  {
    id: 'settings',
    label: 'Préférences',
    icon: Cog6ToothIcon,
    href: '/settings',
    items: [
      { id: 'account', label: 'Compte', href: '/settings/account' },
      { id: 'workspace', label: 'Espace de travail', href: '/settings/workspace' },
      { id: 'notifications', label: 'Notifications', href: '/settings/notifications' },
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: ShieldCheckIcon,
    href: '/admin',
    adminOnly: true,
    items: [
      { id: 'dashboard', label: 'Tableau de bord', href: '/admin/dashboard' },
      { id: 'users', label: 'Gestion des utilisateurs', href: '/admin/users' },
      { id: 'security', label: 'Sécurité', href: '/admin/security' },
    ]
  },
];

interface FolderSectionProps {
  isAdmin?: boolean;
}

export default function FolderSection({ isAdmin = false }: FolderSectionProps) {
  const pathname = usePathname();
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());

  const filteredItems = folderItems.filter(item => !item.adminOnly || isAdmin);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const isFolderActive = (folder: FolderItem) => {
    return pathname === folder.href || 
           (folder.id !== 'home' && pathname.startsWith(folder.href)) ||
           folder.items?.some(item => pathname === item.href);
  };

  return (
    <div className="w-64 bg-surface border-r border-theme flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-theme">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary">Navigation</h2>
          <button className="p-1 rounded hover:bg-surface-elevated transition-colors">
            <PlusIcon className="h-4 w-4 text-secondary" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredItems.map((folder) => {
            const isActive = isFolderActive(folder);
            const isExpanded = expandedFolders.has(folder.id);
            
            return (
              <div key={folder.id} className="mb-2">
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-surface-elevated text-accent border-l-4 border-accent' 
                      : 'text-secondary hover:bg-surface-elevated hover:text-primary'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <folder.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm text-primary">{folder.label}</span>
                  </div>
                  <ChevronRightIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Sub-items */}
                {isExpanded && folder.items && (
                  <div className="ml-6 mt-1 space-y-1">
                    {folder.items.map((item) => {
                      const isItemActive = pathname === item.href;
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          className={`
                            block px-3 py-1.5 text-sm rounded transition-colors
                            ${isItemActive 
                              ? 'bg-surface-elevated text-accent font-medium' 
                              : 'text-secondary hover:bg-surface-elevated hover:text-primary'
                            }
                          `}
                        >
                          {item.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}