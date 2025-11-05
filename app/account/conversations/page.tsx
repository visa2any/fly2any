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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Conversation History
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Review your past conversations with our AI travel assistants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ConversationHistoryWrapper />
      </div>
    </div>
  );
}
