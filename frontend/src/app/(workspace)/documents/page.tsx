'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getDocuments, deleteDocument, uploadDocument } from '@/lib/api';
import { DocumentResponse } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

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
      case 'READY': return 'text-green-400 bg-green-400/10 border-green-500/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-500/20';
      case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-500/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f1115] overflow-y-auto">
      <header className="shrink-0 h-16 border-b border-gray-800/60 bg-[#111318]/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-8">
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center">
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents
        </h1>
      </header>

      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Knowledge Base</h2>
            <p className="text-gray-400">Upload PDF documents to expand your RAG retrieval context.</p>
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
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-center">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#111318]/50">
            <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No documents yet</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Upload your first PDF document. Supported size up to 25MB.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 px-6 py-2 rounded-xl transition-colors font-medium"
            >
              Select File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {documents.map(doc => (
              <Link 
                href={`/documents/${doc.id}`} 
                key={doc.id}
                className="group flex flex-col bg-[#161921] rounded-2xl border border-gray-800/60 p-5 hover:bg-[#1a1d27] hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors truncate">
                      {doc.fileName}
                    </h3>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Delete Document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 mb-6">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(doc.documentStatus)}`}>
                    {doc.documentStatus}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-800/60 mt-auto">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center" title="File Size">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <span className="flex items-center" title="Pages">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      {doc.pageCount || 0}
                    </span>
                  </div>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
