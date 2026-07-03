'use client';

import React, { useState } from 'react';
import { searchJobs } from '@/lib/api';
import { JobListing } from '@/lib/types';

export default function JobSearchPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-[#0a0b0e]">
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-gray-800/40 bg-[#0f1115]/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Job Search</h1>
        <p className="text-gray-400 text-sm mt-2">Find and save the best opportunities across providers.</p>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10 space-y-8">
        <section className="bg-[#111318] p-6 rounded-2xl border border-gray-800/60 shadow-lg">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            
            <div className="flex-1 w-full">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-400 mb-2">Keyword</label>
              <input
                id="keyword"
                type="text"
                placeholder="e.g. Software Engineer"
                className="w-full bg-[#1a1d27] border border-gray-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full">
              <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. San Francisco, CA"
                className="w-full bg-[#1a1d27] border border-gray-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full">
              <label htmlFor="experience" className="block text-sm font-medium text-gray-400 mb-2">Experience</label>
              <select
                id="experience"
                className="w-full bg-[#1a1d27] border border-gray-700/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all appearance-none"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Any Experience</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            
            <div className="flex items-center h-[42px] px-2 w-full md:w-auto">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${remoteOnly ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${remoteOnly ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 text-sm font-medium text-gray-300">
                  Remote Only
                </div>
              </label>
            </div>
            
            <div className="w-full md:w-auto">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-sm border border-transparent transition-all hover:shadow-blue-900/20"
              >
                Search
              </button>
            </div>
            
          </form>
        </section>

        <section className="flex-1">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800/60 rounded-2xl bg-[#111318]/50">
              <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400">No search results yet.</h3>
              <p className="text-sm text-gray-500 mt-1">Adjust your criteria and click Search to begin.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800/60 rounded-2xl bg-[#111318]/50">
              <div className="flex items-center space-x-2 bg-[#161921] p-6 rounded-2xl border border-gray-800/60 shadow-lg">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <p className="text-gray-500 mt-4 text-sm font-medium">Searching across providers...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-2xl flex flex-col items-center justify-center h-64 shadow-lg">
              <h3 className="text-lg font-medium mb-2 text-white">Search Failed</h3>
              <p className="text-sm text-red-300/80 mb-6 text-center max-w-md">{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800/60 rounded-2xl bg-[#111318]/50">
              <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400">No jobs found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.jobId} className="flex flex-col h-full bg-[#161921] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:border-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white line-clamp-2">{job.title}</h3>
                      <p className="text-blue-400 text-sm font-medium mt-1">{job.company}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-gray-800 text-xs font-medium text-gray-300 rounded-full shrink-0 ml-4 border border-gray-700/50">
                      {job.provider}
                    </span>
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
                    {job.postedDate && (
                      <div className="flex items-center text-gray-500 text-xs mt-4">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                    )}
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
        </section>
      </main>
    </div>
  );
}
