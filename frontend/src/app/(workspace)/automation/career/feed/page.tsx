'use client';

import React, { useState, useEffect } from 'react';
import { refreshCareerFeed, saveJob, unsaveJob } from '@/lib/api';
import { JobListing } from '@/lib/types';
import Link from 'next/link';

export default function CareerFeedPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [savedJobIds, setSavedJobIds] = useState<Record<string, boolean>>({});
  const [savingJobIds, setSavingJobIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await refreshCareerFeed();
      setJobs(results);
    } catch (err: any) {
      setError(err.message || 'An error occurred while refreshing the feed.');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (jobId: string) => {
    if (savingJobIds[jobId]) return;

    const isCurrentlySaved = !!savedJobIds[jobId];
    setSavedJobIds(prev => ({ ...prev, [jobId]: !isCurrentlySaved }));
    setSavingJobIds(prev => ({ ...prev, [jobId]: true }));

    try {
      if (isCurrentlySaved) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
      }
    } catch (err) {
      setSavedJobIds(prev => ({ ...prev, [jobId]: isCurrentlySaved }));
    } finally {
      setSavingJobIds(prev => ({ ...prev, [jobId]: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      {/* Page Header */}
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-primary mb-2.5 font-bold uppercase tracking-wider">
            <Link href="/automation/career" className="hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Career Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Career Feed</h1>
          <p className="text-muted-text text-sm mt-2 font-medium">New opportunities personalized and matched to your loaded profile preferences.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-background rounded-xl font-bold shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_12px_var(--primary-glow)] border border-transparent transition-all disabled:opacity-50 flex items-center cursor-pointer text-sm shrink-0"
        >
          {isLoading ? 'Refreshing Feed...' : 'Refresh Feed'}
          {!isLoading && (
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Grid feed */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10 space-y-8">
        <section className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-card-border rounded-2xl bg-card-hover/20">
              <div className="flex items-center space-x-2 bg-card p-6 rounded-2xl border border-card-border shadow-md">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
              </div>
              <p className="text-muted-text mt-4 text-xs font-bold uppercase tracking-wider">Matching Jobs via LLM...</p>
            </div>
          ) : error ? (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-8 rounded-2xl flex flex-col items-center justify-center h-64 shadow-sm">
              <h3 className="text-lg font-bold mb-1.5 text-foreground">Oops! Something went wrong</h3>
              <p className="text-xs opacity-90 text-center max-w-md font-medium">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-card-border rounded-2xl bg-card-hover/20">
              <svg className="w-12 h-12 text-muted-text/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-foreground mb-1.5">No matching opportunities found</h3>
              <p className="text-xs text-muted-text font-semibold">Tweak preferences inside your Career Profile to expand filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.jobId} className="flex flex-col h-full bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:border-primary/25 hover:shadow-md transition-all duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-4 min-w-0 flex-1">
                      <h3 className="text-md font-bold text-foreground line-clamp-2">{job.title}</h3>
                      <p className="text-primary text-xs font-bold mt-1">{job.company}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2.5 py-1 bg-sidebar text-[10px] font-bold text-muted-text rounded-full border border-sidebar-border uppercase tracking-wide">
                        {job.provider}
                      </span>
                      <button
                        onClick={() => handleToggleSave(job.jobId)}
                        disabled={savingJobIds[job.jobId]}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          savedJobIds[job.jobId] 
                            ? 'text-primary bg-primary-glow border-primary/20 hover:bg-primary-glow/85' 
                            : 'text-muted-text bg-card border-card-border hover:text-foreground hover:bg-card-hover'
                        } ${savingJobIds[job.jobId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={savedJobIds[job.jobId] ? "Unsave opportunity" : "Save opportunity"}
                      >
                        {savedJobIds[job.jobId] ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6 flex-1 text-xs font-semibold text-muted-text">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-muted-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-accent-green font-bold bg-accent-green/5 border border-accent-green/10 rounded px-2 py-0.5 w-max">
                        <svg className="w-4 h-4 mr-1.5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                      </div>
                    )}
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-muted-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{job.experienceLevel || 'Experience unspecified'} • {job.employmentType || 'Type unspecified'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-text/85 line-clamp-3 leading-relaxed mb-6 font-medium">
                    {job.description}
                  </p>

                  <div className="pt-4 border-t border-card-border/60 mt-auto flex items-center justify-between">
                    <a 
                      href={job.jobUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center"
                    >
                      <span>View Opportunity</span>
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    {job.matchScore && (
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {job.matchScore}% Match
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
