'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

type UserStatus = 'online' | 'busy' | 'away' | 'offline';

interface UserStatusContextType {
  userStatus: UserStatus;
  setUserStatus: (status: UserStatus) => void;
  isOnline: boolean;
  lastSeen?: string;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

interface StatusOption {
  value: UserStatus;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const statusOptions: StatusOption[] = [
  {
    value: 'online',
    label: 'En ligne',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    icon: CheckCircleIcon
  },
  {
    value: 'busy',
    label: 'Occupé',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    icon: XCircleIcon
  },
  {
    value: 'away',
    label: 'Absent',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    icon: ClockIcon
  },
  {
    value: 'offline',
    label: 'Déconnecté',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500',
    icon: WifiIcon
  }
];

interface UserStatusProviderProps {
  children: ReactNode;
}

export function UserStatusProvider({ children }: UserStatusProviderProps) {
  const [userStatus, setUserStatusState] = useState<UserStatus>('online');
  const [lastSeen, setLastSeen] = useState<string>();

  // Load saved status from localStorage
  useEffect(() => {
    const savedStatus = localStorage.getItem('aether-meet-user-status') as UserStatus;
    const savedLastSeen = localStorage.getItem('aether-meet-last-seen');
    
    if (savedStatus && ['online', 'busy', 'away', 'offline'].includes(savedStatus)) {
      setUserStatusState(savedStatus);
    }
    
    if (savedLastSeen) {
      setLastSeen(savedLastSeen);
    }
  }, []);

  // Save status to localStorage when it changes
  const setUserStatus = (status: UserStatus) => {
    setUserStatusState(status);
    localStorage.setItem('aether-meet-user-status', status);
    
    // Update last seen when going offline
    if (status === 'offline') {
      const now = new Date().toLocaleString('fr-FR');
      setLastSeen(now);
      localStorage.setItem('aether-meet-last-seen', now);
    }
    
    // Here you could also sync with a backend service
    console.log(`Status changed to: ${status}`);
  };

  // Auto-away after 5 minutes of inactivity
  useEffect(() => {
    let awayTimeout: NodeJS.Timeout;
    
    const resetAwayTimeout = () => {
      clearTimeout(awayTimeout);
      if (userStatus === 'online' || userStatus === 'busy') {
        awayTimeout = setTimeout(() => {
          setUserStatus('away');
        }, 5 * 60 * 1000); // 5 minutes
      }
    };

    const handleActivity = () => {
      resetAwayTimeout();
      if (userStatus === 'away') {
        setUserStatus('online');
      }
    };

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetAwayTimeout();

    return () => {
      clearTimeout(awayTimeout);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [userStatus]);

  const isOnline = userStatus !== 'offline';

  return (
    <UserStatusContext.Provider value={{
      userStatus,
      setUserStatus,
      isOnline,
      lastSeen
    }}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
}