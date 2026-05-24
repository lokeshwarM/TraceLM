'use client';

import React, { useEffect, useState } from 'react';
import { getMetricsOverview, getConversations } from '@/lib/api';
import { MetricsOverviewResponse, ConversationResponse } from '@/lib/types';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsOverviewResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [metricsData, convsData] = await Promise.all([
        getMetricsOverview(),
        getConversations()
      ]);
      setMetrics(metricsData);
      setConversations(convsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to load dashboard data.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f1115] text-gray-200 flex font-sans selection:bg-blue-500/30">
      <ConversationSidebar
        conversations={conversations}
        activeId={null}
        onSelect={() => router.push('/chat')}
        onNewChat={() => router.push('/chat')}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-gray-800/40 bg-[#0f1115]/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Observability Overview</h1>
          <p className="text-gray-400 text-sm mt-2">Real-time metrics and system health</p>
        </header>

        <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2 bg-[#161921] p-6 rounded-2xl border border-gray-800/60 shadow-lg">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-2xl flex flex-col items-center justify-center h-64 shadow-lg">
              <svg className="w-10 h-10 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium mb-2 text-white">Failed to load metrics</h3>
              <p className="text-sm text-red-300/80 mb-6 text-center max-w-md">{error}</p>
              <button onClick={loadData} className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors text-sm font-medium border border-red-500/20">
                Retry Connection
              </button>
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                title="Total Requests" 
                value={metrics.totalRequests.toLocaleString()} 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              />
              <MetricCard 
                title="Avg Latency" 
                value={`${metrics.avgLatency} ms`} 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <MetricCard 
                title="Total Tokens" 
                value={metrics.totalTokens.toLocaleString()} 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
              />
              <MetricCard 
                title="Success Rate" 
                value={`${metrics.successRate}%`} 
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
