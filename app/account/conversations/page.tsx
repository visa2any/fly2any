/**
 * Account Conversations Page
 * Displays user's AI conversation history
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ConversationHistoryWrapper } from '@/components/ai/ConversationHistoryWrapper';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force Node.js runtime for auth
export const runtime = 'nodejs';

// Note: dynamic = 'force-dynamic' removed for mobile build compatibility
// Mobile apps will handle auth client-side

export const metadata = {
  title: 'Conversation History | Fly2Any',
  description: 'View your past conversations with our AI travel assistants',
};

export default async function ConversationsPage() {
  // Check authentication
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/account/conversations');
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header - Level 6 Mobile */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 md:rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">AI Conversations</h1>
            <p className="text-white/80 text-sm mt-0.5">Chat history with travel assistants</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-0 md:px-0">
        <ConversationHistoryWrapper />
      </div>
    </div>
  );
}
