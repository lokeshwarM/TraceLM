'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getConversations, getConversation, getConversationMetrics, getConversationLogs } from '@/lib/api';
import { ConversationResponse, ConversationMetricsResponse, InferenceLogResponse } from '@/lib/types';
import { MessageList, Message } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';
import { Toast } from '@/components/ui/Toast';

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3.1-flash-lite']);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConversationMetricsResponse | null>(null);
  const [inferenceLogs, setInferenceLogs] = useState<InferenceLogResponse[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0;
    }
  }, [inferenceLogs]);

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
    setInferenceLogs([]);
    try {
      console.log('[DEBUG] Selecting conversation:', id);
      const [data, metricsData, logsData] = await Promise.all([
        getConversation(id),
        getConversationMetrics(id).catch(err => {
          console.error('[DEBUG] Metrics fetch failed:', err);
          return null; // safe null handling for missing metrics
        }),
        getConversationLogs(id).catch(err => {
          console.error('[DEBUG] Logs fetch failed:', err);
          return []; // safe null handling for missing logs
        })
      ]);
      
      console.log('[DEBUG] Conversation Data:', !!data, 'Metrics Data:', metricsData, 'Logs:', logsData?.length);
      
      const sortedLogs = [...(logsData || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      let logIndex = 0;

      if (data.messages) {
        setMessages(data.messages.map((m: any) => {
          let log = null;
          if (m.role === 'ASSISTANT' && logIndex < sortedLogs.length) {
            log = sortedLogs[logIndex++];
          }
          return {
            role: m.role as "USER" | "ASSISTANT", 
            content: m.content,
            createdAt: m.createdAt,
            inputTokens: m.role === 'USER' ? Math.ceil(m.content.length / 4) : undefined,
            outputTokens: m.role === 'ASSISTANT' ? (log ? log.outputTokens : Math.ceil(m.content.length / 4)) : undefined,
            latencyMs: log ? log.latencyMs : undefined,
            model: log ? log.model : undefined
          };
        }));
      } else {
        setMessages([]);
      }
      setMetrics(metricsData);
      setInferenceLogs(logsData || []);
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
    setInferenceLogs([]);
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
      const modelOrModelsToSend = compareMode && selectedModels.length > 0 ? selectedModels : selectedModel;
      const chatResponses = await sendMessage(promptToSend, activeConversationId, modelOrModelsToSend);
      const latencyMs = Date.now() - startMs;
      
      const assistantMessages: Message[] = chatResponses.map(res => ({
        role: "ASSISTANT", 
        content: res.response,
        createdAt: new Date().toISOString(),
        outputTokens: Math.ceil(res.response.length / 4),
        latencyMs: latencyMs,
        model: res.model || (Array.isArray(modelOrModelsToSend) ? modelOrModelsToSend[0] : modelOrModelsToSend)
      }));
      
      setMessages(prev => [...prev, ...assistantMessages]);

      const targetId = chatResponses[0].conversationId || activeConversationId;
      if (!activeConversationId && chatResponses[0].conversationId) {
        setActiveConversationId(chatResponses[0].conversationId);
      }

      if (targetId) {
        console.log('[DEBUG] Fetching metrics after submit for targetId:', targetId);
        getConversationMetrics(targetId)
          .then(metricsData => {
            console.log('[DEBUG] Metrics fetched after submit:', metricsData);
            setMetrics(metricsData);
          })
          .catch(err => console.error("[DEBUG] Failed to fetch conversation metrics", err));

        getConversationLogs(targetId)
          .then(logsData => {
            setInferenceLogs(logsData || []);
          })
          .catch(err => console.error("[DEBUG] Failed to fetch conversation logs", err));
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

          {inferenceLogs && inferenceLogs.length > 0 && (
            <div 
              ref={logsContainerRef}
              className="max-h-48 overflow-auto shrink-0 mb-4 bg-[#161921] border border-gray-800/60 rounded-2xl shadow-xl scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              style={{ overflowAnchor: 'none' }}
            >
              <div className="sticky top-0 h-10 px-5 border-b border-gray-800/60 bg-[#1a1d27]/95 backdrop-blur z-20 flex justify-between items-center min-w-max">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Raw Inference Traces</h3>
                <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">{inferenceLogs.length} logs</span>
              </div>
              <table className="w-full text-left text-sm text-gray-400 min-w-max">
                <thead className="text-[10px] text-gray-500 uppercase bg-[#13151b] border-b border-gray-800/60 sticky top-10 z-10">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                      <th className="px-4 py-2.5 font-semibold">Provider</th>
                      <th className="px-4 py-2.5 font-semibold">Model</th>
                      <th className="px-4 py-2.5 font-semibold">Latency</th>
                      <th className="px-4 py-2.5 font-semibold text-right">IN/OUT</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40 text-[11px]">
                    {inferenceLogs.map((log) => (
                      <tr key={`${log.createdAt}-${log.model}`} className="hover:bg-[#1a1d27] transition-colors group">
                        <td className="px-4 py-2.5 whitespace-nowrap text-gray-500">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-300">{log.provider}</td>
                        <td className="px-4 py-2.5 text-blue-400/80 font-mono">{log.model}</td>
                        <td className="px-4 py-2.5 font-mono">{log.latencyMs}ms</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-500">
                          <span className="text-gray-300">{log.inputTokens}</span> <span className="mx-1 opacity-50">/</span> <span className="text-blue-300">{log.outputTokens}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider ${log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}

          <ChatInput
            prompt={prompt}
            setPrompt={setPrompt}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            compareMode={compareMode}
            setCompareMode={setCompareMode}
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
