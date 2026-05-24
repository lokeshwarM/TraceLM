'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getConversations, getConversation } from '@/lib/api';
import { ConversationResponse } from '@/lib/types';
import { MessageList, Message } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConversation(id);
      if (data.messages) {
        setMessages(data.messages.map(m => ({ role: m.role as "USER" | "ASSISTANT", content: m.content })));
      } else {
        setMessages([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to load conversation.');
      } else {
        setError('Failed to load conversation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setPrompt('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { role: "USER", content: prompt.trim() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const chatResponse = await sendMessage(userMessage.content, activeConversationId);
      const assistantMessage: Message = { role: "ASSISTANT", content: chatResponse.response };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (!activeConversationId && chatResponse.conversationId) {
        setActiveConversationId(chatResponse.conversationId);
      }
      
      loadConversations();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred while communicating with the AI.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f1115] text-gray-200 flex font-sans selection:bg-blue-500/30">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="w-full pt-8 pb-4 px-4 sm:px-6 lg:px-8 text-center shrink-0">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TraceLM</h1>
          <p className="text-gray-400 text-sm">Minimalist AI Interface</p>
        </header>

        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-6">
          <MessageList 
            messages={messages} 
            isLoading={isLoading} 
            error={error} 
            messagesEndRef={messagesEndRef} 
          />
          <ChatInput 
            prompt={prompt} 
            setPrompt={setPrompt} 
            isLoading={isLoading} 
            handleSubmit={handleSubmit} 
          />
        </main>
      </div>
    </div>
  );
}
