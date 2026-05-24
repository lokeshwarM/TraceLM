import React from 'react';
import ReactMarkdown from 'react-markdown';

export interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onRetry?: () => void;
}

export function MessageList({ messages, isLoading, error, messagesEndRef, onRetry }: MessageListProps) {
  return (
    <div className="flex-1 bg-[#161921] border border-gray-800/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">

        {messages.length === 0 && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500/70">
            <div className="bg-[#1a1d27] p-4 rounded-full mb-4 shadow-sm border border-gray-800/60">
              <svg className="w-8 h-8 text-blue-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">How can I help you today?</h3>
            <p className="text-sm italic">Type a prompt below to begin...</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}>
              <div className={`${msg.role === 'USER' ? 'max-w-[70%]' : 'max-w-[80%]'} rounded-2xl p-4 ${msg.role === 'USER' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#1a1d27] border border-gray-700/50 text-gray-200 rounded-bl-none shadow-sm'}`}>
                {msg.role === 'ASSISTANT' ? (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-white" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-4 mb-2 text-white" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-3 mb-2 text-white" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                        code: ({ node, className, children, ...props }: any) => {
                          const isInline = !String(children).includes('\n');
                          if (isInline) {
                            return <code className="bg-[#0f1115] px-1.5 py-0.5 rounded text-blue-300 font-mono text-[0.8em]" {...props}>{children}</code>;
                          }
                          return (
                            <div className="bg-[#0f1115] rounded-xl p-4 overflow-x-auto my-3 border border-gray-700/50 shadow-inner">
                              <code className="font-mono text-[0.85em] text-gray-300 leading-normal" {...props}>
                                {children}
                              </code>
                            </div>
                          );
                        },
                        a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" {...props} target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                )}
              </div>
              <div className="flex items-center space-x-1.5 mt-1.5 text-[10px] text-gray-500 font-medium px-2">
                {msg.createdAt && <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                {msg.role === 'USER' && msg.inputTokens && (
                  <>
                    <span>•</span>
                    <span>{msg.inputTokens} IN_TOKENS</span>
                  </>
                )}
                {msg.role === 'ASSISTANT' && (msg.outputTokens || msg.latencyMs) && (
                  <>
                    <span>•</span>
                    {msg.outputTokens && <span>{msg.outputTokens} OUT_TOKENS</span>}
                    {msg.latencyMs && <span>({(msg.latencyMs / 1000).toFixed(2)}s)</span>}
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center justify-start mt-2">
              <div className="max-w-[80%] bg-[#1a1d27] border border-gray-700/50 rounded-2xl rounded-bl-none p-4 flex items-center space-x-2 shadow-sm">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center mt-4 mb-2">
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center space-x-3 shadow-sm">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
                {onRetry && (
                  <button onClick={onRetry} className="ml-4 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
