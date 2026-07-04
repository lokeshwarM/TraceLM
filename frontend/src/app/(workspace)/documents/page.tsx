'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getDocuments, deleteDocument, uploadDocument } from '@/lib/api';
import { DocumentResponse } from '@/lib/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds the 25MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedDoc = await uploadDocument(file);
      setDocuments(prev => [uploadedDoc, ...prev]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
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

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      {/* Page Header */}
      <header className="shrink-0 h-16 border-b border-card-border bg-card/85 backdrop-blur-md sticky top-0 z-10 flex items-center px-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center">
          <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Knowledge Base
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Context Directory</h2>
            <p className="text-muted-text text-sm font-medium">Upload custom PDF documents to inject RAG context into active conversations.</p>
          </div>
          <div>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-background px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_12px_var(--primary-glow)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {isUploading ? (
                <div className="w-5 h-5 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-xl p-5 text-center shadow-sm">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-card-border rounded-2xl bg-card-hover/20">
            <svg className="w-16 h-16 text-muted-text/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold text-foreground mb-1.5">No context uploaded</h3>
            <p className="text-muted-text text-sm max-w-sm mb-6 font-medium">
              Upload your first corporate handbook or technical PDF. System limits file size to 25MB.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-glow text-primary hover:bg-primary/20 border border-primary/25 px-5 py-2.5 rounded-xl transition-colors font-bold cursor-pointer text-sm"
            >
              Select PDF
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {documents.map(doc => (
              <Link 
                href={`/documents/${doc.id}`} 
                key={doc.id}
                className="group flex flex-col bg-card rounded-2xl border border-card-border p-5 hover:bg-card-hover hover:border-primary/25 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-accent-purple/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-md font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {doc.fileName}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="p-1.5 text-muted-text hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                    title="Delete Document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-muted-text mt-auto pt-4 border-t border-card-border/60">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider border uppercase ${getStatusColor(doc.documentStatus)}`}>
                    {doc.documentStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
