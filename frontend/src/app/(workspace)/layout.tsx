'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { WorkspaceLayout as Shell } from '@/components/layout/WorkspaceLayout';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsReady(true);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // Block rendering (and API fetching) until auth is fully resolved and user is authenticated
  if (!isReady || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f1115]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm font-medium">Verifying workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Shell>
      {children}
    </Shell>
  );
}
