'use client';

import React from 'react';
import {
  MessageCircle,
  Calendar,
  Bell,
  FileText,
  Star,
  Clock,
  Users,
  User,
  Rocket
} from 'lucide-react';

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  avatar?: string;
  avatarIcon?: React.ReactNode;
}

interface MeetingItem {
  id: string;
  title: string;
  time: string;
  participants: number;
  progress?: number;
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
  { id: '1', name: 'Équipe Marketing', lastMessage: 'Le rapport est prêt', time: '10:30', unread: true, avatarIcon: <Users className="h-6 w-6 text-accent" /> },
  { id: '2', name: 'Jean Dupont', lastMessage: 'Merci pour ton aide', time: '09:45', avatarIcon: <User className="h-6 w-6 text-blue-400" /> },
  { id: '3', name: 'Projet Alpha', lastMessage: 'Réunion à 14h', time: 'Hier', avatarIcon: <Rocket className="h-6 w-6 text-purple-400" /> },
];

const mockMeetings: MeetingItem[] = [
  { id: '1', title: 'Réunion d&apos;équipe', time: '14:00', participants: 8, progress: 75 },
  { id: '2', title: 'Présentation client', time: '16:30', participants: 4, progress: 30 },
  { id: '3', title: 'Review technique', time: 'Demain 10:00', participants: 6, progress: 0 },
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
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";
  
  return (
    <div className="h-screen bg-gradient-to-br from-surface via-surface to-surface-elevated overflow-hidden flex flex-col">
      <div className="p-6 w-full flex-1 flex flex-col overflow-hidden">
        {/* Header moderne */}
        <div className="mb-3 animate-fadeIn flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2 bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
                {greeting} ! 👋
              </h1>
              <p className="text-secondary text-lg">
                Voici votre aperçu du jour - {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-3 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-1 py-0.5 rounded-full">+12%</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">24</h3>
            <p className="text-xs text-secondary">Messages aujourd&apos;hui</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-3 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-xs text-green-400 bg-green-900/30 px-1 py-0.5 rounded-full">3</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">3</h3>
            <p className="text-xs text-secondary">Réunions aujourd&apos;hui</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-xl p-3 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-1 py-0.5 rounded-full">Actif</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">8</h3>
            <p className="text-xs text-secondary">Équipes actives</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/50 rounded-xl p-3 hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-orange-400" />
              </div>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-1 py-0.5 rounded-full">+5</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">12</h3>
            <p className="text-xs text-secondary">Fichiers partagés</p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 auto-rows-min flex-1 overflow-hidden">
          
          {/* Dernières conversations - Modernisé */}
          <div className="bg-surface-elevated rounded-xl border border-theme p-3 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-primary flex items-center">
                <MessageCircle className="h-4 w-4 mr-2 text-accent" />
                Dernières conversations
              </h2>
              <a href="/conversations" className="text-xs text-accent hover:text-accent-hover transition-colors">Voir tout</a>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {mockConversations.map((conv) => (
                <div key={conv.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-full flex items-center justify-start pl-2 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {conv.avatarIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-primary text-xs truncate">{conv.name}</p>
                      <span className="text-xs text-secondary">{conv.time}</span>
                    </div>
                    <p className="text-xs text-secondary truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Réunions à venir - Amélioré */}
          <div className="bg-surface-elevated rounded-xl border border-theme p-3 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-primary flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-green-400" />
                Réunions à venir
              </h2>
              <a href="/meetings" className="text-xs text-accent hover:text-accent-hover transition-colors">Voir tout</a>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {mockMeetings.map((meeting) => (
                <div key={meeting.id} className="p-2 border border-gray-700/50 rounded-lg hover:bg-surface transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-primary text-xs mb-1">{meeting.title}</p>
                      <div className="flex items-center text-xs text-secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {meeting.time}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-secondary">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{meeting.participants}</span>
                    </div>
                  </div>
                  {meeting.progress !== undefined && meeting.progress > 0 && (
                    <div className="w-full bg-gray-700/50 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${meeting.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activités récentes - Modernisé */}
          <div className="bg-surface-elevated rounded-xl border border-theme p-3 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-primary flex items-center">
                <Bell className="h-4 w-4 mr-2 text-orange-400" />
                Activités récentes
              </h2>
              <a href="/activity" className="text-xs text-accent hover:text-accent-hover transition-colors">Voir tout</a>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-start pl-1 flex-shrink-0
                    ${activity.type === 'mention' ? 'bg-blue-900/30' : 
                      activity.type === 'file' ? 'bg-green-900/30' : 'bg-orange-900/30'}
                  `}>
                    {activity.type === 'mention' && <MessageCircle className="h-3 w-3 text-blue-400" />}
                    {activity.type === 'file' && <FileText className="h-3 w-3 text-green-400" />}
                    {activity.type === 'meeting' && <Calendar className="h-3 w-3 text-orange-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-primary">{activity.message}</p>
                    <p className="text-xs text-secondary mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derniers fichiers consultés - Modernisé */}
          <div className="bg-surface-elevated rounded-xl border border-theme p-3 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-primary flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-400" />
                Derniers fichiers
              </h2>
              <a href="/files" className="text-xs text-accent hover:text-accent-hover transition-colors">Voir tout</a>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {mockFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer group">
                  <div className="w-6 h-6 bg-purple-900/30 rounded-lg flex items-center justify-start pl-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="h-3 w-3 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-xs truncate">{file.name}</p>
                    <div className="flex items-center justify-between text-xs text-secondary mt-1">
                      <span>{file.type}</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages importants/épinglés - Modernisé */}
          <div className="bg-surface-elevated rounded-xl border border-theme p-3 hover:shadow-lg transition-all duration-300 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-semibold text-primary flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                Messages épinglés
              </h2>
              <a href="/conversations?pinned=true" className="text-xs text-accent hover:text-accent-hover transition-colors">Voir tout</a>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="p-2 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 rounded-lg hover:from-yellow-900/30 hover:to-orange-900/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-primary mb-1 flex items-center text-xs">
                      <span className="mr-1">📌</span>
                      Important : Lancement projet Q1
                    </p>
                    <p className="text-xs text-secondary mb-2">
                      Le lancement officiel du projet est prévu pour le 15 janvier. 
                      Toutes les équipes doivent finaliser leurs livrables d&apos;ici le 10.
                    </p>
                    <div className="flex items-center text-xs text-muted">
                      <span>Posté par Directeur dans #annonces</span>
                      <span className="mx-1">•</span>
                      <span>Il y a 2 jours</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/50 rounded-lg hover:from-blue-900/30 hover:to-cyan-900/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-primary mb-1 flex items-center text-xs">
                      <span className="mr-1">📋</span>
                      Rétrospective Sprint 23
                    </p>
                    <p className="text-xs text-secondary mb-2">
                      Merci à tous pour votre participation ! Les points d&apos;amélioration 
                      seront discutés lors de la prochaine réunion.
                    </p>
                    <div className="flex items-center text-xs text-muted">
                      <span>Posté par Scrum Master dans #équipe-développement</span>
                      <span className="mx-1">•</span>
                      <span>Il y a 3 jours</span>
                    </div>
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