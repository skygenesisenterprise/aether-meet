'use client';

import React from 'react';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { id: 'home', label: 'Accueil', icon: HomeIcon, href: '/' },
  { id: 'conversations', label: 'Conversations', icon: ChatBubbleLeftRightIcon, href: '/conversations' },
  { id: 'teams', label: 'Équipes', icon: UserGroupIcon, href: '/teams' },
  { id: 'meetings', label: 'Réunions', icon: CalendarIcon, href: '/meetings' },
  { id: 'files', label: 'Fichiers', icon: DocumentIcon, href: '/files' },
  { id: 'whiteboard', label: 'Tableau/Notes', icon: ClipboardDocumentListIcon, href: '/whiteboard' },
  { id: 'activity', label: 'Activité', icon: BellIcon, href: '/activity' },
  { id: 'settings', label: 'Paramètres', icon: Cog6ToothIcon, href: '/settings' },
  { id: 'admin', label: 'Administration', icon: ShieldCheckIcon, href: '/admin', adminOnly: true },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const filteredItems = sidebarItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="w-16 bg-surface border-r border-theme flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-theme">
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AM</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
                         (item.id !== 'home' && pathname.startsWith(item.href));
          
          return (
            <a
              key={item.id}
              href={item.href}
              className={`
                flex justify-center px-3 py-2 transition-colors
                ${isActive 
                  ? 'bg-surface-elevated text-accent border-l-4 border-accent' 
                  : 'text-secondary hover:bg-surface-elevated hover:text-primary'
                }
              `}
              title={item.label}
            >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
            </a>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-theme">
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center">
            <span className="text-secondary text-sm font-medium">U</span>
          </div>
        </div>
      </div>
    </div>
  );
}