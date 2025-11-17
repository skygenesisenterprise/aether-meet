'use client';

import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BellIcon,
  DocumentIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
}

interface MeetingItem {
  id: string;
  title: string;
  time: string;
  participants: number;
}

interface ActivityItem {
  id: string;
  type: 'mention' | 'file' | 'meeting';
  message: string;
  time: string;
}

interface FileItem {
  id: string;
  name: string;
  type: string;
  modified: string;
  size: string;
}

const mockConversations: ConversationItem[] = [
  { id: '1', name: 'Équipe Marketing', lastMessage: 'Le rapport est prêt', time: '10:30', unread: true },
  { id: '2', name: 'Jean Dupont', lastMessage: 'Merci pour ton aide', time: '09:45' },
  { id: '3', name: 'Projet Alpha', lastMessage: 'Réunion à 14h', time: 'Hier' },
];

const mockMeetings: MeetingItem[] = [
  { id: '1', title: 'Réunion d\'équipe', time: '14:00', participants: 8 },
  { id: '2', title: 'Présentation client', time: '16:30', participants: 4 },
  { id: '3', title: 'Review technique', time: 'Demain 10:00', participants: 6 },
];

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'mention', message: 'Marie vous a mentionné dans #général', time: 'Il y a 5 min' },
  { id: '2', type: 'file', message: 'Nouveau fichier partagé: budget_Q4.xlsx', time: 'Il y a 1h' },
  { id: '3', type: 'meeting', message: 'Rappel: Réunion planning dans 30 min', time: 'Il y a 2h' },
];

const mockFiles: FileItem[] = [
  { id: '1', name: 'Rapport_annuel.pdf', type: 'PDF', modified: 'Il y a 2h', size: '2.4 MB' },
  { id: '2', name: 'Presentation_projet.pptx', type: 'PowerPoint', modified: 'Hier', size: '5.1 MB' },
  { id: '3', name: 'Budget_2024.xlsx', type: 'Excel', modified: 'Il y a 3 jours', size: '1.2 MB' },
];

export default function HomePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tableau de bord</h1>
        <p className="text-secondary">Bienvenue ! Voici un aperçu de votre activité récente.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Dernières conversations */}
        <div className="bg-surface-elevated rounded-lg border border-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-accent" />
              Dernières conversations
            </h2>
            <a href="/conversations" className="text-sm text-accent hover:text-accent-hover">Voir tout</a>
          </div>
          <div className="space-y-3">
            {mockConversations.map((conv) => (
              <div key={conv.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-primary truncate">{conv.name}</p>
                    <span className="text-xs text-secondary">{conv.time}</span>
                  </div>
                  <p className="text-sm text-secondary truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread && (
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Réunions à venir */}
        <div className="bg-surface-elevated rounded-lg border border-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-green-400" />
              Réunions à venir
            </h2>
            <a href="/meetings" className="text-sm text-accent hover:text-accent-hover">Voir tout</a>
          </div>
          <div className="space-y-3">
            {mockMeetings.map((meeting) => (
              <div key={meeting.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-primary">{meeting.title}</p>
                    <div className="flex items-center mt-1 text-sm text-secondary">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {meeting.time}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-secondary">
                    <span className="mr-1">{meeting.participants}</span>
                    <span>participants</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-surface-elevated rounded-lg border border-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-orange-400" />
              Activités récentes
            </h2>
            <a href="/activity" className="text-sm text-accent hover:text-accent-hover">Voir tout</a>
          </div>
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-2 rounded hover:bg-surface cursor-pointer">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${activity.type === 'mention' ? 'bg-blue-900/30' : 
                    activity.type === 'file' ? 'bg-green-900/30' : 'bg-orange-900/30'}
                `}>
                  {activity.type === 'mention' && <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-400" />}
                  {activity.type === 'file' && <DocumentIcon className="h-4 w-4 text-green-400" />}
                  {activity.type === 'meeting' && <CalendarIcon className="h-4 w-4 text-orange-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-primary">{activity.message}</p>
                  <p className="text-xs text-secondary mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers fichiers consultés */}
        <div className="bg-surface-elevated rounded-lg border border-theme p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2 text-purple-400" />
              Derniers fichiers
            </h2>
            <a href="/files" className="text-sm text-accent hover:text-accent-hover">Voir tout</a>
          </div>
          <div className="space-y-3">
            {mockFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-2 rounded hover:bg-surface cursor-pointer">
                <div className="w-10 h-10 bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <DocumentIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">{file.name}</p>
                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span>{file.type}</span>
                    <span>{file.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages importants/épinglés */}
        <div className="bg-surface-elevated rounded-lg border border-theme p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <StarIcon className="h-5 w-5 mr-2 text-yellow-400" />
              Messages épinglés
            </h2>
            <a href="/conversations?pinned=true" className="text-sm text-accent hover:text-accent-hover">Voir tout</a>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-primary mb-1">📌 Important : Lancement projet Q1</p>
                  <p className="text-sm text-secondary mb-2">
                    Le lancement officiel du projet est prévu pour le 15 janvier. 
                    Toutes les équipes doivent finaliser leurs livrables d'ici le 10.
                  </p>
                  <div className="flex items-center text-xs text-muted">
                    <span>Posté par Directeur dans #annonces</span>
                    <span className="mx-2">•</span>
                    <span>Il y a 2 jours</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-primary mb-1">📋 Rétrospective Sprint 23</p>
                  <p className="text-sm text-secondary mb-2">
                    Merci à tous pour votre participation ! Les points d'amélioration 
                    seront discutés lors de la prochaine réunion.
                  </p>
                  <div className="flex items-center text-xs text-muted">
                    <span>Posté par Scrum Master dans #équipe-développement</span>
                    <span className="mx-2">•</span>
                    <span>Il y a 3 jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}