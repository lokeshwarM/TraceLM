'use client';

import { useParams } from 'next/navigation';
import { ChatView } from '@/components/chat/ChatView';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  return (
    <ChatView conversationId={conversationId} />
  );
}
