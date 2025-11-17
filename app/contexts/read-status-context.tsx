'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ReadStatus {
  conversationId: string;
  messageId: string;
  isRead: boolean;
  readAt?: number;
}

interface ReadStatusContextType {
  readStatuses: ReadStatus[];
  markAsRead: (conversationId: string, messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  getUnreadCount: (conversationId: string) => number;
  isMessageRead: (conversationId: string, messageId: string) => boolean;
  getTotalUnreadCount: () => number;
}

const ReadStatusContext = createContext<ReadStatusContextType | undefined>(undefined);

export function ReadStatusProvider({ children }: { children: ReactNode }) {
  const [readStatuses, setReadStatuses] = useState<ReadStatus[]>([]);

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    if (!conversationId || !messageId) return;

    setReadStatuses(prev => {
      const existing = prev.find(
        status => status.conversationId === conversationId && status.messageId === messageId
      );

      if (existing && existing.isRead) {
        return prev; // Already marked as read
      }

      const newStatus: ReadStatus = {
        conversationId,
        messageId,
        isRead: true,
        readAt: Date.now()
      };

      // Remove existing status and add new one
      const filtered = prev.filter(
        status => !(status.conversationId === conversationId && status.messageId === messageId)
      );

      return [...filtered, newStatus];
    });
  }, []);

  const markConversationAsRead = useCallback((conversationId: string) => {
    if (!conversationId) return;

    setReadStatuses(prev => {
      const existingStatuses = prev.filter(status => status.conversationId === conversationId);
      
      if (existingStatuses.length === 0) return prev;

      // Mark all messages in conversation as read
      const otherConversations = prev.filter(status => status.conversationId !== conversationId);
      
      // For demo purposes, we'll assume all messages in conversation are now read
      // In a real app, you'd have a list of all message IDs in the conversation
      return otherConversations;
    });
  }, []);

  const getUnreadCount = useCallback((conversationId: string) => {
    if (!conversationId) return 0;

    // This is a simplified version - in a real app, you'd have the actual message count
    // For now, we'll use a mock calculation based on read statuses
    const totalMessages = 5; // Mock total messages per conversation
    const readMessages = readStatuses.filter(status => 
      status.conversationId === conversationId && status.isRead
    ).length;

    return Math.max(0, totalMessages - readMessages);
  }, [readStatuses]);

  const isMessageRead = useCallback((conversationId: string, messageId: string) => {
    if (!conversationId || !messageId) return false;

    const status = readStatuses.find(
      s => s.conversationId === conversationId && s.messageId === messageId
    );

    return status?.isRead || false;
  }, [readStatuses]);

  const getTotalUnreadCount = useCallback(() => {
    // Simplified calculation - in real app, sum all unread messages across all conversations
    const conversations = ['1', '2', '3', '4', '5', '6']; // Mock conversation IDs
    return conversations.reduce((total, convId) => total + getUnreadCount(convId), 0);
  }, [getUnreadCount]);

  return (
    <ReadStatusContext.Provider value={{
      readStatuses,
      markAsRead,
      markConversationAsRead,
      getUnreadCount,
      isMessageRead,
      getTotalUnreadCount
    }}>
      {children}
    </ReadStatusContext.Provider>
  );
}

export function useReadStatus() {
  const context = useContext(ReadStatusContext);
  if (context === undefined) {
    throw new Error('useReadStatus must be used within a ReadStatusProvider');
  }
  return context;
}