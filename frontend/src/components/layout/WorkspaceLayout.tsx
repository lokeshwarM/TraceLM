'use client';

import React from 'react';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex font-sans selection:bg-primary/30 relative">
      <div className="mesh-grid absolute inset-0 pointer-events-none opacity-40"></div>
      <ConversationSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 z-10 relative">
        {children}
      </div>
    </div>
  );
}

