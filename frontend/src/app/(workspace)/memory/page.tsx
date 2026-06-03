'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMemories, deleteMemory } from '@/lib/api';
import { MemoryResponse } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadMemories() {
      try {
        const data = await getMemories();
        setMemories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load memories');
      } finally {
        setIsLoading(false);
      }
    }
    loadMemories();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Failed to delete memory.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f1115] overflow-y-auto">
      <header className="shrink-0 h-16 border-b border-gray-800/60 bg-[#111318]/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-8">
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center">
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Memory
        </h1>
      </header>

      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Saved Context</h2>
          <p className="text-gray-400">Important conversations you've saved for long-term reference.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-center">
            {error}
          </div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#111318]/50">
            <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No memories yet</h3>
            <p className="text-gray-500 max-w-md">
              You haven't saved any conversations to your memory yet. 
              Click the "Save Memory" button while chatting to save important context.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {memories.map(memory => (
              <Link 
                href={`/memory/${memory.id}`} 
                key={memory.id}
                className="group flex flex-col bg-[#161921] rounded-2xl border border-gray-800/60 p-5 hover:bg-[#1a1d27] hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-1 pr-8">
                    {memory.title}
                  </h3>
                  <button 
                    onClick={(e) => handleDelete(e, memory.id)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Memory"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">
                  {memory.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800/60 mt-auto">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center" title="Messages">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      {memory.messageCount}
                    </span>
                    <span className="flex items-center" title="Tokens">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {memory.tokenCount}
                    </span>
                  </div>
                  <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
