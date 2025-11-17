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

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

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
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-secondary" />
            </div>
          </button>

          {/* Menu déroulant compte */}
          {showAccountMenu && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface-elevated border border-theme rounded-lg shadow-lg py-2">
              <div className="px-4 py-3 border-b border-theme">
                <p className="font-medium text-primary">Utilisateur</p>
                <p className="text-sm text-secondary">user@aethermeet.com</p>
              </div>
              
              <div className="py-2">
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors">
                  <UserCircleIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Mon profil</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors">
                  <BellIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Notifications</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors">
                  <Cog6ToothIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Paramètres</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-secondary" />
                  <span className="text-primary">Aide</span>
                </button>
              </div>
              
              <div className="border-t border-theme pt-2">
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-surface transition-colors">
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-red-400" />
                  <span className="text-red-400">Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay pour fermer le menu */}
      {showAccountMenu && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowAccountMenu(false)}
        />
      )}
    </header>
  );
}