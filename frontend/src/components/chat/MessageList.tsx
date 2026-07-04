import React from 'react';
import ReactMarkdown from 'react-markdown';
import { normalizeResponse } from '@/lib/responseNormalizer';
import { CompareResponseGrid } from './CompareResponseGrid';
import { SourceMetadata } from '@/lib/types';

export interface CompareResponse {
  model: string;
  content: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  status?: string;
  createdAt?: string;
}

export interface Message {
  id?: string;
  role: "USER" | "ASSISTANT";
  type?: "compare";
  content?: string;
  responses?: CompareResponse[];
  createdAt?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  model?: string;
  status?: string;
  piiRedacted?: boolean;
  sources?: SourceMetadata[];
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  loadingModels?: string[];
  onRetry?: () => void;
}

export function MessageList({ messages, isLoading, error, messagesEndRef, loadingModels, onRetry }: MessageListProps) {
  return (
    <div className="flex-1 bg-card border border-card-border rounded-2xl shadow-sm flex flex-col overflow-hidden mb-4 transition-all duration-300">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">

        {messages.length === 0 && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-muted-text">
            <div className="bg-card-hover p-4 rounded-full mb-4 shadow-sm border border-card-border">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">TraceLM Observability Chat</h3>
            <p className="text-sm italic opacity-80">Ask a question to see real-time inference traces...</p>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}>
              <div className={`${
                msg.role === 'USER' 
                  ? 'max-w-[75%] rounded-2xl p-4.5 bg-chat-user text-chat-user-text rounded-br-none font-medium shadow-sm' 
                  : (msg.type === 'compare' 
                      ? 'w-full' 
                      : 'max-w-[85%] rounded-2xl p-4.5 bg-chat-assistant border border-card-border text-foreground rounded-bl-none shadow-sm')
              }`}>
                {msg.type === 'compare' && msg.responses ? (
                  <CompareResponseGrid responses={msg.responses} loadingModels={loadingModels} />
                ) : msg.role === 'ASSISTANT' ? (
                  <div className="text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-foreground" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-3 mb-2 text-foreground" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                        code: ({ node, className, children, ...props }: any) => {
                          const isInline = !String(children).includes('\n');
                          if (isInline) {
                            return <code className="bg-card border border-card-border px-1.5 py-0.5 rounded text-accent-purple font-mono text-[0.85em]" {...props}>{children}</code>;
                          }
                          return (
                            <div className="bg-sidebar rounded-xl p-4 overflow-x-auto my-3 border border-card-border shadow-inner">
                              <code className="font-mono text-[0.85em] text-foreground leading-normal" {...props}>
                                {children}
                              </code>
                            </div>
                          );
                        },
                        a: ({ node, ...props }) => <a className="text-accent-blue hover:text-accent-blue/80 font-semibold underline underline-offset-2" {...props} target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {normalizeResponse(msg.content || '')}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content || ''}</p>
                )}

                {msg.role === 'ASSISTANT' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-card-border/60">
                    <details className="group">
                      <summary className="flex items-center cursor-pointer list-none text-[10px] font-bold text-muted-text hover:text-foreground transition-colors uppercase tracking-widest">
                        <svg className="w-3.5 h-3.5 mr-1.5 transition-transform group-open:rotate-90 text-muted-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Sources ({msg.sources.length})
                      </summary>
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        {msg.sources.map((source, i) => (
                          <div key={i} className="flex flex-col bg-card border border-card-border rounded-xl p-3 shadow-sm min-w-[200px] flex-1">
                            <span className="text-xs font-semibold text-foreground truncate mb-1 flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1.5 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {source.documentName}
                            </span>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-muted-text font-bold">
                              <span className="bg-sidebar border border-sidebar-border px-1.5 py-0.5 rounded">Page {source.pageNumber}</span>
                              <span className="text-accent-blue">{(source.similarityScore * 100).toFixed(1)}% match</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
              
              {/* Message metadata details footer */}
              {msg.type !== 'compare' && (
                <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-muted-text font-semibold px-2">
                  {msg.role === 'USER' ? (
                    <>
                      {msg.createdAt && <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      {msg.piiRedacted && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="text-accent-red font-extrabold bg-accent-red/10 border border-accent-red/20 px-1.5 py-0.5 rounded uppercase tracking-wider">PII REDACTED</span>
                        </>
                      )}
                      {msg.inputTokens !== undefined && (
                        <>
                          <span className="opacity-40">•</span>
                          <span>{msg.inputTokens} tokens</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {msg.model && (
                        <span className="text-primary font-mono font-bold tracking-tight bg-primary-glow border border-primary/10 px-2 py-0.5 rounded-md">
                          {msg.model}
                        </span>
                      )}
                      {msg.latencyMs !== undefined && (
                        <>
                          {msg.model && <span className="opacity-40">•</span>}
                          <span>{(msg.latencyMs / 1000).toFixed(2)}s</span>
                        </>
                      )}
                      {msg.outputTokens !== undefined && (
                        <>
                          {(msg.model || msg.latencyMs !== undefined) && <span className="opacity-40">•</span>}
                          <span>{msg.outputTokens} tokens</span>
                        </>
                      )}
                      {msg.createdAt && (
                        <>
                          {(msg.model || msg.latencyMs !== undefined || msg.outputTokens !== undefined) && <span className="opacity-40">•</span>}
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loader indicators during streaming */}
          {isLoading && loadingModels && loadingModels.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              {loadingModels.map((model, i) => (
                <div key={i} className="flex items-center space-x-3 bg-card-hover border border-card-border p-3.5 rounded-xl self-start max-w-[280px] w-full animate-pulse shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-foreground truncate">{model}</p>
                    <p className="text-[9px] text-muted-text">Generating response...</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-4.5 rounded-xl flex items-center justify-between shadow-sm">
              <span className="text-xs font-semibold">{error}</span>
              <button 
                onClick={onRetry}
                className="px-3.5 py-1.5 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red rounded-lg transition-colors text-[11px] font-bold border border-accent-red/25 cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
