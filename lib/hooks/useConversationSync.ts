/**
 * Conversation Sync Hook
 * Automatically syncs localStorage conversations to database for logged-in users
 * Includes circuit breaker pattern to prevent blocking page loads on DB failures
 */

import { useEffect, useRef, useState } from 'react';
import {
  loadConversation,
  clearConversation,
  type ConversationState,
} from '@/lib/ai/conversation-persistence';

// Circuit breaker state
let dbFailureCount = 0;
let lastFailureTime = 0;
const MAX_FAILURES = 3;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

function isCircuitBreakerOpen(): boolean {
  if (dbFailureCount >= MAX_FAILURES) {
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    if (timeSinceLastFailure < CIRCUIT_BREAKER_TIMEOUT) {
      console.log('[ConversationSync] Circuit breaker open - skipping database call');
      return true;
    }
    // Reset after timeout
    dbFailureCount = 0;
  }
  return false;
}

function recordFailure(): void {
  dbFailureCount++;
  lastFailureTime = Date.now();
}

function recordSuccess(): void {
  dbFailureCount = 0;
}

// Helper to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = 2000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

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
      // Skip if circuit breaker is open
      if (isCircuitBreakerOpen()) {
        return;
      }

      try {
        const res = await fetchWithTimeout('/api/auth/session', {}, 2000);
        if (res.ok) {
          const session = await res.json();
          setSessionData({
            isAuthenticated: !!session?.user?.email,
            userId: session?.user?.email || null,
          });
          recordSuccess();
        }
      } catch (error) {
        // Session check failed - continue without auth (this is expected on cold start)
        // Silently fail - circuit breaker will prevent excessive retries
        recordFailure();
      }
    };

    checkSession();
  }, []);

  const hasMigrated = useRef(false);

  useEffect(() => {
    // Only run once when user becomes authenticated
    if (!sessionData.isAuthenticated || !sessionData.userId || hasMigrated.current) {
      return;
    }

    // Skip if circuit breaker is open
    if (isCircuitBreakerOpen()) {
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
        if (localConversation.userId === sessionData.userId) {
          console.log('Conversation already associated with user');
          return;
        }

        console.log('Migrating conversation to database...', {
          sessionId: localConversation.sessionId,
          messageCount: localConversation.messages.length,
        });

        // Migrate to database with timeout
        const response = await fetchWithTimeout(
          '/api/ai/conversation/migrate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(localConversation),
          },
          3000 // 3 second timeout
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Migration failed');
        }

        const result = await response.json();
        console.log('Conversation migrated successfully:', result);
        recordSuccess();

        hasMigrated.current = true;
      } catch (error) {
        console.warn('[ConversationSync] Failed to migrate conversation (continuing with localStorage):', 
          error instanceof Error ? error.message : 'Unknown error');
        recordFailure();
        // Don't throw - allow app to continue working with localStorage
      }
    };

    migrateConversation();
  }, [sessionData.isAuthenticated, sessionData.userId]);

  return {
    isAuthenticated: sessionData.isAuthenticated,
    userId: sessionData.userId,
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
  const conversationRef = useRef<ConversationState | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const SYNC_INTERVAL = 60000; // 60 seconds (increased from 30s for performance)

  // Update conversation ref without triggering re-render
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Skip if circuit breaker is open
    if (isCircuitBreakerOpen()) {
      return;
    }

    const syncToDatabase = async () => {
      const currentConversation = conversationRef.current;

      if (!currentConversation || currentConversation.messages.length === 0) {
        return;
      }

      const now = Date.now();

      // Throttle syncs to every 60 seconds
      if (now - lastSyncRef.current < SYNC_INTERVAL) {
        return;
      }

      try {
        await fetchWithTimeout(
          '/api/ai/conversation/migrate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentConversation),
          },
          3000 // 3 second timeout
        );

        lastSyncRef.current = now;
        recordSuccess();
      } catch (error) {
        console.warn('[ConversationSync] Failed to sync conversation (using localStorage):',
          error instanceof Error ? error.message : 'Unknown error');
        recordFailure();
        // Fail silently - localStorage is still working
      }
    };

    // Only sync if we haven't synced recently
    const timeSinceLastSync = Date.now() - lastSyncRef.current;
    if (timeSinceLastSync >= SYNC_INTERVAL) {
      syncToDatabase();
    }

    // Set up periodic sync only once
    if (!intervalRef.current) {
      intervalRef.current = setInterval(syncToDatabase, SYNC_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]); // Only depend on isAuthenticated, not conversation
}
