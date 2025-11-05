/**
 * Conversation History Wrapper
 * Client component that wraps ConversationHistory and handles navigation/interactions
 */

'use client';

import { useRouter } from 'next/navigation';
import { ConversationHistory } from './ConversationHistory';
import type { ConversationState } from '@/lib/ai/conversation-persistence';
import { saveConversation } from '@/lib/ai/conversation-persistence';

export function ConversationHistoryWrapper() {
  const router = useRouter();

  const handleResumeConversation = (conversation: ConversationState) => {
    try {
      // Save to localStorage for immediate access
      saveConversation(conversation);

      // Navigate to home page where AI assistant is
      router.push('/?resume=true');
    } catch (error) {
      console.error('Failed to resume conversation:', error);
      alert('Failed to resume conversation. Please try again.');
    }
  };

  const handleViewConversation = (conversation: ConversationState) => {
    try {
      // Save to localStorage for viewing
      saveConversation(conversation);

      // Navigate to home page to view the conversation
      router.push('/?view=true');
    } catch (error) {
      console.error('Failed to view conversation:', error);
      alert('Failed to view conversation. Please try again.');
    }
  };

  return (
    <ConversationHistory
      onResumeConversation={handleResumeConversation}
      onViewConversation={handleViewConversation}
      compact={false}
      initialLimit={20}
    />
  );
}
