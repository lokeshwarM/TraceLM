'use client';

import React, { useState } from 'react';
import { searchJobs, saveJob, unsaveJob } from '@/lib/api';
import { JobListing } from '@/lib/types';
import Link from 'next/link';

export default function JobSearchPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedJobIds, setSavedJobIds] = useState<Record<string, boolean>>({});
  const [savingJobIds, setSavingJobIds] = useState<Record<string, boolean>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchJobs({ keyword, location, experience, remoteOnly });
      setJobs(results);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search.');
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
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-xs text-primary mb-2.5 font-bold uppercase tracking-wider">
          <Link href="/automation/career" className="hover:underline flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Career Dashboard</span>
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Job Search</h1>
        <p className="text-muted-text text-sm mt-2 font-medium">Find and save opportunities across remote boards and scraped directory providers.</p>
      </header>

      {/* Main Search Panel */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10 space-y-8">
        <section className="bg-card p-6 rounded-2xl border border-card-border shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-5 items-end">
            
            <div className="flex-1 w-full">
              <label htmlFor="keyword" className="block text-xs font-bold text-foreground/90 mb-2.5">Keyword</label>
              <input
                id="keyword"
                type="text"
                placeholder="e.g. Software Engineer"
                className="w-full bg-input-bg border border-input-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner transition-all placeholder:text-muted-text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full">
              <label htmlFor="location" className="block text-xs font-bold text-foreground/90 mb-2.5">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. San Francisco, CA"
                className="w-full bg-input-bg border border-input-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner transition-all placeholder:text-muted-text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full">
              <label htmlFor="experience" className="block text-xs font-bold text-foreground/90 mb-2.5">Experience</label>
              <div className="relative">
                <select
                  id="experience"
                  className="w-full bg-input-bg border border-input-border text-foreground rounded-xl pl-4 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary text-sm shadow-inner transition-all appearance-none cursor-pointer"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
                    backgroundPosition: 'right 0.6rem center', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundSize: '0.9em' 
                  }}
                >
                  <option value="">Any Experience</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
            
            {/* Toggle switch */}
            <div className="flex items-center h-[42px] px-2 w-full md:w-auto">
              <label className="flex items-center cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${remoteOnly ? 'bg-primary shadow-sm shadow-primary/30' : 'bg-border-custom'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${remoteOnly ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 text-xs font-bold text-foreground">
                  Remote Only
                </div>
              </label>
            </div>
            
            <div className="w-full md:w-auto">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-background rounded-xl font-bold shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_12px_var(--primary-glow)] border border-transparent transition-all cursor-pointer text-sm shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Results grid panel */}
        <section className="flex-1">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-card-border rounded-2xl bg-card-hover/20">
              <svg className="w-12 h-12 text-muted-text/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-bold text-foreground mb-1.5">Launch search query</h3>
              <p className="text-xs text-muted-text font-semibold">Tweak criteria inputs above and click Search.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-card-border rounded-2xl bg-card-hover/20">
              <div className="flex items-center space-x-2 bg-card p-6 rounded-2xl border border-card-border shadow-md">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
              </div>
              <p className="text-muted-text mt-4 text-xs font-bold uppercase tracking-wider">Scraping board indexes...</p>
            </div>
          ) : error ? (
            <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red p-8 rounded-2xl flex flex-col items-center justify-center h-64 shadow-sm">
              <h3 className="text-lg font-bold mb-1.5 text-foreground">Query Failed</h3>
              <p className="text-xs opacity-90 text-center max-w-md font-medium">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-card-border rounded-2xl bg-card-hover/20">
              <svg className="w-12 h-12 text-muted-text/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-foreground mb-1.5">No results found</h3>
              <p className="text-xs text-muted-text font-semibold">Try different keyword descriptors.</p>
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
