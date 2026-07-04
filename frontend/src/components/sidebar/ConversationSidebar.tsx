'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useConversations } from '@/lib/ConversationsContext';
import { useAuth } from '@/lib/AuthContext';
import LogoBadge from '@/components/brand/Logo';

export function ConversationSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const isDashboard = pathname === '/dashboard';
  const isAutomation = pathname.startsWith('/automation');
  const isMemory = pathname.startsWith('/memory');
  const isDocuments = pathname.startsWith('/documents');
  const { conversations } = useConversations();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const activeId = params.conversationId as string | undefined;

  useEffect(() => {
    const currentTheme = localStorage.getItem('tracelm_theme') as 'light' | 'dark' | null;
    if (currentTheme) {
      setTheme(currentTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('tracelm_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0 z-20">
      {/* Brand logo container */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <Link href="/chat" className="flex items-center gap-2.5 group">
          <LogoBadge size="w-8 h-8" iconSize="w-4.5 h-4.5" />
          <span className="text-lg font-bold tracking-tight text-foreground transition-colors">TraceLM</span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Link
          href="/chat"
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-accent-purple text-background p-3 rounded-xl transition-all duration-200 font-bold text-sm shadow-[0_2px_10px_var(--primary-glow)] hover:shadow-[0_4px_16px_var(--primary-glow)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-4.5 h-4.5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </Link>
      </div>

      {/* Nav Link Options */}
      <div className="px-3 pb-4 pt-1 border-b border-sidebar-border">

        <Link 
          href="/memory" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 mb-1 ${isMemory ? 'bg-card text-foreground border border-card-border shadow-sm font-semibold' : 'text-muted-text hover:bg-card-hover hover:text-foreground border border-transparent'}`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Memory Base</span>
        </Link>

        <Link 
          href="/documents" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 mb-1 ${isDocuments ? 'bg-card text-foreground border border-card-border shadow-sm font-semibold' : 'text-muted-text hover:bg-card-hover hover:text-foreground border border-transparent'}`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Knowledge Docs</span>
        </Link>

        <Link 
          href="/dashboard" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 mb-1 ${isDashboard ? 'bg-card text-foreground border border-card-border shadow-sm font-semibold' : 'text-muted-text hover:bg-card-hover hover:text-foreground border border-transparent'}`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Telemetry Charts</span>
        </Link>

        <Link 
          href="/automation" 
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${isAutomation ? 'bg-card text-foreground border border-card-border shadow-sm font-semibold' : 'text-muted-text hover:bg-card-hover hover:text-foreground border border-transparent'}`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span>Automations</span>
        </Link>
      </div>
      
      {/* Recent Chats list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-card-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/20">
        <div className="text-[10px] font-bold text-muted-text uppercase tracking-wider mb-2.5 px-3 mt-4">
          Recent Traces
        </div>
        <div className="space-y-0.5">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-150 flex items-center border ${
                activeId === conv.id 
                  ? 'bg-primary-glow text-primary border-primary/25 font-semibold' 
                  : 'text-muted-text hover:bg-card-hover hover:text-foreground border-transparent'
              }`}
            >
              <svg className={`w-3.5 h-3.5 mr-2.5 shrink-0 ${activeId === conv.id ? 'text-primary' : 'text-muted-text'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="block truncate flex-1">{conv.title || 'New Trace'}</span>
            </Link>
          ))}
          {conversations.length === 0 && (
            <div className="text-xs text-muted-text text-center py-6 italic opacity-60">
              No traces recorded
            </div>
          )}
        </div>
      </div>

      {/* Theme Toggler Option */}
      <div className="px-4 py-3 border-t border-sidebar-border flex items-center justify-between">
        <span className="text-xs text-muted-text font-medium">Appearance</span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-card hover:bg-card-hover border border-sidebar-border text-muted-text hover:text-foreground transition-all duration-150 shadow-sm flex items-center justify-center cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* User profile popup drawer */}
      {user && (
        <div className="p-4 border-t border-sidebar-border relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center p-2 rounded-xl hover:bg-card-hover transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple text-background font-bold text-xs shrink-0 shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 text-left overflow-hidden min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-text truncate">{user.email}</p>
            </div>
            <svg className="w-3.5 h-3.5 text-muted-text group-hover:text-foreground ml-2 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-4 mb-2 w-56 rounded-xl bg-card border border-card-border shadow-xl py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-4 py-3 border-b border-card-border">
                <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-text truncate">{user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-accent-red hover:bg-card-hover transition-colors flex items-center gap-2 cursor-pointer font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
