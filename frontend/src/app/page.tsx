'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoBadge from '@/components/brand/Logo';

export default function LandingPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative transition-colors duration-200">
            {/* Mesh grids background */}
            <div className="mesh-gradient-bg opacity-30"></div>
            <div className="mesh-grid absolute inset-0 opacity-40 pointer-events-none"></div>

            {/* Sticky Header Nav */}
            <nav className="w-full border-b border-card-border bg-card/75 backdrop-blur-md sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 py-4">
                    <Link href="/" className="flex items-center gap-3 group">
                        <LogoBadge size="w-9 h-9" iconSize="w-5.5 h-5.5" />
                        <span className="text-xl font-black tracking-tight text-foreground">TraceLM</span>
                    </Link>
                    <div className="flex items-center gap-5">
                        {/* Theme switcher */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-sidebar hover:bg-card-hover border border-sidebar-border text-muted-text hover:text-foreground transition-all duration-150 shadow-sm flex items-center justify-center cursor-pointer"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
                        <Link href="/login" className="text-muted-text hover:text-foreground transition-colors text-sm font-bold">Sign In</Link>
                        <Link 
                            href="/login" 
                            className="bg-primary hover:bg-primary-hover text-background px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_2px_10px_var(--primary-glow)] hover:shadow-[0_4px_16px_var(--primary-glow)] transition-all duration-150 hover:-translate-y-0.5"
                        >
                            Start Tracing
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Main Content */}
            <header className="max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-16 text-center relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-glow border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                    ⚡ Version 1.0 Release
                </span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-tight">
                    Observability Trace Hub & Multi-Agent Automations for LLMs
                </h1>
                <p className="text-lg md:text-xl text-muted-text max-w-3xl mx-auto mb-10 leading-relaxed font-semibold">
                    An enterprise console engineered to track conversation latency, compare outputs side-by-side, automate PII redactions, manage vector knowledge bases, and run background automation pipelines.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href="/login" 
                        className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-background px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_4px_14px_0_var(--primary-glow)] hover:shadow-[0_6px_22px_0_var(--primary-glow)] hover:-translate-y-0.5"
                    >
                        Access Telemetry Workspace
                    </Link>
                    <a 
                        href="https://github.com/lokeshwarM/TraceLM" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full sm:w-auto bg-card border border-card-border hover:bg-card-hover text-foreground px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        <span>View Source Code</span>
                    </a>
                </div>
            </header>

            {/* Interactive Dashboard Layout Showcase (Stunning Dashboard Preview UI) */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 py-10 w-full z-10 relative">
                <div className="bg-card border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col gap-6 overflow-hidden">
                    {/* Mock Telemetry top-bar */}
                    <div className="flex items-center justify-between border-b border-card-border/80 pb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <span className="w-3.5 h-3.5 rounded-full bg-accent-green animate-pulse"></span>
                            <span className="text-xs font-extrabold uppercase tracking-widest text-foreground">TraceLM Active Console</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-muted-text">
                            <span className="bg-sidebar border border-sidebar-border px-2.5 py-1 rounded-full text-foreground shadow-sm">Avg Latency: <b className="text-accent-blue">240ms</b></span>
                            <span className="bg-sidebar border border-sidebar-border px-2.5 py-1 rounded-full text-foreground shadow-sm">RAG Hit Rate: <b className="text-accent-purple">98.4%</b></span>
                            <span className="bg-sidebar border border-sidebar-border px-2.5 py-1 rounded-full text-foreground shadow-sm">Success Rate: <b className="text-accent-green">100%</b></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Live Feature 1: PII Redaction Pipeline */}
                        <div className="bg-sidebar border border-sidebar-border rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-red">Security Middleware</span>
                                    <span className="text-[9px] bg-accent-red/10 border border-accent-red/20 text-accent-red px-2 py-0.5 rounded font-bold uppercase">Shield Active</span>
                                </div>
                                <h3 className="text-md font-bold text-foreground mb-2">Automated PII Masking</h3>
                                <p className="text-xs text-muted-text leading-relaxed font-semibold mb-4">Hybrid regex & LLM filters automatically redact sensitive client identifiers before reaching downstream providers.</p>
                            </div>
                            <div className="bg-card border border-card-border p-3.5 rounded-xl font-mono text-[10px] space-y-1">
                                <div className="text-muted-text">Input: <span className="text-foreground">"My email is alex@google.com and phone is 9988-77"</span></div>
                                <div className="text-accent-red font-bold">Trace: <span className="bg-accent-red/10 border border-accent-red/20 text-accent-red px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] font-black">PII REDACTED</span></div>
                            </div>
                        </div>

                        {/* Live Feature 2: Side-by-Side Model Compare */}
                        <div className="bg-sidebar border border-sidebar-border rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-purple">Evaluation Engine</span>
                                    <span className="text-[9px] bg-accent-purple/10 border border-accent-purple/20 text-accent-purple px-2 py-0.5 rounded font-bold uppercase">Compare Mode</span>
                                </div>
                                <h3 className="text-md font-bold text-foreground mb-2">Multi-Model Playground</h3>
                                <p className="text-xs text-muted-text leading-relaxed font-semibold mb-4">Compare Gemini, Gemma, and custom models side-by-side. Benchmark prompt quality, output tokens, and execution speeds.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-card border border-card-border p-2.5 rounded-xl text-center">
                                    <div className="text-[9px] font-bold text-primary font-mono truncate">Gemini 3.1 Flash</div>
                                    <div className="text-xs font-black text-foreground mt-1">140ms</div>
                                </div>
                                <div className="bg-card border border-card-border p-2.5 rounded-xl text-center">
                                    <div className="text-[9px] font-bold text-accent-purple font-mono truncate">Gemma 4 26B</div>
                                    <div className="text-xs font-black text-foreground mt-1">395ms</div>
                                </div>
                            </div>
                        </div>

                        {/* Live Feature 3: Vector RAG Retrieval */}
                        <div className="bg-sidebar border border-sidebar-border rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue">RAG Knowledge Base</span>
                                    <span className="text-[9px] bg-accent-blue/10 border border-accent-blue/20 text-accent-blue px-2 py-0.5 rounded font-bold uppercase">Active Vector</span>
                                </div>
                                <h3 className="text-md font-bold text-foreground mb-2">PDF Context Extraction</h3>
                                <p className="text-xs text-muted-text leading-relaxed font-semibold mb-4">Upload PDF manuals to expand AI parameters. The matching pipeline chunks, tags, and injects records dynamically.</p>
                            </div>
                            <div className="bg-card border border-card-border p-3 flex items-center justify-between rounded-xl">
                                <span className="text-[10px] text-foreground font-bold truncate max-w-[120px]">handbook_2026.pdf</span>
                                <span className="text-[9px] text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full font-bold">READY</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Feature Deep-Dive Grid */}
            <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20 w-full z-10 relative">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">Comprehensive Multi-Agent Toolkit</h2>
                    <p className="text-muted-text text-md max-w-2xl mx-auto font-semibold">Everything you need to orchestrate observational workspaces, redact logs, manage memories, and execute automations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Item 1: Observatory Chat */}
                    <div className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-primary-glow border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Conversation Explorer</h3>
                        <p className="text-muted-text leading-relaxed text-sm font-medium">Dictate or type questions, stream responses, and track real-time inputs/outputs token allocations inside a clean workspace.</p>
                    </div>

                    {/* Item 2: Vector RAG Base */}
                    <div className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-primary-glow border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Knowledge Base Docs</h3>
                        <p className="text-muted-text leading-relaxed text-sm font-medium">Upload technical logs, team wikis, and PDF manuals. The server parses text chunks to inject context dynamically into LLM triggers.</p>
                    </div>

                    {/* Item 3: Memory Summary Store */}
                    <div className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-primary-glow border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Long-term Memory Store</h3>
                        <p className="text-muted-text leading-relaxed text-sm font-medium">Pin key conversations to write long-term memory digests. The system trims older context windows without losing important reference structures.</p>
                    </div>

                    {/* Item 4: Career Match Engine */}
                    <div className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-primary-glow border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Career Automation</h3>
                        <p className="text-muted-text leading-relaxed text-sm font-medium">Matches job boards postings to your resume. Creates matching scores based on skills, headline tags, and excluded keywords.</p>
                    </div>

                    {/* Item 5: Unified Job Boards Search */}
                    <div className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-primary-glow border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Unified Board Search</h3>
                        <p className="text-muted-text leading-relaxed text-sm font-medium">Search across multiple provider APIs via one dashboard. Apply remote filter toggles and bookmark listings Optimistically.</p>
                    </div>

                    {/* Item 6: Real-time Telemetry Charts */}
                    <div className="bg-card border border-card-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-primary-glow border border-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Telemetry Charts</h3>
                        <p className="text-muted-text leading-relaxed text-sm font-medium">Real-time health stats showing overall request metrics, latency trend over time, and provider frequency ratios.</p>
                    </div>
                </div>
            </section>

            {/* Platform call to action (CTA) */}
            <section className="border-t border-card-border bg-card/40 py-20 px-6 sm:px-8 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">Orchestrate Production LLM Observability</h2>
                    <p className="text-md text-muted-text mb-10 leading-relaxed font-semibold max-w-2xl mx-auto">Start exploring multi-provider trace logs, configure PII sanitization pipelines, and automate matching tasks today.</p>
                    <Link 
                        href="/login" 
                        className="bg-primary hover:bg-primary-hover text-background px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_4px_14px_0_var(--primary-glow)] hover:shadow-[0_6px_22px_0_var(--primary-glow)] hover:-translate-y-0.5 inline-block"
                    >
                        Access Telemetry Console
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-xs text-muted-text border-t border-card-border bg-card/60 relative z-10 font-bold uppercase tracking-wider">
                <p>TraceLM Observability Infrastructure platform. Built with Spring Boot & Next.js.</p>
            </footer>
        </div>
    );
}
