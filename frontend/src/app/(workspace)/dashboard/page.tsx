'use client';

import React, { useEffect, useState } from 'react';
import { getMetricsOverview, getConversations, getProviderAnalytics, getLatencyTrend } from '@/lib/api';
import { MetricsOverviewResponse, ConversationResponse, ProviderAnalyticsResponse, LatencyTrendResponse } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsOverviewResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [providers, setProviders] = useState<ProviderAnalyticsResponse | null>(null);
  const [latencyTrend, setLatencyTrend] = useState<LatencyTrendResponse[] | null>(null);
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
      const [metricsData, convsData, providerData, latencyData] = await Promise.all([
        getMetricsOverview(),
        getConversations(),
        getProviderAnalytics().catch(() => null),
        getLatencyTrend().catch(() => null)
      ]);
      setMetrics(metricsData);
      setConversations(convsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProviders(providerData);
      setLatencyTrend(latencyData);
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
    <>
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
          
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-[#161921] border border-gray-800/60 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 tracking-tight">Latency Trend</h3>
                {latencyTrend && latencyTrend.length > 0 ? (
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={latencyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                        <XAxis dataKey="timestamp" stroke="#718096" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                        <YAxis stroke="#718096" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748', borderRadius: '8px' }} 
                          itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 500 }}
                          labelStyle={{ color: '#718096', fontSize: '11px', marginBottom: '4px' }}
                          labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                        />
                        <Line type="monotone" dataKey="avgLatency" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2 }} animationDuration={1000} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[250px] text-gray-500/70 text-sm font-medium border border-dashed border-gray-800/60 rounded-xl">No latency data available</div>
                )}
              </div>

              <div className="bg-[#161921] border border-gray-800/60 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 tracking-tight">Provider Usage</h3>
                {providers && providers.providers.length > 0 ? (
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={providers.providers} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                        <XAxis dataKey="name" stroke="#718096" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#718096" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748', borderRadius: '8px' }} 
                          itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 500 }}
                          labelStyle={{ color: '#718096', fontSize: '11px', marginBottom: '4px' }}
                          cursor={{ fill: '#2d3748', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[250px] text-gray-500/70 text-sm font-medium border border-dashed border-gray-800/60 rounded-xl">No provider data available</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
