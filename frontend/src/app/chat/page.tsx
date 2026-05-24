'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
}

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { role: "USER", content: prompt.trim() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const chatResponse = await sendMessage(userMessage.content);
      const assistantMessage: Message = { role: "ASSISTANT", content: chatResponse.response };
      setMessages(prev => [...prev, assistantMessage]);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f1115] text-gray-200 flex flex-col items-center font-sans selection:bg-blue-500/30">
      <header className="w-full max-w-4xl pt-8 pb-4 px-4 sm:px-6 lg:px-8 text-center shrink-0">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TraceLM</h1>
        <p className="text-gray-400 text-sm">Minimalist AI Interface</p>
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-6">

        {/* AI Output Area */}
        <div className="flex-1 bg-[#161921] border border-gray-800/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4 text-sm font-medium">
                {error}
              </div>
            )}

            {messages.length === 0 && !isLoading && !error && (
              <div className="h-full flex items-center justify-center text-gray-500/70 italic text-sm">
                Type a prompt below to begin...
              </div>
            )}

            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
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

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Prompt Input Area */}
        <div className="shrink-0 relative group w-full">
          <form onSubmit={handleSubmit} className="w-full">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="w-full bg-[#161921] border border-gray-800/60 text-gray-200 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none h-[60px] max-h-[200px] min-h-[60px] overflow-y-auto transition-all shadow-lg text-sm"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
