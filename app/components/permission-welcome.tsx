'use client';

import React, { useState, useEffect } from 'react';
import {
  MicrophoneIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface PermissionWelcomeProps {
  onPermissionsGranted: () => void;
  onPermissionsSkipped: () => void;
}

export default function PermissionWelcome({ onPermissionsGranted, onPermissionsSkipped }: PermissionWelcomeProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'checking' | 'granted' | 'denied' | 'error'>('idle');

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      setPermissionStatus('checking');
      
      // Check if permissions have already been granted
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      setTimeout(() => onPermissionsGranted(), 1000);
    } catch (error) {
      setPermissionStatus('idle');
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      setTimeout(() => onPermissionsGranted(), 1500);
    } catch (error) {
      setPermissionStatus('denied');
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    onPermissionsSkipped();
  };

  if (permissionStatus === 'checking') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-surface-elevated rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-primary">Vérification des permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'granted') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-surface-elevated rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Permissions accordées !</h3>
            <p className="text-secondary">Vous pouvez maintenant passer des appels audio et vidéo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoCameraIcon className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Bienvenue sur Aether Meet
          </h2>
          <p className="text-secondary">
            Pour profiter pleinement des appels audio et vidéo, nous avons besoin d'accéder à votre microphone et votre caméra.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
            <MicrophoneIcon className="h-6 w-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">Microphone</p>
              <p className="text-sm text-secondary">Pour les appels audio</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
            <VideoCameraIcon className="h-6 w-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">Caméra</p>
              <p className="text-sm text-secondary">Pour les appels vidéo</p>
            </div>
          </div>
        </div>

        {permissionStatus === 'denied' && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Les permissions ont été refusées. Vous pourrez les activer plus tard dans les paramètres de votre navigateur.
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleRequestPermissions}
            disabled={isRequesting}
            className="flex-1 bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRequesting ? 'Demande en cours...' : 'Autoriser l\'accès'}
          </button>
          
          <button
            onClick={handleSkip}
            disabled={isRequesting}
            className="flex-1 bg-surface border border-theme text-primary py-3 px-4 rounded-lg font-medium hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Plus tard
          </button>
        </div>

        <p className="text-xs text-secondary text-center mt-4">
          Vous pourrez modifier ces permissions à tout moment dans les paramètres de votre navigateur.
        </p>
      </div>
    </div>
  );
}