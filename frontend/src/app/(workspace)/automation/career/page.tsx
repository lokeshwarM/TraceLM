'use client';

import React from 'react';
import Link from 'next/link';

export default function CareerAutomationDashboardPage() {
  const cards = [
    {
      title: 'Career Feed',
      description: 'Discover opportunities automatically matched to your preferences.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      clickable: true,
      href: '/automation/career/feed',
    },
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
      title: 'Career Profile',
      description: 'Configure your preferences, upload resume PDF, and add notes for personalized matching.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      clickable: true,
      href: '/automation/career/profile',
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
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto bg-background">
      {/* Header */}
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-primary mb-2.5 font-bold uppercase tracking-wider">
            <Link href="/automation" className="hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Automations</span>
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Career Automation</h1>
          <p className="text-muted-text text-sm mt-2 font-medium">Manage your personalized job feeds, searches, matches, and application profile.</p>
        </div>
      </header>

      {/* Main cards grid */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-8 sm:px-10 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const cardContent = (
              <div className={`flex flex-col h-full p-6 rounded-2xl border transition-all duration-300 ${card.clickable ? 'bg-card border-card-border hover:border-primary/40 hover:bg-card-hover cursor-pointer shadow-sm hover:shadow-lg' : 'bg-sidebar/40 border-card-border/40 opacity-60 cursor-not-allowed'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.clickable ? 'bg-primary-glow text-primary border border-primary/20' : 'bg-sidebar text-muted-text border border-sidebar-border'}`}>
                    {card.icon}
                  </div>
                  {!card.clickable && (
                    <span className="px-3 py-1 text-[10px] font-bold bg-sidebar text-muted-text rounded-full border border-sidebar-border uppercase tracking-wide">
                      Soon
                    </span>
                  )}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${card.clickable ? 'text-foreground' : 'text-muted-text'}`}>
                  {card.title}
                </h3>
                <p className="text-muted-text text-xs font-semibold leading-relaxed flex-1">
                  {card.description}
                </p>
                {card.clickable && (
                  <div className="mt-6 flex items-center text-primary text-xs font-bold group-hover:text-primary-hover">
                    <span>Open Panel</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
