'use client';

import React, { useState, useEffect } from 'react';
import { getSavedJobs, unsaveJob } from '@/lib/api';
import { SavedJob } from '@/lib/types';
import Link from 'next/link';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSavedJobs();
      setSavedJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (jobId: string) => {
    if (removingIds[jobId]) return;

    // Optimistic UI removal
    const previousJobs = [...savedJobs];
    setSavedJobs(prev => prev.filter(sj => sj.job.jobId !== jobId));
    setRemovingIds(prev => ({ ...prev, [jobId]: true }));

    try {
      await unsaveJob(jobId);
    } catch (err) {
      // Revert optimistic removal
      setSavedJobs(previousJobs);
      // Optional: show a toast error
    } finally {
      setRemovingIds(prev => ({ ...prev, [jobId]: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-[#0a0b0e]">
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-gray-800/40 bg-[#0f1115]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <Link href="/automation" className="hover:text-gray-300 transition-colors">Automation</Link>
            <span className="mx-2">/</span>
            <span>Career</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Saved Jobs</h1>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
            <div className="flex items-center space-x-2 bg-[#161921] p-6 rounded-2xl border border-gray-800/60 shadow-lg">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-gray-500 mt-4 text-sm font-medium">Loading saved jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px] shadow-lg">
            <h3 className="text-lg font-medium mb-2 text-white">Failed to load saved jobs</h3>
            <p className="text-sm text-red-300/80 mb-6 text-center max-w-md">{error}</p>
            <button 
              onClick={fetchSavedJobs}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
            >
              Retry
            </button>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] border border-dashed border-gray-800/60 rounded-2xl bg-[#111318]/50">
            <svg className="w-16 h-16 text-gray-700 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No saved jobs yet.</h3>
            <p className="text-sm text-gray-500 max-w-sm text-center mb-6">
              Jobs you save from the Job Search page will appear here for easy access.
            </p>
            <Link 
              href="/automation/jobs/search"
              className="px-6 py-2.5 bg-[#161921] hover:bg-gray-800 text-white rounded-xl font-medium border border-gray-700/50 transition-colors shadow-sm"
            >
              Search Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedJobs.map(({ id, job, savedAt }) => (
              <div key={job.jobId} className="flex flex-col h-full bg-[#161921] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:border-gray-700 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">{job.title}</h3>
                    <p className="text-blue-400 text-sm font-medium mt-1">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2.5 py-1 bg-gray-800 text-xs font-medium text-gray-300 rounded-full border border-gray-700/50">
                      {job.provider}
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(job.jobId)}
                      disabled={removingIds[job.jobId]}
                      className="p-2 rounded-lg transition-all text-blue-400 bg-blue-500/10 hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                      title="Remove Bookmark"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-green-400 text-sm font-medium">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.salary}
                    </div>
                  )}
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {job.experienceLevel || 'Experience not specified'} • {job.employmentType || 'Type not specified'}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-xs mt-4">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Saved on {new Date(savedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800/60 mt-auto flex items-center justify-between">
                  <a 
                    href={job.jobUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                  >
                    View Job
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
