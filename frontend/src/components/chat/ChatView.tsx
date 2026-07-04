'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getConversation, getConversationMetrics, getConversationLogs, createMemory } from '@/lib/api';
import { ConversationMetricsResponse, InferenceLogResponse } from '@/lib/types';
import { MessageList, Message } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { Toast } from '@/components/ui/Toast';
import { useConversations } from '@/lib/ConversationsContext';
import { BrowserVoiceOutputProvider } from '@/lib/voice/BrowserVoiceOutputProvider';

export interface SubmitOptions {
  overridePrompt?: string;
  isRetry?: boolean;
  voiceOutputEnabled?: boolean;
}

interface ChatViewProps {
  conversationId?: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const router = useRouter();
  const { loadConversations } = useConversations();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3.1-flash-lite']);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingMemory, setIsSavingMemory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConversationMetricsResponse | null>(null);
  const [inferenceLogs, setInferenceLogs] = useState<InferenceLogResponse[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [traceFullscreen, setTraceFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const voiceProviderRef = useRef<BrowserVoiceOutputProvider | null>(null);

  useEffect(() => {
    voiceProviderRef.current = new BrowserVoiceOutputProvider();
    return () => {
      voiceProviderRef.current?.stop();
    };
  }, []);

  const handleCancel = async () => {
    if (!activeRequestRef.current) return;
    const currentRequestId = activeRequestRef.current;
    
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    voiceProviderRef.current?.stop();
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
    voiceProviderRef.current?.stop();
    try {
      const [data, metricsData, logsData] = await Promise.all([
        getConversation(id),
        getConversationMetrics(id).catch(err => {
          console.error('[DEBUG] Metrics fetch failed:', err);
          return null;
        }),
        getConversationLogs(id).catch(err => {
          console.error('[DEBUG] Logs fetch failed:', err);
          return [];
        })
      ]);
      
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
      if (!conversationId && data.id) {
        window.history.replaceState(null, '', `/chat/${data.id}`);
        loadConversations();
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMemory = async () => {
    if (!conversationId) return;
    setIsSavingMemory(true);
    try {
      await createMemory(conversationId);
      setToast({ message: 'Saved to Memory', type: 'success' });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to save memory', type: 'error' });
    } finally {
      setIsSavingMemory(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, options?: SubmitOptions) => {
    if (e) e.preventDefault();
    const promptToSend = options?.overridePrompt || prompt.trim();
    if (!promptToSend) return;

    if (!options?.isRetry) {
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
    const requestId = Date.now().toString();
    activeRequestRef.current = requestId;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    voiceProviderRef.current?.stop();
    const isVoiceAssistantMode = localStorage.getItem('tracelm_voice_assistant_mode') === 'true';

    try {
      let resolvedConversationId = conversationId;

      if (compareMode && selectedModels.length > 0) {
        setLoadingModels([...selectedModels]);
        const compareId = Date.now().toString();

        await import('@/lib/api').then(m => m.streamCompareMessages(promptToSend, conversationId, selectedModels, requestId, abortController.signal, (chunk) => {
          if (activeRequestRef.current !== requestId) return;

          if (chunk.conversationId && !resolvedConversationId) {
             resolvedConversationId = chunk.conversationId;
          }

          const incomingModel = chunk.model?.trim() || '';
          setLoadingModels(prev => prev.filter(m => !(m === incomingModel || incomingModel.includes(m) || m.includes(incomingModel))));
          
          setMessages(prev => {
            const newMessages = [...prev];
            let compareIndex = newMessages.findIndex(m => m.id === compareId);
            
            if (compareIndex === -1) {
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
                 resp.model = incomingModel;
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

        const targetId = resolvedConversationId;
        if (targetId) {
          getConversationMetrics(targetId).then(setMetrics).catch(console.error);
          getConversationLogs(targetId).then(logs => setInferenceLogs(logs || [])).catch(console.error);
        }
      } else {
        const voiceOutputFlag = options?.voiceOutputEnabled === true;
        const messageId = Date.now().toString();
        let isFirstChunk = true;

        await import('@/lib/api').then(m => m.streamMessage(promptToSend, conversationId, selectedModel, requestId, abortController.signal, voiceOutputFlag, (chunk) => {
          if (isFirstChunk) {
            isFirstChunk = false;
          }

          if (activeRequestRef.current !== requestId) {
              return;
          }

          if (chunk.conversationId && !resolvedConversationId) {
             resolvedConversationId = chunk.conversationId;
          }
          
          setMessages(prev => {
            const newMessages = [...prev];
            let msgIndex = newMessages.findIndex(m => m.id === messageId);
            
            if (msgIndex === -1) {
               if (!chunk.content) {
                   return prev;
               }
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
            if (chunk.content) {
                msg.content = (msg.content || '') + chunk.content;
            }
            if (chunk.inputTokens !== undefined) msg.inputTokens = chunk.inputTokens;
            if (chunk.outputTokens !== undefined) msg.outputTokens = chunk.outputTokens;
            if (chunk.model) msg.model = chunk.model;
            if (chunk.sources) msg.sources = chunk.sources;
            newMessages[msgIndex] = msg;
            
            return newMessages;
          });
        }));
        
        if (voiceOutputFlag) {
          setMessages(prev => {
            const finalMsg = prev.find(m => m.id === messageId);
            if (finalMsg && finalMsg.content) {
              voiceProviderRef.current?.speak(finalMsg.content);
            }
            return prev;
          });
        }

        const targetId = resolvedConversationId;
        if (targetId) {
          getConversationMetrics(targetId).then(setMetrics).catch(console.error);
          getConversationLogs(targetId).then(logs => setInferenceLogs(logs || [])).catch(console.error);
        }
      }
      
      if (!conversationId && activeRequestRef.current && resolvedConversationId) {
         loadConversations();
         router.push('/chat/' + resolvedConversationId);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('abort') || err.message.includes('Network request timed out')) {
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
      {/* Telemetry bar header */}
      <header className="w-full px-6 py-3.5 shrink-0 flex items-center justify-between border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-15">
        <div className="flex items-center space-x-2.5 w-1/3">
          {metrics && conversationId && (
            <>
              <div className="flex items-center space-x-1.5 bg-sidebar border border-sidebar-border rounded-full px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">In</span>
                <span className="text-xs font-bold text-foreground">{metrics.inputTokens?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-sidebar border border-sidebar-border rounded-full px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Out</span>
                <span className="text-xs font-bold text-foreground">{metrics.outputTokens?.toLocaleString() || '0'}</span>
              </div>
              {metrics.memoryMax !== undefined && (
                <div className="flex items-center space-x-1.5 bg-sidebar border border-sidebar-border rounded-full px-3 py-1 shadow-sm relative group">
                  <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Mem</span>
                  <span className="text-xs font-bold text-accent-blue">
                    {metrics.memoryUsed ? (metrics.memoryUsed > 999 ? (metrics.memoryUsed / 1000).toFixed(1) + 'k' : metrics.memoryUsed) : '0'} 
                    <span className="text-muted-text font-normal mx-0.5">/</span> 
                    {metrics.memoryMax > 999 ? (metrics.memoryMax / 1000).toFixed(0) + 'k' : metrics.memoryMax}
                  </span>
                  {metrics.windowExceeded && (
                    <div className="absolute top-full left-0 mt-2 w-max max-w-xs bg-card border border-accent-amber/35 text-accent-amber text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Older conversation memory has been trimmed.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-center justify-center w-1/3 text-center">
          <h1 className="text-lg font-bold text-foreground tracking-tight leading-none mb-1">TraceLM Explorer</h1>
          <p className="text-muted-text text-[9px] uppercase tracking-widest font-extrabold">Active LLM Observatory</p>
        </div>

        <div className="flex items-center justify-end space-x-2.5 w-1/3">
          {metrics && conversationId && (
            <>
              <div className="flex items-center space-x-1.5 bg-sidebar border border-sidebar-border rounded-full px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Latency</span>
                <span className="text-xs font-bold text-foreground">{metrics.avgLatency || '0'} ms</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-sidebar border border-sidebar-border rounded-full px-3 py-1 shadow-sm">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">Success</span>
                <span className="text-xs font-bold text-accent-green">{metrics.successRate || '0'}%</span>
              </div>
              <button
                onClick={handleSaveMemory}
                disabled={isSavingMemory}
                className="flex items-center space-x-1.5 bg-primary-glow hover:bg-primary-hover/20 text-primary border border-primary/20 rounded-full px-3.5 py-1.5 shadow-sm transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingMemory ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                )}
                <span>Save Memory</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main split-screen panel container */}
      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-hidden px-4 sm:px-6 lg:px-8 pb-6 gap-6 max-w-[1600px] mx-auto w-full mt-4">
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
                  handleSubmit(undefined, { overridePrompt: lastUserMessage.content, isRetry: true });
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
              setPromptCompareMode={setCompareMode}
              onCancel={handleCancel}
            />
          </main>
        )}

        <aside className={`${traceFullscreen ? 'flex-1' : 'flex-[3]'} flex flex-col h-full min-w-0 bg-card border border-card-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300`}>
          <div className="sticky top-0 h-11 px-5 border-b border-card-border bg-card-hover z-20 flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Raw Inference Traces</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-text bg-card border border-card-border px-2.5 py-0.5 rounded-full font-semibold">{inferenceLogs.length} traces</span>
              <button 
                onClick={() => setTraceFullscreen(!traceFullscreen)} 
                className="text-muted-text hover:text-foreground transition-colors cursor-pointer"
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
          
          <div ref={logsContainerRef} className="flex-1 overflow-auto p-0 relative">
            {inferenceLogs && inferenceLogs.length > 0 ? (
              <table className="w-full text-left text-xs text-foreground min-w-max">
                <thead className="text-[10px] text-muted-text uppercase bg-card border-b border-card-border sticky top-0 z-10 font-bold">
                  <tr>
                    <th className="px-4 py-3 font-bold">Timestamp</th>
                    <th className="px-4 py-3 font-bold">Provider</th>
                    <th className="px-4 py-3 font-bold">Model</th>
                    <th className="px-4 py-3 font-bold">Latency</th>
                    <th className="px-4 py-3 font-bold text-right">Tokens (IN/OUT)</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/60 text-[11px] font-medium">
                  {inferenceLogs.map((log, idx) => (
                    <tr key={`${log.createdAt}-${log.model}-${idx}`} className="hover:bg-card-hover transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-text">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-foreground font-semibold">{log.provider}</td>
                      <td className="px-4 py-3 text-primary font-mono font-semibold">{log.model}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{log.latencyMs}ms</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-text">
                        <span className="text-foreground">{log.inputTokens}</span> 
                        <span className="mx-1 opacity-40">/</span> 
                        <span className="text-accent-blue">{log.outputTokens}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${log.status === 'SUCCESS' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-accent-red/10 text-accent-red border border-accent-red/20'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-text text-sm font-medium">
                No inference traces logged
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
