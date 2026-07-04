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
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Memory not found</h2>
        <p className="text-muted-text mb-6 text-sm">{error || 'This memory does not exist or you do not have permission to view it.'}</p>
        <Link href="/memory" className="bg-card hover:bg-card-hover border border-card-border text-foreground px-5 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-sm">
          Back to Memories
        </Link>
      </div>
    );
  }

  return (

    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      {/* Header bar */}
      <header className="shrink-0 h-16 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href="/memory" className="mr-4 text-muted-text hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-md font-bold text-foreground truncate max-w-xl">
            {memory.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            href={`/chat/${memory.sourceConversationId}`}
            className="flex items-center px-4 py-2.5 bg-card hover:bg-card-hover text-xs font-bold text-foreground rounded-xl transition-all border border-card-border shadow-sm"
          >
            <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>View Source Trace</span>
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2.5 bg-accent-red/10 hover:bg-accent-red/20 text-xs font-bold text-accent-red rounded-xl transition-all border border-accent-red/20 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Memory</span>
          </button>
        </div>
      </header>

      {/* Detail card panels */}
      <main className="flex-1 p-8 max-w-[1000px] w-full mx-auto">
        <div className="bg-card rounded-2xl border border-card-border p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-card-border">
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Saved On</h2>
              <p className="text-sm font-semibold text-foreground">
                {new Date(memory.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Message Count</h2>
              <p className="text-sm font-semibold text-foreground flex items-center">
                {memory.messageCount} messages
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Token Size</h2>
              <p className="text-sm font-semibold text-foreground flex items-center">
                {memory.tokenCount.toLocaleString()} tokens
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Last Message</h2>
              <p className="text-sm font-semibold text-foreground">
                {new Date(memory.lastMessageAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-4">Memory Summary</h2>
            <div className="prose prose-invert max-w-none text-foreground/95 text-sm leading-relaxed font-medium whitespace-pre-wrap">
              {memory.summary.split('\n').map((line, i) => (
                <p key={i} className="mb-3">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
