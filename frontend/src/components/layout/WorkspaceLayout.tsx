'use client';

import React from 'react';
import { ConversationSidebar } from '@/components/sidebar/ConversationSidebar';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[#0f1115] text-gray-200 flex font-sans selection:bg-blue-500/30">
      <ConversationSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0">
        {children}
      </div>
    </div>
  );
}
