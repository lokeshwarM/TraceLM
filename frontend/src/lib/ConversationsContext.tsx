'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getConversations } from '@/lib/api';
import { ConversationResponse } from '@/lib/types';
import { useAuth } from './AuthContext';

interface ConversationsContextType {
  conversations: ConversationResponse[];
  loadConversations: () => Promise<void>;
  isLoading: boolean;
}

const ConversationsContext = createContext<ConversationsContextType>({
  conversations: [],
  loadConversations: async () => {},
  isLoading: false,
});

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await getConversations();
      setConversations(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <ConversationsContext.Provider value={{ conversations, loadConversations, isLoading }}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationsContext);
}
