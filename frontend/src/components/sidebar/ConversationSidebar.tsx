import React from 'react';
import { ConversationResponse } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ConversationSidebarProps {
  conversations: ConversationResponse[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({ conversations, activeId, onSelect, onNewChat }: ConversationSidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <aside className="w-64 bg-[#111318] border-r border-gray-800/60 flex flex-col h-full shrink-0">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors font-medium text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      <div className="px-3 pb-4 pt-1 border-b border-gray-800/60">
        <Link href="/chat" className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${!isDashboard ? 'bg-[#1a1d27] text-white border border-gray-700/50' : 'text-gray-400 hover:bg-[#1a1d27] hover:text-white border border-transparent'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chat</span>
        </Link>
        <Link href="/dashboard" className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isDashboard ? 'bg-[#1a1d27] text-white border border-gray-700/50' : 'text-gray-400 hover:bg-[#1a1d27] hover:text-white border border-transparent'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="font-medium">Dashboard</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
          Recent
        </div>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all duration-200 flex items-center group ${
                activeId === conv.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                  : 'text-gray-400 hover:bg-[#1a1d27] hover:text-gray-200 border border-transparent'
              }`}
            >
              <svg className={`w-4 h-4 mr-3 shrink-0 ${activeId === conv.id ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="block truncate">{conv.title || 'New Conversation'}</span>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="text-sm text-gray-600 text-center py-4 italic">
              No conversations yet
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
