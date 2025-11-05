/**
 * React Hook for AI Session Management
 *
 * Provides easy access to session tracking, conversation management,
 * and progressive authentication triggers.
 *
 * @example
 * ```tsx
 * function AIChat() {
 *   const {
 *     session,
 *     loading,
 *     error,
 *     incrementConversation,
 *     upgradeSession,
 *     shouldShowAuthPrompt,
 *     authPromptMessage
 *   } = useAISession();
 *
 *   const handleMessage = async (message: string) => {
 *     await incrementConversation();
 *
 *     if (shouldShowAuthPrompt) {
 *       toast.info(authPromptMessage);
 *     }
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserSession } from '@/lib/ai/auth-strategy';
import { getEngagementStage, shouldRequireAuth } from '@/lib/ai/auth-strategy';

interface UseAISessionOptions {
  /**
   * Auto-initialize session on mount
   * @default true
   */
  autoInit?: boolean;

  /**
   * Current action being performed (for auth triggers)
   * @default 'ask-question'
   */
  currentAction?: string;

  /**
   * Language for auth messages
   * @default 'en'
   */
  language?: 'en' | 'pt' | 'es';
}

interface UseAISessionReturn {
  /**
   * Current session data
   */
  session: UserSession | null;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error state
   */
  error: Error | null;

  /**
   * Increment conversation count
   */
  incrementConversation: () => Promise<void>;

  /**
   * Update session activity without incrementing
   */
  updateActivity: () => Promise<void>;

  /**
   * Upgrade session to authenticated user
   */
  upgradeSession: (userId: string, email: string, name: string) => Promise<void>;

  /**
   * Delete current session (GDPR right to be forgotten)
   */
  deleteSession: () => Promise<void>;

  /**
   * Refresh session data
   */
  refreshSession: () => Promise<void>;

  /**
   * Whether to show auth prompt based on engagement
   */
  shouldShowAuthPrompt: boolean;

  /**
   * Auth prompt message to show user
   */
  authPromptMessage: string;

  /**
   * Whether current action requires immediate auth
   */
  requiresAuth: boolean;

  /**
   * Engagement stage
   */
  engagementStage: 'anonymous' | 'interested' | 'engaged' | 'converting';

  /**
   * Can continue without auth
   */
  canContinueAsGuest: boolean;
}

export function useAISession(options: UseAISessionOptions = {}): UseAISessionReturn {
  const {
    autoInit = true,
    currentAction = 'ask-question',
    language = 'en'
  } = options;

  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(autoInit);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize or retrieve session
   */
  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/session?ip=current');

      if (!response.ok) {
        throw new Error(`Failed to initialize session: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize session');
      }

      setSession(data.session);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('[useAISession] Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Increment conversation count
   */
  const incrementConversation = useCallback(async () => {
    if (!session) {
      console.warn('[useAISession] No session to increment');
      return;
    }

    try {
      const response = await fetch('/api/ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'increment',
          sessionId: session.sessionId,
          incrementConversation: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to increment conversation: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to increment conversation');
      }

      setSession(data.session);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('[useAISession] Increment error:', error);
      // Don't set error state for non-critical failures
    }
  }, [session]);

  /**
   * Update session activity without incrementing
   */
  const updateActivity = useCallback(async () => {
    if (!session) {
      console.warn('[useAISession] No session to update');
      return;
    }

    try {
      const response = await fetch('/api/ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          sessionId: session.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update activity: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update activity');
      }

      setSession(data.session);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('[useAISession] Update error:', error);
    }
  }, [session]);

  /**
   * Upgrade session to authenticated user
   */
  const upgradeSession = useCallback(async (
    userId: string,
    email: string,
    name: string
  ) => {
    if (!session) {
      console.warn('[useAISession] No session to upgrade');
      return;
    }

    try {
      const response = await fetch('/api/ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upgrade',
          sessionId: session.sessionId,
          userId,
          email,
          name
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to upgrade session: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upgrade session');
      }

      setSession(data.session);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('[useAISession] Upgrade error:', error);
      throw error; // Re-throw for caller to handle
    }
  }, [session]);

  /**
   * Delete current session (GDPR)
   */
  const deleteSession = useCallback(async () => {
    if (!session) {
      console.warn('[useAISession] No session to delete');
      return;
    }

    try {
      const response = await fetch(`/api/ai/session?sessionId=${session.sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete session');
      }

      setSession(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('[useAISession] Delete error:', error);
      throw error;
    }
  }, [session]);

  /**
   * Refresh session data
   */
  const refreshSession = useCallback(async () => {
    if (!session) {
      await initSession();
      return;
    }

    try {
      const response = await fetch(`/api/ai/session?sessionId=${session.sessionId}`);

      if (!response.ok) {
        throw new Error(`Failed to refresh session: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh session');
      }

      setSession(data.session);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('[useAISession] Refresh error:', error);
    }
  }, [session, initSession]);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    if (autoInit) {
      initSession();
    }
  }, [autoInit, initSession]);

  /**
   * Calculate engagement and auth triggers
   */
  const engagement = session ? getEngagementStage(session, currentAction) : null;
  const authTrigger = shouldRequireAuth(currentAction);

  return {
    session,
    loading,
    error,
    incrementConversation,
    updateActivity,
    upgradeSession,
    deleteSession,
    refreshSession,
    shouldShowAuthPrompt: engagement?.showAuthPrompt || false,
    authPromptMessage: engagement?.promptMessage || '',
    requiresAuth: authTrigger.requiresAuth,
    engagementStage: engagement?.stage || 'anonymous',
    canContinueAsGuest: !authTrigger.requiresAuth
  };
}

/**
 * Hook for checking if specific action requires auth
 */
export function useAuthRequired(action: string) {
  const authTrigger = shouldRequireAuth(action);

  return {
    requiresAuth: authTrigger.requiresAuth,
    urgency: authTrigger.urgency,
    reason: authTrigger.reason
  };
}

/**
 * Hook for session statistics (admin only)
 */
export function useSessionStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/session');

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.stats);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('[useSessionStats] Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}
