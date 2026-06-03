'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getConversation, getConversationMetrics, getConversationLogs } from '@/lib/api';
import { ConversationMetricsResponse, InferenceLogResponse } from '@/lib/types';
import { MessageList, Message } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/AuthContext';
import { useConversations } from '@/lib/ConversationsContext';

interface ChatViewProps {
  conversationId?: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { loadConversations } = useConversations();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3.1-flash-lite']);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConversationMetricsResponse | null>(null);
  const [inferenceLogs, setInferenceLogs] = useState<InferenceLogResponse[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [traceFullscreen, setTraceFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancel = async () => {
    if (!activeRequestRef.current) return;
    const currentRequestId = activeRequestRef.current;
    
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    import('@/lib/api').then(m => m.cancelChatRequest(currentRequestId)).catch(console.error);
    
    setIsLoading(false);
    setLoadingModels([]);
    activeRequestRef.current = null;
    abortControllerRef.current = null;
  };

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
    if (conversationId) {
      handleSelectConversation(conversationId);
    } else {
      setMessages([]);
      setMetrics(null);
      setInferenceLogs([]);
      setPrompt('');
    }
  }, [conversationId]);

  const handleSelectConversation = async (id: string) => {
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
            model: log ? log.model : undefined,
            piiRedacted: m.piiRedacted
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
    const requestId = Date.now().toString();
    activeRequestRef.current = requestId;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    console.log("NEW REQUEST START");
    console.log("ABORT STATE", abortControllerRef.current?.signal.aborted);
    console.log("RESETTING CANCEL STATE");

    try {
      let resolvedConversationId = conversationId;

      if (compareMode && selectedModels.length > 0) {
        setLoadingModels([...selectedModels]);
        const compareId = Date.now().toString(); // unique ID for this compare run

        // Consume independent chunks via SSE
        await import('@/lib/api').then(m => m.streamCompareMessages(promptToSend, conversationId, selectedModels, requestId, abortController.signal, (chunk) => {
          if (activeRequestRef.current !== requestId) return; // Prevent stale updates

          if (chunk.conversationId && !resolvedConversationId) {
             resolvedConversationId = chunk.conversationId;
          }

          const incomingModel = chunk.model?.trim() || '';
          console.log('[COMPARE] chunk received:', { model: incomingModel, status: chunk.status, contentLen: chunk.content?.length });
          
          setLoadingModels(prev => prev.filter(m => !(m === incomingModel || incomingModel.includes(m) || m.includes(incomingModel))));
          
          setMessages(prev => {
            const newMessages = [...prev];
            let compareIndex = newMessages.findIndex(m => m.id === compareId);
            
            if (compareIndex === -1) {
              // Wait for first valid content chunk before creating response container
              if (!chunk.content && chunk.status === 'STREAMING') {
                return newMessages;
              }
              const newMsg = {
                  id: compareId,
                  role: "ASSISTANT",
                  type: "compare",
                  responses: []
              } as Message;
              newMessages.push(newMsg);
              compareIndex = newMessages.length - 1;
            }
            
            const compareMsg = { ...newMessages[compareIndex] };
            const responses = [...(compareMsg.responses || [])];
            const existingRespIndex = responses.findIndex(r => r.model === incomingModel || incomingModel.includes(r.model) || r.model.includes(incomingModel));
            
            if (existingRespIndex !== -1) {
                 const resp = { ...responses[existingRespIndex] };
                 resp.model = incomingModel; // snap to latest model label
                 if (chunk.status === 'SUCCESS' || chunk.status === 'FAILED') {
                     resp.status = chunk.status;
                     resp.latencyMs = chunk.latency || resp.latencyMs;
                     resp.inputTokens = chunk.inputTokens || resp.inputTokens;
                     resp.outputTokens = chunk.outputTokens || resp.outputTokens;
                     if (chunk.content) {
                         resp.content = chunk.content;
                     }
                     if (chunk.status === 'FAILED' && chunk.errorMessage) {
                         resp.content = (resp.content || '') + '\n\n[Error: ' + chunk.errorMessage + ']';
                     }
                 } else {
                     // Append streaming content
                     resp.content = (resp.content || '') + (chunk.content || '');
                     resp.status = 'STREAMING';
                 }
                 responses[existingRespIndex] = resp;
              } else {
                 const newResp = {
                     model: incomingModel,
                     content: chunk.content || '',
                     status: chunk.status || 'STREAMING',
                     createdAt: new Date().toISOString()
                 } as any;
                 
                 if (chunk.status === 'SUCCESS' || chunk.status === 'FAILED') {
                     newResp.latencyMs = chunk.latency;
                     newResp.inputTokens = chunk.inputTokens;
                     newResp.outputTokens = chunk.outputTokens;
                     if (chunk.status === 'FAILED' && chunk.errorMessage) {
                         newResp.content = '[Error: ' + chunk.errorMessage + ']';
                     }
                 }
                 responses.push(newResp);
              }
            compareMsg.responses = responses;
            newMessages[compareIndex] = compareMsg;
            return newMessages;
          });
        }));

        // Refresh UI context if necessary
        const targetId = resolvedConversationId;
        if (targetId) {
          getConversationMetrics(targetId).then(setMetrics).catch(console.error);
          getConversationLogs(targetId).then(logs => setInferenceLogs(logs || [])).catch(console.error);
        }
      } else {
        const messageId = Date.now().toString();

        console.log('[NORMAL MODE] Request started for model:', selectedModel);
        let isFirstChunk = true;

        await import('@/lib/api').then(m => m.streamMessage(promptToSend, conversationId, selectedModel, requestId, abortController.signal, (chunk) => {
          if (isFirstChunk) {
            console.log('[NORMAL MODE] First chunk received');
            isFirstChunk = false;
          }
          console.log('[NORMAL MODE] Chunk parsed:', chunk);

          if (activeRequestRef.current !== requestId) {
              console.log('[NORMAL MODE] Stale update skipped');
              return; // Prevent stale updates
          }
          if (!chunk || !chunk.content) {
              if (chunk && chunk.conversationId && !resolvedConversationId) {
                  resolvedConversationId = chunk.conversationId;
              }
              console.log('[NORMAL MODE] Empty chunk skipped');
              return; // Prevent empty chunk creating card
          }

          if (chunk.conversationId && !resolvedConversationId) {
             resolvedConversationId = chunk.conversationId;
          }
          
          setMessages(prev => {
            const newMessages = [...prev];
            let msgIndex = newMessages.findIndex(m => m.id === messageId);
            
            if (msgIndex === -1) {
               newMessages.push({
                   id: messageId,
                   role: "ASSISTANT",
                   content: "",
                   model: selectedModel,
                   createdAt: new Date().toISOString()
               });
               msgIndex = newMessages.length - 1;
            }
            
            const msg = { ...newMessages[msgIndex] };
            msg.content = (msg.content || '') + chunk.content;
            if (chunk.inputTokens) msg.inputTokens = chunk.inputTokens;
            if (chunk.outputTokens) msg.outputTokens = chunk.outputTokens;
            if (chunk.model) msg.model = chunk.model;
            newMessages[msgIndex] = msg;
            
            console.log('[NORMAL MODE] Content appended, total length:', msg.content.length);
            
            return newMessages;
          });
        }));
        
        console.log('[NORMAL MODE] Stream completed');

        const targetId = resolvedConversationId;
        if (targetId) {
          getConversationMetrics(targetId).then(setMetrics).catch(console.error);
          getConversationLogs(targetId).then(logs => setInferenceLogs(logs || [])).catch(console.error);
        }
      }
      
      // If a new conversation was created, update sidebar and route
      if (!conversationId && activeRequestRef.current && resolvedConversationId) {
         loadConversations();
         router.push('/chat/' + resolvedConversationId);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('abort') || err.message.includes('Network request timed out')) {
          console.log('[DEBUG] Request aborted');
          return;
        }
        setError(err.message);
        showToast(err.message, 'error');
      } else {
        setError('An unexpected error occurred.');
        showToast('An unexpected error occurred.', 'error');
      }
    } finally {
      if (activeRequestRef.current === requestId) {
        setIsLoading(false);
        setLoadingModels([]);
        activeRequestRef.current = null;
        abortControllerRef.current = null;
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <header className="w-full px-4 sm:px-6 lg:px-8 py-3 shrink-0 flex items-center justify-between border-b border-gray-800/60 bg-[#161921]/50 mb-4">
        <div className="flex items-center space-x-3 w-1/3">
          {metrics && conversationId && (
              <>
                <div className="flex items-center space-x-2 bg-[#1a1d27] border border-gray-700/50 rounded-full px-3 py-1 shadow-sm">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">In</span>
                  <span className="text-sm font-bold text-gray-200">{metrics.inputTokens?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#1a1d27] border border-gray-700/50 rounded-full px-3 py-1 shadow-sm">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Out</span>
                  <span className="text-sm font-bold text-gray-200">{metrics.outputTokens?.toLocaleString() || '0'}</span>
                </div>
                {metrics.memoryMax !== undefined && (
                  <div className="flex items-center space-x-2 bg-[#1a1d27] border border-gray-700/50 rounded-full px-3 py-1 shadow-sm relative group">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Memory</span>
                    <span className="text-sm font-bold text-blue-400">
                      {metrics.memoryUsed ? (metrics.memoryUsed > 999 ? (metrics.memoryUsed / 1000).toFixed(1) + 'k' : metrics.memoryUsed) : '0'} 
                      <span className="text-gray-600 font-normal mx-1">/</span> 
                      {metrics.memoryMax > 999 ? (metrics.memoryMax / 1000).toFixed(0) + 'k' : metrics.memoryMax}
                    </span>
                    {metrics.windowExceeded && (
                      <div className="absolute top-full left-0 mt-2 w-max max-w-xs bg-[#1a1d27] border border-orange-500/30 text-orange-400/80 text-[10px] px-2.5 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Older conversation memory may be trimmed.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-center justify-center w-1/3 text-center">
            <h1 className="text-xl font-bold text-white tracking-tight leading-none mb-1">TraceLM</h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Conversation Trace Explorer</p>
            {metrics?.windowExceeded && (
              <p className="text-orange-500/60 text-[10px] tracking-wide mt-1 animate-pulse">Older conversation memory may be trimmed.</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 w-1/3">
            {metrics && conversationId && (
              <>
                <div className="flex items-center space-x-2 bg-[#1a1d27] border border-gray-700/50 rounded-full px-3 py-1 shadow-sm">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Latency</span>
                  <span className="text-sm font-bold text-gray-200">{metrics.avgLatency || '0'} ms</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#1a1d27] border border-gray-700/50 rounded-full px-3 py-1 shadow-sm">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Success</span>
                  <span className="text-sm font-bold text-green-400">{metrics.successRate || '0'}%</span>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-row h-full min-h-0 overflow-hidden px-4 sm:px-6 lg:px-8 pb-6 gap-6 max-w-[1600px] mx-auto w-full">
          {!traceFullscreen && (
            <main className="flex-[7] flex flex-col h-full min-w-0 overflow-hidden">

              <MessageList
                messages={messages}
                isLoading={isLoading}
                loadingModels={loadingModels}
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
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                compareMode={compareMode}
                setCompareMode={setCompareMode}
                onCancel={handleCancel}
              />
            </main>
          )}

          <aside className={`${traceFullscreen ? 'flex-1' : 'flex-[3]'} flex flex-col h-full min-w-0 bg-[#161921] border border-gray-800/60 rounded-2xl shadow-xl overflow-hidden`}>
            <div className="sticky top-0 h-10 px-5 border-b border-gray-800/60 bg-[#1a1d27]/95 backdrop-blur z-20 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Raw Inference Traces</h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">{inferenceLogs.length} logs</span>
                <button 
                  onClick={() => setTraceFullscreen(!traceFullscreen)} 
                  className="text-gray-400 hover:text-white transition-colors"
                  title={traceFullscreen ? "Restore Split View" : "Maximize Trace Panel"}
                >
                  {traceFullscreen ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div ref={logsContainerRef} className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-0 relative">
              {inferenceLogs && inferenceLogs.length > 0 ? (
                <table className="w-full text-left text-sm text-gray-400 min-w-max">
                  <thead className="text-[10px] text-gray-500 uppercase bg-[#13151b] border-b border-gray-800/60 sticky top-0 z-10">
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
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500/70 text-sm">
                  No inference traces yet.
                </div>
              )}
            </div>
          </aside>
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
