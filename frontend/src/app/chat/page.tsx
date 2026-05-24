'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getConversations, getConversation, getConversationMetrics } from '@/lib/api';
import { ConversationResponse, ConversationMetricsResponse } from '@/lib/types';
import { MessageList, Message } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';
import { Toast } from '@/components/ui/Toast';

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConversationMetricsResponse | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
  };

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
    setMetrics(null);
    try {
      console.log('[DEBUG] Selecting conversation:', id);
      const [data, metricsData] = await Promise.all([
        getConversation(id),
        getConversationMetrics(id).catch(err => {
          console.error('[DEBUG] Metrics fetch failed:', err);
          return null; // safe null handling for missing metrics
        })
      ]);
      
      console.log('[DEBUG] Conversation Data:', !!data, 'Metrics Data:', metricsData);
      if (data.messages) {
        setMessages(data.messages.map((m: any) => ({ 
          role: m.role as "USER" | "ASSISTANT", 
          content: m.content,
          createdAt: m.createdAt,
          inputTokens: m.role === 'USER' ? Math.ceil(m.content.length / 4) : undefined,
          outputTokens: m.role === 'ASSISTANT' ? Math.ceil(m.content.length / 4) : undefined
        })));
      } else {
        setMessages([]);
      }
      setMetrics(metricsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to load conversation.');
        showToast(err.message || 'Failed to load conversation.', 'error');
      } else {
        setError('Failed to load conversation.');
        showToast('Failed to load conversation.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setMetrics(null);
    setPrompt('');
  };

  const handleSubmit = async (e?: React.FormEvent, retryPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = retryPrompt || prompt.trim();
    if (!promptToSend) return;

    if (!retryPrompt) {
      const userMessage: Message = { 
        role: "USER", 
        content: promptToSend,
        createdAt: new Date().toISOString(),
        inputTokens: Math.ceil(promptToSend.length / 4)
      };
      setMessages(prev => [...prev, userMessage]);
      setPrompt('');
    }

    setIsLoading(true);
    setError(null);
    const startMs = Date.now();

    try {
      const chatResponse = await sendMessage(promptToSend, activeConversationId);
      const latencyMs = Date.now() - startMs;
      const assistantMessage: Message = { 
        role: "ASSISTANT", 
        content: chatResponse.response,
        createdAt: new Date().toISOString(),
        outputTokens: Math.ceil(chatResponse.response.length / 4),
        latencyMs: latencyMs
      };
      setMessages(prev => [...prev, assistantMessage]);

      const targetId = chatResponse.conversationId || activeConversationId;
      if (!activeConversationId && chatResponse.conversationId) {
        setActiveConversationId(chatResponse.conversationId);
      }

      if (targetId) {
        console.log('[DEBUG] Fetching metrics after submit for targetId:', targetId);
        getConversationMetrics(targetId)
          .then(metricsData => {
            console.log('[DEBUG] Metrics fetched after submit:', metricsData);
            setMetrics(metricsData);
          })
          .catch(err => console.error("[DEBUG] Failed to fetch conversation metrics", err));
      }

      loadConversations();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        showToast(err.message, 'error');
      } else {
        setError('An unexpected error occurred.');
        showToast('An unexpected error occurred.', 'error');
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
          <p className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Conversation Trace Explorer</p>
        </header>

        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-6">
          {(() => {
            console.log('[DEBUG] Render Check -> metrics:', !!metrics, 'activeConversationId:', !!activeConversationId);
            return metrics && activeConversationId && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0 transition-all duration-300">
                <div className="bg-[#161921] border border-gray-800/60 rounded-xl p-4 flex flex-col shadow-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Input Tokens</span>
                  <span className="text-xl font-bold text-gray-200 mt-1">{metrics.inputTokens?.toLocaleString() || '0'}</span>
                </div>
                <div className="bg-[#161921] border border-gray-800/60 rounded-xl p-4 flex flex-col shadow-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Tokens</span>
                  <span className="text-xl font-bold text-gray-200 mt-1">{metrics.outputTokens?.toLocaleString() || '0'}</span>
                </div>
                <div className="bg-[#161921] border border-gray-800/60 rounded-xl p-4 flex flex-col shadow-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Latency</span>
                  <span className="text-xl font-bold text-gray-200 mt-1">{metrics.avgLatency || '0'} ms</span>
                </div>
                <div className="bg-[#161921] border border-gray-800/60 rounded-xl p-4 flex flex-col shadow-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Success Rate</span>
                  <span className="text-xl font-bold text-gray-200 mt-1">{metrics.successRate || '0'}%</span>
                </div>
              </div>
            );
          })()}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            error={error}
            messagesEndRef={messagesEndRef}
            onRetry={() => {
              const lastUserMessage = [...messages].reverse().find(m => m.role === 'USER');
              if (lastUserMessage) {
                handleSubmit(undefined, lastUserMessage.content);
              }
            }}
          />
          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
