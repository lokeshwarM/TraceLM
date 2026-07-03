'use client';

import React from 'react';
import Link from 'next/link';

export default function AutomationDashboardPage() {
  const cards = [
    {
      title: 'Job Search',
      description: 'Search for jobs across multiple providers with a unified interface.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      clickable: true,
      href: '/automation/jobs/search',
    },
    {
      title: 'Saved Jobs',
      description: 'Manage and track all your saved job opportunities.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      clickable: true,
      href: '/automation/jobs/saved',
    },
    {
      title: 'Resume Builder',
      description: 'Automatically tailor and generate resumes based on job descriptions.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      clickable: false,
    },
    {
      title: 'Applications',
      description: 'Track the status of your automated job applications.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      clickable: false,
    },
    {
      title: 'Workflows',
      description: 'Design and execute multi-step automation workflows.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      clickable: false,
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-[#0a0b0e]">
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-gray-800/40 bg-[#0f1115]/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Automation</h1>
        <p className="text-gray-400 text-sm mt-2">Career Automation</p>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const cardContent = (
              <div className={`flex flex-col h-full p-6 rounded-2xl border ${card.clickable ? 'bg-[#161921] border-gray-800/60 hover:border-blue-500/50 hover:bg-[#1a1d27] transition-all cursor-pointer shadow-lg hover:shadow-blue-900/20' : 'bg-[#111318] border-gray-800/30 opacity-70 cursor-not-allowed'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.clickable ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800/30 text-gray-500'}`}>
                    {card.icon}
                  </div>
                  {!card.clickable && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-800/50 text-gray-400 rounded-full border border-gray-700/30">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${card.clickable ? 'text-white' : 'text-gray-400'}`}>
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {card.description}
                </p>
                {card.clickable && (
                  <div className="mt-6 flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300">
                    Get Started
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );

            if (card.clickable && card.href) {
              return (
                <Link href={card.href} key={idx} className="block group h-full">
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={idx} className="block h-full">
                {cardContent}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
