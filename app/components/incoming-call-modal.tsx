'use client';

import React from 'react';
import { useCall } from '../contexts/call-context';
import {
  PhoneIcon,
  VideoCameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface-elevated rounded-2xl p-8 max-w-sm w-full mx-4 border border-theme">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              {incomingCall.participant.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            {incomingCall.participant}
          </h3>
          <p className="text-secondary">
            {incomingCall.type === 'video' ? 'Appel vidéo entrant' : 'Appel audio entrant'}
          </p>
        </div>

        {/* Animation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center space-x-4">
          {/* Reject */}
          <button
            onClick={rejectCall}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          {/* Accept */}
          <button
            onClick={acceptCall}
            className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {incomingCall.type === 'video' ? (
              <VideoCameraIcon className="h-8 w-8" />
            ) : (
              <PhoneIcon className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            Glissez vers le haut pour répondre
          </p>
        </div>
      </div>
    </div>
  );
}