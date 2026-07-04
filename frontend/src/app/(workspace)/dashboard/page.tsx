'use client';

import React, { useEffect, useState } from 'react';
import { getMetricsOverview, getConversations, getProviderAnalytics, getLatencyTrend } from '@/lib/api';
import { MetricsOverviewResponse, ConversationResponse, ProviderAnalyticsResponse, LatencyTrendResponse } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { MetricCard } from '@/components/dashboard/MetricCard';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsOverviewResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [providers, setProviders] = useState<ProviderAnalyticsResponse | null>(null);
  const [latencyTrend, setLatencyTrend] = useState<LatencyTrendResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
      {/* Page Header */}
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Observability Overview</h1>
        <p className="text-muted-text text-sm mt-2 font-medium">Real-time LLM telemetry and infrastructure health metrics</p>
      </header>

      {/* Main Content Dashboard */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[350px]">
            <div className="flex items-center space-x-2 bg-card p-6 rounded-2xl border border-card-border shadow-lg">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px] shadow-lg">
            <svg className="w-10 h-10 mb-4 text-accent-red/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold mb-1 text-foreground">Connection Outage</h3>
            <p className="text-sm opacity-85 mb-6 text-center max-w-md">{error}</p>
            <button 
              onClick={loadData} 
              className="px-5 py-2.5 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red rounded-xl transition-all text-xs font-bold border border-accent-red/25 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* Metric Cards Row */}
            {metrics && (
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
            )}
            
            {/* Chart visualizations block */}
            {metrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Latency Trend chart */}
                <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col">
                  <h3 className="text-md font-bold text-foreground mb-6 tracking-tight">Latency Performance Trend</h3>
                  {latencyTrend && latencyTrend.length > 0 ? (
                    <div className="flex-1 min-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={latencyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                          <XAxis 
                            dataKey="timestamp" 
                            stroke="var(--color-muted-text)" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} 
                          />
                          <YAxis 
                            stroke="var(--color-muted-text)" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val) => `${val}ms`} 
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                            itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 500 }}
                            labelStyle={{ color: 'var(--color-muted-text)', fontSize: '11px', marginBottom: '4px' }}
                            labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avgLatency" 
                            stroke="var(--primary)" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }} 
                            activeDot={{ r: 6, stroke: 'var(--primary-hover)', strokeWidth: 2 }} 
                            animationDuration={1000} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center min-h-[250px] text-muted-text text-sm font-semibold border border-dashed border-card-border rounded-xl">
                      No latency logs available
                    </div>
                  )}
                </div>

                {/* Provider Usage chart */}
                <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex flex-col">
                  <h3 className="text-md font-bold text-foreground mb-6 tracking-tight">Active LLM Provider Usage</h3>
                  {providers && providers.providers.length > 0 ? (
                    <div className="flex-1 min-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={providers.providers} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--color-muted-text)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--color-muted-text)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                            itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 500 }}
                            labelStyle={{ color: 'var(--color-muted-text)', fontSize: '11px', marginBottom: '4px' }}
                            cursor={{ fill: 'var(--card-hover)', opacity: 0.4 }}
                          />
                          <Bar dataKey="count" fill="var(--color-accent-purple)" radius={[6, 6, 0, 0]} animationDuration={1000} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center min-h-[250px] text-muted-text text-sm font-semibold border border-dashed border-card-border rounded-xl">
                      No provider analytics available
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
