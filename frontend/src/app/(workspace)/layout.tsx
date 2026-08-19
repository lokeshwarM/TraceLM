'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { WorkspaceLayout as Shell } from '@/components/layout/WorkspaceLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { WorkspaceLoader } from '@/components/animations/WorkspaceLoader';

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
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <WorkspaceLoader />
      </div>
    );
  }

  return (
    <Shell>
      <PageTransition>
        {children}
      </PageTransition>
    </Shell>
  );
}
