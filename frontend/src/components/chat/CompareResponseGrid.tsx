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
        <div key={i} className="flex flex-col bg-[#1a1d27] border border-gray-700/50 rounded-2xl overflow-hidden shadow-lg flex-1 transition-all duration-300">
          <div className="flex flex-col border-b border-gray-800/80 bg-[#13151b] p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-blue-400 font-mono font-bold tracking-tight bg-blue-500/10 px-2.5 py-1 rounded-md truncate max-w-[65%]">
                {resp.model}
              </span>
              {resp.status === 'SUCCESS' && (
                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-bold tracking-wide shrink-0">SUCCESS</span>
              )}
              {resp.status === 'FAILED' && (
                <span className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-0.5 rounded-full font-bold tracking-wide shrink-0">FAILED</span>
              )}
              {resp.status === 'STREAMING' && (
                <span className="text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-0.5 rounded-full font-bold tracking-wide animate-pulse shrink-0">STREAMING</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
              {resp.latencyMs !== undefined && <span>{(resp.latencyMs / 1000).toFixed(2)}s</span>}
              {resp.latencyMs !== undefined && resp.outputTokens !== undefined && <span className="opacity-50">•</span>}
              {resp.outputTokens !== undefined && <span>{resp.outputTokens} tokens</span>}
              {resp.createdAt && (
                  <>
                      <span className="opacity-50">•</span>
                      <span>{new Date(resp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
              )}
            </div>
          </div>
          
          <div className="p-5 text-sm leading-relaxed text-gray-200 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {resp.status === 'FAILED' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <svg className="w-10 h-10 text-red-400/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-gray-300 font-semibold mb-2">Response Failed</span>
                    <span className="text-xs text-red-400/80 max-w-[80%] mx-auto">{resp.content.replace('[Error: ', '').replace(']', '') || 'An unknown upstream error occurred.'}</span>
                </div>
            ) : (
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-3 text-white" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-3 text-white" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-3 mb-2 text-white" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                    code: ({ node, className, children, ...props }: any) => {
                      const isInline = !String(children).includes('\n');
                      if (isInline) {
                        return <code className="bg-[#0f1115] border border-gray-800/80 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[0.8em]" {...props}>{children}</code>;
                      }
                      return (
                        <div className="bg-[#0f1115] rounded-xl p-4 overflow-x-auto my-4 border border-gray-800/80 shadow-inner">
                          <code className="font-mono text-[0.85em] text-gray-300 leading-normal whitespace-pre" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    },
                    a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2" {...props} target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {normalizeResponse(resp.content || '')}
                </ReactMarkdown>
            )}
          </div>
        </div>
      ))}

      {skeletonModels.map((model, i) => (
        <div key={`skeleton-${i}`} className="flex flex-col bg-[#1a1d27] border border-gray-700/50 rounded-2xl overflow-hidden shadow-lg flex-1 animate-pulse">
          <div className="flex flex-col border-b border-gray-800/80 bg-[#13151b] p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-mono font-bold tracking-tight bg-gray-800/50 px-2.5 py-1 rounded-md truncate max-w-[65%]">
                {model}
              </span>
              <span className="text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-0.5 rounded-full font-bold tracking-wide shrink-0">LOADING</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-600 font-medium">
                <div className="h-3 w-20 bg-gray-800/80 rounded"></div>
            </div>
          </div>
          <div className="p-5 space-y-4">
             <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
             <div className="h-4 bg-gray-800/50 rounded w-full"></div>
             <div className="h-4 bg-gray-800/50 rounded w-5/6"></div>
             <div className="h-4 bg-gray-800/50 rounded w-full"></div>
             <div className="h-4 bg-gray-800/50 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
