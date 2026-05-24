import React from 'react';
import ReactMarkdown from 'react-markdown';

export interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isLoading, error, messagesEndRef }: MessageListProps) {
  return (
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
  );
}
