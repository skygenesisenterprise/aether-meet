'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  QuestionMarkCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useUserStatus, statusOptions } from '../contexts/user-status-context';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { userStatus, setUserStatus, isOnline, lastSeen } = useUserStatus();

  const currentStatus = statusOptions.find(option => option.value === userStatus) || statusOptions[0];

  // Action handlers
  const handleProfileClick = () => {
    console.log('Navigation vers le profil');
    setShowAccountMenu(false);
    // TODO: Navigate to profile page
    // window.location.href = '/profile';
  };

  const handleNotificationsClick = () => {
    console.log('Ouverture du panneau de notifications');
    setShowAccountMenu(false);
    // TODO: Open notifications panel
    // Could open a modal or navigate to /notifications
  };

  const handleSettingsClick = () => {
    console.log('Navigation vers les paramètres');
    setShowAccountMenu(false);
    // TODO: Navigate to settings page
    // window.location.href = '/settings';
  };

  const handleHelpClick = () => {
    console.log('Ouverture de l\'aide');
    setShowAccountMenu(false);
    // TODO: Open help modal or navigate to help page
    // Could open a modal with FAQ or navigate to /help
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      console.log('Déconnexion en cours...');
      setShowAccountMenu(false);
      
      // TODO: Implement complete logout logic
      // 1. Clear user session/token
      // 2. Clear sensitive localStorage data
      // 3. Navigate to login page
      // localStorage.removeItem('auth-token');
      // localStorage.removeItem('user-data');
      // window.location.href = '/login';
      
      // For now, just show a message
      alert('Fonctionnalité de déconnexion à implémenter');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recherche:', searchQuery);
  };

  return (
    <header className="h-14 bg-surface border-b border-theme flex items-center px-4 relative z-50">
      {/* Espace vide à gauche */}
      <div className="w-16">
        {/* Espace pour équilibrer avec l'icône compte à droite */}
      </div>

      {/* Barre de recherche centrale */}
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des messages, des fichiers, des personnes..."
              className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-theme rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </form>
      </div>

      {/* Compte à droite */}
      <div className="flex items-center">
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">JD</span>
              </div>
              {/* Status indicator */}
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${currentStatus.bgColor} rounded-full border-2 border-surface`}></div>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-primary">John Doe</p>
              <p className="text-xs text-secondary">{currentStatus.label}</p>
            </div>
          </button>

          {/* Menu déroulant compte */}
          {showAccountMenu && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-surface-elevated border border-theme rounded-lg shadow-lg py-2">
              {/* User info with status */}
              <div className="px-4 py-3 border-b border-theme">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">JD</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${currentStatus.bgColor} rounded-full border-2 border-surface-elevated`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">John Doe</p>
                    <p className="text-sm text-secondary">john.doe@aethermeet.com</p>
                  </div>
                </div>
                
                {/* Status selector */}
                <div className="mt-3">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <currentStatus.icon className={`h-4 w-4 ${currentStatus.color}`} />
                      <span className="text-sm text-primary">{currentStatus.label}</span>
                    </div>
                    <svg className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Status dropdown */}
                  {showStatusMenu && (
                    <div className="absolute left-4 right-4 mt-1 bg-surface border border-theme rounded-lg shadow-lg py-1 z-10">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setUserStatus(option.value);
                            setShowStatusMenu(false);
                            // Here you could also sync with a backend service
                            console.log(`Status changed to: ${option.label}`);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-surface transition-colors"
                        >
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          <span className="text-sm text-primary">{option.label}</span>
                          {userStatus === option.value && (
                            <svg className="h-4 w-4 text-accent ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="py-2">
                <button 
                  onClick={handleProfileClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Mon profil</span>
                </button>
                
                <button 
                  onClick={handleNotificationsClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors"
                >
                  <BellIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Notifications</span>
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <button 
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Paramètres</span>
                </button>
                
                <button 
                  onClick={handleHelpClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors"
                >
                  <QuestionMarkCircleIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Aide</span>
                </button>
              </div>
              
              <div className="border-t border-theme pt-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-red-400" />
                  <span className="text-red-400">Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay pour fermer les menus */}
      {(showAccountMenu || showStatusMenu) && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => {
            setShowAccountMenu(false);
            setShowStatusMenu(false);
          }}
        />
      )}
    </header>
  );
}