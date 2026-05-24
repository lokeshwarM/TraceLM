import React from 'react';
import { ConversationResponse } from '@/lib/types';

interface ConversationSidebarProps {
  conversations: ConversationResponse[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({ conversations, activeId, onSelect, onNewChat }: ConversationSidebarProps) {
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
      
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Recent
        </div>
        <div className="space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-colors truncate ${
                activeId === conv.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-400 hover:bg-[#1a1d27] hover:text-gray-200 border border-transparent'
              }`}
            >
              {conv.title || 'New Conversation'}
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
