'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Hover3DCard } from '@/components/animations/Hover3DCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function WorkspaceHubPage() {
  return (
    <div className="flex-1 w-full h-full min-h-screen bg-background relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start pt-16 pb-20 px-6 sm:px-12">
      
      {/* Background Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-glow/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/20 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
          TraceLM <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple">Workspace</span>
        </h1>
        <p className="text-muted-text text-lg font-semibold max-w-xl mx-auto">
          Select a module to launch your observability tools and manage active pipelines.
        </p>
      </motion.div>

      {/* Magic Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl z-10"
      >
        
        {/* Large Feature 1: Chat Explorer (Spans 2 cols, 2 rows) */}
        <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2 h-[300px] md:h-[420px]">
          <Link href="/chat" className="block w-full h-full outline-none">
            <Hover3DCard intensity={15} className="w-full h-full">
              <div className="w-full h-full bg-card border border-primary/30 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group hover:shadow-[0_0_40px_rgba(var(--primary-glow-rgb),0.3)] transition-shadow duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-8 right-8 w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 text-primary group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">Conversation Explorer</h2>
                  <p className="text-muted-text font-medium text-lg leading-relaxed max-w-md">Interact with models, trace reasoning paths, and track latency metrics in real-time.</p>
                </div>
              </div>
            </Hover3DCard>
          </Link>
        </motion.div>

        {/* Feature 2: Knowledge Base (Spans 2 cols) */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 h-[200px]">
          <Link href="/documents" className="block w-full h-full outline-none">
            <Hover3DCard intensity={10} className="w-full h-full">
              <div className="w-full h-full bg-card border border-card-border rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group hover:border-accent-purple/50 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 bg-accent-purple/10 rounded-2xl flex items-center justify-center border border-accent-purple/20 text-accent-purple shrink-0 group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-accent-purple transition-colors">Knowledge Docs (RAG)</h2>
                    <p className="text-muted-text font-medium">Upload and vectorize PDFs for context injection.</p>
                  </div>
                </div>
              </div>
            </Hover3DCard>
          </Link>
        </motion.div>

        {/* Feature 3: Memory Store (Spans 1 col) */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 h-[200px]">
          <Link href="/memory" className="block w-full h-full outline-none">
            <Hover3DCard intensity={8} className="w-full h-full">
              <div className="w-full h-full bg-card border border-card-border rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-accent-blue/50 transition-colors duration-500">
                <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center border border-accent-blue/20 text-accent-blue mb-4 group-hover:-translate-y-1 transition-transform duration-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-accent-blue transition-colors mb-1">Memory Store</h2>
                <p className="text-muted-text text-sm font-medium">Long-term context.</p>
              </div>
            </Hover3DCard>
          </Link>
        </motion.div>

        {/* Feature 4: Telemetry (Spans 1 col) */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 h-[200px]">
          <Link href="/dashboard" className="block w-full h-full outline-none">
            <Hover3DCard intensity={8} className="w-full h-full">
              <div className="w-full h-full bg-card border border-card-border rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-accent-red/50 transition-colors duration-500">
                <div className="w-12 h-12 bg-accent-red/10 rounded-xl flex items-center justify-center border border-accent-red/20 text-accent-red mb-4 group-hover:-translate-y-1 transition-transform duration-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-accent-red transition-colors mb-1">Telemetry Charts</h2>
                <p className="text-muted-text text-sm font-medium">Observability stats.</p>
              </div>
            </Hover3DCard>
          </Link>
        </motion.div>

        {/* Feature 5: Automations (Spans 4 cols) */}
        <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-4 h-[160px]">
          <Link href="/automation" className="block w-full h-full outline-none">
            <Hover3DCard intensity={5} className="w-full h-full">
              <div className="w-full h-full bg-card border border-card-border rounded-3xl p-6 md:px-10 flex items-center justify-between relative overflow-hidden group hover:border-accent-green/50 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-l from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-14 h-14 bg-accent-green/10 rounded-2xl flex items-center justify-center border border-accent-green/20 text-accent-green shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1 group-hover:text-accent-green transition-colors">Automations & Workflows</h2>
                    <p className="text-muted-text font-medium">Trigger agents, career matches, and custom pipelines.</p>
                  </div>
                </div>
                <div className="hidden sm:flex text-accent-green opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </Hover3DCard>
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}
