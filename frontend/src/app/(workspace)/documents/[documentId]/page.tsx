'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getDocument, deleteDocument } from '@/lib/api';
import { DocumentResponse } from '@/lib/types';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;
  
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    async function loadDocument() {
      try {
        const data = await getDocument(documentId);
        setDocument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    }
    loadDocument();
  }, [documentId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument(documentId);
      router.push('/documents');
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'READY': return 'text-green-400 bg-green-400/10 border-green-500/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
      case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f1115]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f1115] px-4 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Document not found</h2>
        <p className="text-gray-400 mb-6">{error || 'This document does not exist or you do not have permission to view it.'}</p>
        <Link href="/documents" className="bg-[#1a1d27] hover:bg-[#1a1d27]/80 text-white px-4 py-2 rounded-lg transition-colors">
          Back to Documents
        </Link>
      </div>
    );
  }

  const textToDisplay = showFullText 
    ? (document.extractedText || '') 
    : (document.extractedText?.substring(0, 1000) || '');
    
  const hasMoreText = (document.extractedText?.length || 0) > 1000;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f1115] overflow-y-auto">
      <header className="shrink-0 h-16 border-b border-gray-800/60 bg-[#111318]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href="/documents" className="mr-4 text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-white truncate max-w-xl">
            {document.fileName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 rounded-lg transition-colors border border-red-500/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
        <div className="bg-[#161921] rounded-2xl border border-gray-800/60 p-8 shadow-sm">
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-800/60 flex-wrap gap-y-6">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Uploaded On</h2>
              <p className="text-gray-200">{new Date(document.uploadedAt).toLocaleDateString()} at {new Date(document.uploadedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <div className="flex-1 min-w-[150px]">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</h2>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border inline-block ${getStatusColor(document.documentStatus)}`}>
                {document.documentStatus}
              </span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">File Size</h2>
              <p className="text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                {formatFileSize(document.fileSize)}
              </p>
            </div>
            <div className="flex-1 min-w-[150px]">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Page Count</h2>
              <p className="text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                {document.pageCount || 0}
              </p>
            </div>
            <div className="flex-1 min-w-[150px]">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chunk Count</h2>
              <p className="text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {document.chunkCount || 0}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Extracted Text Preview</h2>
              {hasMoreText && (
                <button 
                  onClick={() => setShowFullText(!showFullText)}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showFullText ? 'Collapse Text' : 'View Full Text'}
                </button>
              )}
            </div>
            
            <div className="bg-[#111318] rounded-xl p-6 border border-gray-800/40 relative">
              <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">
                {textToDisplay || <span className="text-gray-600 italic">No text could be extracted from this document.</span>}
                {!showFullText && hasMoreText && (
                  <span className="text-gray-500">...</span>
                )}
              </div>
              
              {!showFullText && hasMoreText && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#111318] to-transparent pointer-events-none rounded-b-xl"></div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
