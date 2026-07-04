'use client';

import React from 'react';
import Link from 'next/link';

export default function AutomationDashboardPage() {
  const cards = [
    {
      title: 'Career Automation',
      description: 'Automate your job search, match listings to your resume, track applications, and optimize your profile.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      clickable: true,
      href: '/automation/career',
    },
    {
      title: 'Workflows',
      description: 'Design, chain, and execute multi-step automated pipelines across your tools.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      clickable: false,
    },
    {
      title: 'Document Automation',
      description: 'Extract text, classify documents, and summarize files automatically using pre-built pipelines.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      clickable: false,
    },
    {
      title: 'Email Automation',
      description: 'Monitor inboxes, auto-draft replies, and trigger follow-ups with intelligent LLM middleware.',
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
      <header className="w-full pt-10 pb-8 px-8 sm:px-10 lg:px-12 shrink-0 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Automation Suite</h1>
        <p className="text-muted-text text-sm mt-2 font-medium">Select an automation framework to configure and deploy scheduled background tasks.</p>
      </header>

      {/* Main grids */}
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
                    <span>Configure Suite</span>
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
