'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '@/lib/api';
import { MessageList, Message } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';

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

  return (
    <div className="h-screen overflow-hidden bg-[#0f1115] text-gray-200 flex flex-col items-center font-sans selection:bg-blue-500/30">
      <header className="w-full max-w-4xl pt-8 pb-4 px-4 sm:px-6 lg:px-8 text-center shrink-0">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TraceLM</h1>
        <p className="text-gray-400 text-sm">Minimalist AI Interface</p>
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-6">
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
  );
}
