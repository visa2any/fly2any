/**
 * Conversation Sync Hook
 * Automatically syncs localStorage conversations to database for logged-in users
 */

import { useEffect, useRef, useState } from 'react';
import {
  loadConversation,
  clearConversation,
  type ConversationState,
} from '@/lib/ai/conversation-persistence';

export function useConversationSync() {
  const [sessionData, setSessionData] = useState<{
    isAuthenticated: boolean;
    userId: string | null;
  }>({
    isAuthenticated: false,
    userId: null,
  });

  // Try to use NextAuth session if available
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { useSession } = await import('next-auth/react');

        // This won't work with hooks, so we'll use fetch instead
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const session = await res.json();
          setSessionData({
            isAuthenticated: !!session?.user?.email,
            userId: session?.user?.email || null,
          });
        }
      } catch (error) {
        // NextAuth not available or not configured
        console.debug('Session check not available');
      }
    };

    checkSession();
  }, []);

  const hasMigrated = useRef(false);

  useEffect(() => {
    // Only run once when user becomes authenticated
    if (!isAuthenticated || !userId || hasMigrated.current) {
      return;
    }

    const migrateConversation = async () => {
      try {
        // Load conversation from localStorage
        const localConversation = loadConversation();

        if (!localConversation || localConversation.messages.length === 0) {
          console.log('No conversation to migrate');
          return;
        }

        // Check if already associated with this user
        if (localConversation.userId === userId) {
          console.log('Conversation already associated with user');
          return;
        }

        console.log('Migrating conversation to database...', {
          sessionId: localConversation.sessionId,
          messageCount: localConversation.messages.length,
        });

        // Migrate to database
        const response = await fetch('/api/ai/conversation/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(localConversation),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Migration failed');
        }

        const result = await response.json();
        console.log('Conversation migrated successfully:', result);

        // Clear localStorage after successful migration
        // Note: We don't clear it to allow seamless continuation in current session
        // clearConversation();

        hasMigrated.current = true;
      } catch (error) {
        console.error('Failed to migrate conversation:', error);
        // Don't throw - allow app to continue working
      }
    };

    migrateConversation();
  }, [isAuthenticated, userId]);

  return {
    isAuthenticated,
    userId,
  };
}

/**
 * Hook to save conversation to database for logged-in users
 */
export function useDatabaseSync(
  conversation: ConversationState | null,
  isAuthenticated: boolean
) {
  const lastSyncRef = useRef<number>(0);
  const SYNC_INTERVAL = 30000; // 30 seconds

  useEffect(() => {
    if (!isAuthenticated || !conversation) {
      return;
    }

    const syncToDatabase = async () => {
      const now = Date.now();

      // Throttle syncs to every 30 seconds
      if (now - lastSyncRef.current < SYNC_INTERVAL) {
        return;
      }

      try {
        await fetch('/api/ai/conversation/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conversation),
        });

        lastSyncRef.current = now;
      } catch (error) {
        console.error('Failed to sync conversation to database:', error);
        // Fail silently - localStorage is still working
      }
    };

    // Sync on mount
    syncToDatabase();

    // Set up periodic sync
    const interval = setInterval(syncToDatabase, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [conversation, isAuthenticated]);
}
