'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getMemory, deleteMemory } from '@/lib/api';
import { MemoryResponse } from '@/lib/types';

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memoryId = params.memoryId as string;
  
  const [memory, setMemory] = useState<MemoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMemory() {
      try {
        const data = await getMemory(memoryId);
        setMemory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load memory');
      } finally {
        setIsLoading(false);
      }
    }
    loadMemory();
  }, [memoryId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      await deleteMemory(memoryId);
      router.push('/memory');
    } catch (err) {
      alert('Failed to delete memory.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f1115]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f1115] px-4 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Memory not found</h2>
        <p className="text-gray-400 mb-6">{error || 'This memory does not exist or you do not have permission to view it.'}</p>
        <Link href="/memory" className="bg-[#1a1d27] hover:bg-[#1a1d27]/80 text-white px-4 py-2 rounded-lg transition-colors">
          Back to Memories
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f1115] overflow-y-auto">
      <header className="shrink-0 h-16 border-b border-gray-800/60 bg-[#111318]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href="/memory" className="mr-4 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-white truncate max-w-xl">
            {memory.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/chat/${memory.sourceConversationId}`}
            className="flex items-center px-4 py-2 bg-[#1a1d27] hover:bg-[#1a1d27]/80 text-sm font-medium text-white rounded-lg transition-colors border border-gray-700/50 shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            View Source
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 rounded-lg transition-colors border border-red-500/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-[1000px] w-full mx-auto">
        <div className="bg-[#161921] rounded-2xl border border-gray-800/60 p-8 shadow-sm">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-800/60">
            <div className="flex-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Saved On</h2>
              <p className="text-gray-200">{new Date(memory.createdAt).toLocaleDateString()} at {new Date(memory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message Count</h2>
              <p className="text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                {memory.messageCount}
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Token Count</h2>
              <p className="text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {memory.tokenCount.toLocaleString()}
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Last Message</h2>
              <p className="text-gray-200">{new Date(memory.lastMessageAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Memory Summary</h2>
            <div className="prose prose-invert max-w-none text-gray-300">
              {memory.summary.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
