'use client';

import React, { useState } from 'react';

export default function JobSearchPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
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
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800/60 rounded-2xl bg-[#111318]/50">
              <h3 className="text-lg font-medium text-gray-400">Search results will appear here.</h3>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
