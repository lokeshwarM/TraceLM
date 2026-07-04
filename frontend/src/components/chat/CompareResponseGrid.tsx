import React from 'react';
import ReactMarkdown from 'react-markdown';
import { normalizeResponse } from '@/lib/responseNormalizer';
import { CompareResponse } from './MessageList';

interface CompareResponseGridProps {
  responses: CompareResponse[];
  loadingModels?: string[];
}

export function CompareResponseGrid({ responses, loadingModels = [] }: CompareResponseGridProps) {
  const respondedModels = responses.map(r => r.model);
  const skeletonModels = loadingModels.filter(m => !respondedModels.includes(m));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {responses.map((resp, i) => (
        <div key={i} className="flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          {/* Card Header Info */}
          <div className="flex flex-col border-b border-card-border bg-card-hover p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-primary font-mono font-bold tracking-tight bg-primary-glow border border-primary/10 px-2.5 py-1.5 rounded-md truncate max-w-[65%]">
                {resp.model}
              </span>
              {resp.status === 'SUCCESS' && (
                <span className="text-[9px] text-accent-green bg-accent-green/10 border border-accent-green/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider shrink-0 uppercase">SUCCESS</span>
              )}
              {resp.status === 'FAILED' && (
                <span className="text-[9px] text-accent-red bg-accent-red/10 border border-accent-red/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider shrink-0 uppercase">FAILED</span>
              )}
              {resp.status === 'STREAMING' && (
                <span className="text-[9px] text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider animate-pulse shrink-0 uppercase">STREAMING</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-muted-text font-bold uppercase tracking-wider">
              {resp.latencyMs !== undefined && <span>{(resp.latencyMs / 1000).toFixed(2)}s</span>}
              {resp.latencyMs !== undefined && resp.outputTokens !== undefined && <span className="opacity-40">•</span>}
              {resp.outputTokens !== undefined && <span>{resp.outputTokens} tokens</span>}
              {resp.createdAt && (
                  <>
                      <span className="opacity-40">•</span>
                      <span>{new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
              )}
            </div>
          </div>
          
          {/* Response Text preview area */}
          <div className="p-5 text-sm leading-relaxed text-foreground/90 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
            {resp.status === 'FAILED' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-10 h-10 text-accent-red/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-foreground font-bold mb-1.5">Inference Failure</span>
                    <span className="text-[11px] text-accent-red bg-accent-red/10 border border-accent-red/20 px-3 py-2 rounded-lg max-w-[90%] mx-auto font-medium leading-normal">{resp.content.replace('[Error: ', '').replace(']', '') || 'An unknown upstream error occurred.'}</span>
                </div>
            ) : (
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-3 text-foreground" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-3 text-foreground" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-3 mb-2 text-foreground" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
                    code: ({ node, className, children, ...props }: any) => {
                      const isInline = !String(children).includes('\n');
                      if (isInline) {
                        return <code className="bg-card border border-card-border px-1.5 py-0.5 rounded text-accent-purple font-mono text-[0.85em]" {...props}>{children}</code>;
                      }
                      return (
                        <div className="bg-sidebar rounded-xl p-4 overflow-x-auto my-4 border border-card-border shadow-inner">
                          <code className="font-mono text-[0.85em] text-foreground leading-normal whitespace-pre" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    },
                    a: ({ node, ...props }) => <a className="text-accent-blue hover:text-accent-blue/80 font-semibold underline underline-offset-2" {...props} target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {normalizeResponse(resp.content || '')}
                </ReactMarkdown>
            )}
          </div>
        </div>
      ))}

      {/* Loading Skeleton cards */}
      {skeletonModels.map((model, i) => (
        <div key={`skeleton-${i}`} className="flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm flex-1 animate-pulse">
          <div className="flex flex-col border-b border-card-border bg-card-hover p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-text font-mono font-semibold bg-sidebar border border-sidebar-border px-2.5 py-1.5 rounded-md truncate max-w-[65%]">
                {model}
              </span>
              <span className="text-[9px] text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2.5 py-0.5 rounded-full font-bold tracking-wider shrink-0">LOADING</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-muted-text font-medium">
                <div className="h-3.5 w-20 bg-sidebar border border-sidebar-border rounded"></div>
            </div>
          </div>
          <div className="p-5 space-y-4">
             <div className="h-4 bg-sidebar rounded w-3/4"></div>
             <div className="h-4 bg-sidebar rounded w-full"></div>
             <div className="h-4 bg-sidebar rounded w-5/6"></div>
             <div className="h-4 bg-sidebar rounded w-full"></div>
             <div className="h-4 bg-sidebar rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
