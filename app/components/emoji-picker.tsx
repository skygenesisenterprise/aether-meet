'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'] },
  { name: 'Gestes', emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝', '✊', '🤛'] },
  { name: 'Cœurs', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮'] },
  { name: 'Réactions', emojis: ['👍', '👎', '👌', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝', '✊', '🤛', '🤜', '🤝', '🙏', '✍', '💪'] },
  { name: 'Activités', emojis: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎗', '🎟', '🎫', '🎖', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '⚾', '🏀', '🏐', '🏈', '🎱'] },
  { name: 'Objets', emojis: ['📱', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '📽', '🎥', '📺'] },
  { name: 'Symboles', emojis: ['❗', '❓', '❕', '❔', '‼', '⁉', '🔅', '🔆', '〽', '🚸', '🔱', '⚠', '🚸', '🚫', '❌', '⭕', '✅', '☑', '✔', '✖'] },
  { name: 'Drapeaux', emojis: ['🏳', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺'] }
];

const FREQUENT_EMOJIS = ['😀', '😂', '❤️', '👍', '😊', '🎉', '🔥', '😍', '🤔', '👎', '😢', '😮', '👋', '🙏', '💪', '🎯', '✨', '🚀', '💯', '🔝'];

export default function EmojiPicker({ onEmojiSelect, onClose, position }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter emojis based on search
  const filteredEmojis = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return selectedCategory === 0 ? FREQUENT_EMOJIS : EMOJI_CATEGORIES[selectedCategory - 1]?.emojis || [];
    }

    const allEmojis = selectedCategory === 0 
      ? FREQUENT_EMOJIS 
      : EMOJI_CATEGORIES[selectedCategory - 1]?.emojis || [];
    
    return allEmojis.filter(emoji => 
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedCategory]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-surface-elevated border border-theme rounded-lg shadow-2xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '320px',
        maxHeight: '400px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-theme">
        <h3 className="font-medium text-primary">Émojis</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-surface transition-colors"
        >
          <XMarkIcon className="h-4 w-4 text-secondary" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-theme">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un émoji..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-theme rounded-lg text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto p-2 border-b border-theme space-x-1">
        <button
          onClick={() => setSelectedCategory(0)}
          className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 0
              ? 'bg-accent text-white'
              : 'text-secondary hover:bg-surface hover:text-primary'
          }`}
        >
          Fréquents
        </button>
        {EMOJI_CATEGORIES.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(index + 1)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === index + 1
                ? 'bg-accent text-white'
                : 'text-secondary hover:bg-surface hover:text-primary'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: '200px' }}>
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface transition-colors text-lg hover:scale-125"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        {filteredEmojis.length === 0 && (
          <div className="text-center py-8">
            <p className="text-secondary text-sm">Aucun émoji trouvé</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-theme">
        <p className="text-xs text-muted text-center">
          {filteredEmojis.length} émoji{filteredEmojis.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}