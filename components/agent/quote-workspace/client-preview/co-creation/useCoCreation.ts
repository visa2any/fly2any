"use client";

import { useState, useCallback, useMemo } from "react";
import {
  CoCreationState,
  CoCreationStats,
  ClientSuggestion,
  ReactionType,
} from "./types";

/**
 * CO-CREATION STATE HOOK
 *
 * Design Principles:
 * - Agent control: suggestions NEVER auto-apply
 * - Minimal state: no notification spam
 * - Optimistic UI: instant feedback
 * - Persistence-ready: can sync to backend
 */

interface UseCoCreationOptions {
  quoteId: string;
  clientId?: string;
  clientName?: string;
  isClientMode?: boolean;
  onSyncToServer?: (action: string, data: any) => Promise<void>;
}

export function useCoCreation({
  quoteId,
  clientId = "guest",
  clientName = "Guest",
  isClientMode = false,
  onSyncToServer,
}: UseCoCreationOptions) {
  const [state, setState] = useState<CoCreationState>({
    reactions: {},
    suggestions: [],
    isClientMode,
    showSuggestionInput: null,
    unreadCount: 0,
  });

  // ========== CLIENT ACTIONS ==========

  const react = useCallback(
    (itemId: string, type: ReactionType | null) => {
      setState((prev) => {
        const newReactions = { ...prev.reactions };
        if (type === null) {
          delete newReactions[itemId];
        } else {
          newReactions[itemId] = type;
        }
        return { ...prev, reactions: newReactions };
      });

      // Sync to server (non-blocking)
      onSyncToServer?.("reaction", { quoteId, itemId, type, clientId });
    },
    [quoteId, clientId, onSyncToServer]
  );

  const openSuggestionInput = useCallback((itemId: string) => {
    setState((prev) => ({ ...prev, showSuggestionInput: itemId }));
  }, []);

  const closeSuggestionInput = useCallback(() => {
    setState((prev) => ({ ...prev, showSuggestionInput: null }));
  }, []);

  const submitSuggestion = useCallback(
    (suggestion: Omit<ClientSuggestion, "id" | "timestamp" | "status">) => {
      const newSuggestion: ClientSuggestion = {
        ...suggestion,
        id: `sug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      setState((prev) => ({
        ...prev,
        suggestions: [...prev.suggestions, newSuggestion],
        showSuggestionInput: null,
        unreadCount: prev.unreadCount + 1,
      }));

      // Sync to server
      onSyncToServer?.("suggestion", { quoteId, suggestion: newSuggestion });
    },
    [quoteId, onSyncToServer]
  );

  // ========== AGENT ACTIONS ==========

  const acknowledgeSuggestion = useCallback(
    (id: string, response?: string) => {
      setState((prev) => ({
        ...prev,
        suggestions: prev.suggestions.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "acknowledged" as const,
                agentResponse: response,
                agentResponseAt: new Date().toISOString(),
              }
            : s
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      onSyncToServer?.("acknowledge", { quoteId, suggestionId: id, response });
    },
    [quoteId, onSyncToServer]
  );

  const applySuggestion = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        suggestions: prev.suggestions.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "applied" as const,
                agentResponseAt: new Date().toISOString(),
              }
            : s
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      onSyncToServer?.("apply", { quoteId, suggestionId: id });
    },
    [quoteId, onSyncToServer]
  );

  const declineSuggestion = useCallback(
    (id: string, response: string) => {
      setState((prev) => ({
        ...prev,
        suggestions: prev.suggestions.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "declined" as const,
                agentResponse: response,
                agentResponseAt: new Date().toISOString(),
              }
            : s
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      onSyncToServer?.("decline", { quoteId, suggestionId: id, response });
    },
    [quoteId, onSyncToServer]
  );

  const markAllRead = useCallback(() => {
    setState((prev) => ({ ...prev, unreadCount: 0 }));
  }, []);

  // ========== COMPUTED STATS ==========

  const stats = useMemo<CoCreationStats>(() => {
    const reactionValues = Object.values(state.reactions);
    return {
      totalReactions: reactionValues.length,
      loved: reactionValues.filter((r) => r === "love").length,
      suggestions: state.suggestions.length,
      pending: state.suggestions.filter((s) => s.status === "pending").length,
    };
  }, [state.reactions, state.suggestions]);

  // ========== HELPERS ==========

  const getReaction = useCallback(
    (itemId: string) => state.reactions[itemId],
    [state.reactions]
  );

  const getSuggestionsForItem = useCallback(
    (itemId: string) => state.suggestions.filter((s) => s.itemId === itemId),
    [state.suggestions]
  );

  const hasPendingSuggestions = useMemo(
    () => state.suggestions.some((s) => s.status === "pending"),
    [state.suggestions]
  );

  return {
    // State
    state,
    stats,
    isClientMode,

    // Client actions
    react,
    openSuggestionInput,
    closeSuggestionInput,
    submitSuggestion,

    // Agent actions
    acknowledgeSuggestion,
    applySuggestion,
    declineSuggestion,
    markAllRead,

    // Helpers
    getReaction,
    getSuggestionsForItem,
    hasPendingSuggestions,
  };
}

export type CoCreationReturn = ReturnType<typeof useCoCreation>;
