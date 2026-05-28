'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0d0f15] text-white flex flex-col font-sans overflow-hidden">
            {/* Navigation */}
            <nav className="w-full flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg">T</div>
                    <span className="text-xl font-bold tracking-tight">TraceLM</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Sign in</Link>
                    <Link href="/login" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 max-w-4xl leading-tight">
                    Conversation Trace Explorer for Multi-Provider AI Systems
                </h1>
                
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
                    Build production-grade AI applications with complete observability. Monitor latency, track token usage, compare model outputs, and automatically sanitize PII across your entire LLM infrastructure.
                </p>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                        Start Exploring
                    </Link>
                    <a href="https://github.com/lokeshwarM/TraceLM" target="_blank" rel="noopener noreferrer" className="bg-[#161921] border border-gray-800 hover:border-gray-700 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        View GitHub
                    </a>
                </div>
            </main>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-8 py-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 border-t border-gray-800/50">
                {[
                    { title: 'Compare Mode', desc: 'Run prompts across multiple models simultaneously and compare their outputs, latency, and tokens side-by-side.' },
                    { title: 'PII Redaction', desc: 'Built-in hybrid regex & AI middleware pipeline that automatically sanitizes sensitive data before it reaches providers.' },
                    { title: 'Real-time Observability', desc: 'Monitor request states, view full conversation traces, and track context window usage with granular precision.' }
                ].map((feature, i) => (
                    <div key={i} className="bg-[#11131a] border border-gray-800 p-8 rounded-2xl hover:border-gray-700 transition-colors group">
                        <h3 className="text-xl font-bold mb-3 text-gray-200 group-hover:text-white transition-colors">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-sm text-gray-600 border-t border-gray-800/50">
                <p>Built with Spring Boot & Next.js. TraceLM AI Infrastructure Platform.</p>
            </footer>
        </div>
    );
}
