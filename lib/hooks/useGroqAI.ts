/**
 * React Hook for Groq AI Integration
 * Provides AI enhancement for travel assistant with rate limit awareness
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TeamType } from '@/lib/ai/consultant-handoff';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIUsageStats {
  dailyCount: number;
  dailyLimit: number;
  dailyRemaining: number;
  minuteCount: number;
  minuteLimit: number;
  percentUsed: number;
  resetTime: string;
}

interface QueryAnalysis {
  intent: string;
  confidence: number;
  team: TeamType;
  entities: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    cabinClass?: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    preferences?: string[];
  };
  requiresAI: boolean;
  rawMessage: string;
}

interface RouterResponse {
  success: boolean;
  analysis: QueryAnalysis;
  aiResponse?: string;
  handoff?: {
    fromConsultant: string;
    toConsultant: string;
    transferAnnouncement: string;
    introduction: string;
    context?: string;
  };
  consultantInfo: {
    name: string;
    title: string;
    team: TeamType;
    emoji: string;
  };
  usage?: {
    dailyRemaining: number;
    percentUsed: number;
  };
  error?: string;
}

interface UseGroqAIOptions {
  enableAI?: boolean;
  minConfidenceThreshold?: number;
  onUsageUpdate?: (stats: AIUsageStats) => void;
}

export function useGroqAI(options: UseGroqAIOptions = {}) {
  const {
    enableAI = true,
    minConfidenceThreshold = 0.5,
    onUsageUpdate
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const previousTeamRef = useRef<TeamType | null>(null);
  const conversationHistoryRef = useRef<GroqMessage[]>([]);

  // Fetch usage stats on mount and periodically
  const fetchUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setUsageStats(data.stats);
          setIsRateLimited(data.stats.dailyRemaining === 0);
          onUsageUpdate?.(data.stats);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch AI usage stats:', error);
    }
  }, [onUsageUpdate]);

  useEffect(() => {
    fetchUsageStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchUsageStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchUsageStats]);

  /**
   * Route a query through the smart NLP + AI system
   */
  const routeQuery = useCallback(async (
    message: string,
    options: {
      customerName?: string;
      forceAI?: boolean;
    } = {}
  ): Promise<RouterResponse | null> => {
    if (!enableAI && !options.forceAI) {
      return null;
    }

    setIsProcessing(true);
    setLastError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          previousTeam: previousTeamRef.current,
          conversationHistory: conversationHistoryRef.current.slice(-6),
          customerName: options.customerName,
          useAI: enableAI
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process query');
      }

      const data: RouterResponse = await response.json();

      if (data.success) {
        // Update previous team for handoff tracking
        previousTeamRef.current = data.consultantInfo.team;

        // Update conversation history
        conversationHistoryRef.current.push({
          role: 'user',
          content: message
        });
        if (data.aiResponse) {
          conversationHistoryRef.current.push({
            role: 'assistant',
            content: data.aiResponse
          });
        }

        // Keep only last 10 messages
        if (conversationHistoryRef.current.length > 10) {
          conversationHistoryRef.current = conversationHistoryRef.current.slice(-10);
        }

        // Update usage stats
        if (data.usage) {
          setUsageStats(prev => prev ? {
            ...prev,
            dailyRemaining: data.usage!.dailyRemaining,
            percentUsed: data.usage!.percentUsed
          } : null);
        }
      } else if (data.error) {
        setLastError(data.error);
        if (data.error.includes('Rate limit')) {
          setIsRateLimited(true);
        }
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [enableAI]);

  /**
   * Generate an AI-enhanced response for a query
   * Only calls AI when NLP confidence is below threshold
   */
  const enhanceResponse = useCallback(async (
    message: string,
    nlpConfidence: number,
    options: {
      customerName?: string;
      searchResults?: any;
    } = {}
  ): Promise<string | null> => {
    // Skip AI if NLP is confident enough
    if (nlpConfidence >= minConfidenceThreshold) {
      return null;
    }

    // Skip if rate limited
    if (isRateLimited) {
      return null;
    }

    const result = await routeQuery(message, options);
    return result?.aiResponse || null;
  }, [minConfidenceThreshold, isRateLimited, routeQuery]);

  /**
   * Reset conversation context
   */
  const resetConversation = useCallback(() => {
    previousTeamRef.current = null;
    conversationHistoryRef.current = [];
  }, []);

  /**
   * Check if AI is available (not rate limited)
   */
  const isAIAvailable = useCallback(() => {
    return enableAI && !isRateLimited && (usageStats?.dailyRemaining ?? 0) > 0;
  }, [enableAI, isRateLimited, usageStats]);

  return {
    // State
    isProcessing,
    lastError,
    usageStats,
    isRateLimited,

    // Actions
    routeQuery,
    enhanceResponse,
    resetConversation,
    fetchUsageStats,

    // Utilities
    isAIAvailable,

    // For handoff tracking
    previousTeam: previousTeamRef.current,
    conversationHistory: conversationHistoryRef.current
  };
}

/**
 * Simplified hook for just checking AI availability
 */
export function useAIAvailability() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [remainingCalls, setRemainingCalls] = useState<number | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await fetch('/api/ai/chat');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stats) {
            setIsAvailable(data.stats.dailyRemaining > 0);
            setRemainingCalls(data.stats.dailyRemaining);
          }
        }
      } catch {
        setIsAvailable(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, remainingCalls };
}
