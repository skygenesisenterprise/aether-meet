'use client';

import React from 'react';
import {
  Home,
  MessageCircle,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Bell,
  Settings,
  Shield
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { id: 'home', label: 'Accueil', icon: Home, href: '/' },
  { id: 'conversations', label: 'Conversations', icon: MessageCircle, href: '/conversations' },
  { id: 'teams', label: 'Équipes', icon: Users, href: '/teams' },
  { id: 'meetings', label: 'Réunions', icon: Calendar, href: '/meetings' },
  { id: 'files', label: 'Fichiers', icon: FileText, href: '/files' },
  { id: 'whiteboard', label: 'Tableau/Notes', icon: ClipboardList, href: '/whiteboard' },
  { id: 'activity', label: 'Activité', icon: Bell, href: '/activity' },
  { id: 'settings', label: 'Paramètres', icon: Settings, href: '/settings' },
  { id: 'admin', label: 'Administration', icon: Shield, href: '/admin', adminOnly: true },
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
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer">
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
                relative flex justify-center px-3 py-2 mx-2 rounded-lg transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-accent/10 text-accent shadow-sm scale-105' 
                  : 'text-secondary hover:bg-surface-elevated hover:text-primary hover:scale-105'
                }
              `}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full transition-all duration-300"></div>
              )}
              <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-accent scale-110' : 'hover:scale-110'}`} />
            </a>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-theme">
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-accent hover:text-white cursor-pointer">
            <span className="text-secondary text-sm font-medium transition-colors duration-300">U</span>
          </div>
        </div>
      </div>
    </div>
  );
}