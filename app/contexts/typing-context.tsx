'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface TypingUser {
  userId: string;
  name: string;
  conversationId: string;
  timestamp: number;
}

interface TypingContextType {
  typingUsers: TypingUser[];
  startTyping: (userId: string, name: string, conversationId: string) => void;
  stopTyping: (userId: string, conversationId: string) => void;
  getTypingUsers: (conversationId: string) => TypingUser[];
  clearConversation: (conversationId: string) => void;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

const TYPING_TIMEOUT = 3000; // 3 seconds
const CLEANUP_INTERVAL = 10000; // 10 seconds

export function TypingProvider({ children }: { children: ReactNode }) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup expired typing users
  const cleanupExpiredUsers = useCallback(() => {
    const now = Date.now();
    setTypingUsers(prev => prev.filter(user => now - user.timestamp < TYPING_TIMEOUT));
  }, []);

  // Cleanup interval
  React.useEffect(() => {
    const interval = setInterval(cleanupExpiredUsers, CLEANUP_INTERVAL);
    return () => clearInterval(interval);
  }, [cleanupExpiredUsers]);

  const stopTyping = useCallback((userId: string, conversationId: string) => {
    if (!userId || !conversationId) return;

    const key = `${userId}-${conversationId}`;
    const timeout = timeoutsRef.current.get(key);
    
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(key);
    }

    setTypingUsers(prev => 
      prev.filter(user => !(user.userId === userId && user.conversationId === conversationId))
    );
  }, []);

  const startTyping = useCallback((userId: string, name: string, conversationId: string) => {
    if (!userId || !name || !conversationId) {
      console.warn('Invalid typing parameters:', { userId, name, conversationId });
      return;
    }

    const key = `${userId}-${conversationId}`;
    
    // Clear existing timeout
    const existingTimeout = timeoutsRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      stopTyping(userId, conversationId);
    }, TYPING_TIMEOUT);
    
    timeoutsRef.current.set(key, timeout);

    setTypingUsers(prev => {
      const filtered = prev.filter(user => !(user.userId === userId && user.conversationId === conversationId));
      return [...filtered, { userId, name, conversationId, timestamp: Date.now() }];
    });
  }, [stopTyping]);

  const getTypingUsers = useCallback((conversationId: string) => {
    if (!conversationId) return [];
    
    const now = Date.now();
    return typingUsers
      .filter(user => user.conversationId === conversationId)
      .filter(user => now - user.timestamp < TYPING_TIMEOUT);
  }, [typingUsers]);

  const clearConversation = useCallback((conversationId: string) => {
    if (!conversationId) return;

    setTypingUsers(prev => prev.filter(user => user.conversationId !== conversationId));
    
    // Clear all timeouts for this conversation
    timeoutsRef.current.forEach((timeout, key) => {
      if (key.endsWith(`-${conversationId}`)) {
        clearTimeout(timeout);
        timeoutsRef.current.delete(key);
      }
    });
  }, []);

  return (
    <TypingContext.Provider value={{
      typingUsers,
      startTyping,
      stopTyping,
      getTypingUsers,
      clearConversation
    }}>
      {children}
    </TypingContext.Provider>
  );
}

export function useTyping() {
  const context = useContext(TypingContext);
  if (context === undefined) {
    throw new Error('useTyping must be used within a TypingProvider');
  }
  return context;
}