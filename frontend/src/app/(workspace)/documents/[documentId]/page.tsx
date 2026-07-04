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
      case 'READY': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'PROCESSING': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'FAILED': return 'text-accent-red bg-accent-red/10 border-accent-red/20';
      default: return 'text-muted-text bg-sidebar border-sidebar-border';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Document not found</h2>
        <p className="text-muted-text mb-6 text-sm">{error || 'This document does not exist or has been deleted.'}</p>
        <Link href="/documents" className="bg-card hover:bg-card-hover border border-card-border text-foreground px-5 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-sm">
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
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      {/* Header bar */}
      <header className="shrink-0 h-16 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href="/documents" className="mr-4 text-muted-text hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-md font-bold text-foreground truncate max-w-xl">
            {document.fileName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2.5 bg-accent-red/10 hover:bg-accent-red/20 text-xs font-bold text-accent-red rounded-xl transition-all border border-accent-red/20 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Document</span>
          </button>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
        <div className="bg-card rounded-2xl border border-card-border p-8 shadow-sm">
          {/* Metadata details block */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 pb-8 border-b border-card-border">
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Uploaded On</h2>
              <p className="text-sm font-semibold text-foreground">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Status</h2>
              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border inline-block ${getStatusColor(document.documentStatus)}`}>
                {document.documentStatus}
              </span>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">File Size</h2>
              <p className="text-sm font-semibold text-foreground flex items-center">
                {formatFileSize(document.fileSize)}
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Page Count</h2>
              <p className="text-sm font-semibold text-foreground">
                {document.pageCount || 0}
              </p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1.5">Chunk Count</h2>
              <p className="text-sm font-semibold text-foreground">
                {document.chunkCount || 0}
              </p>
            </div>
          </div>

          {/* Reader preview block */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Extracted Text Preview</h2>
              {hasMoreText && (
                <button 
                  onClick={() => setShowFullText(!showFullText)}
                  className="text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  {showFullText ? 'Collapse Preview' : 'View Full Text'}
                </button>
              )}
            </div>
            
            <div className="bg-sidebar rounded-xl p-6 border border-card-border relative">
              <div className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto">
                {textToDisplay || <span className="text-muted-text italic">No text could be extracted from this document.</span>}
                {!showFullText && hasMoreText && (
                  <span className="text-muted-text">...</span>
                )}
              </div>
              
              {!showFullText && hasMoreText && (
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-sidebar to-transparent pointer-events-none rounded-b-xl"></div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
