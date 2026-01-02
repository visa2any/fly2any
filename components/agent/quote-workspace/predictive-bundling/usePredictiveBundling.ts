"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuoteItems, useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { QuoteItem, ProductType } from "../types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE BUNDLING ENGINE
// Intelligent, helpful suggestions — NOT salesy or intrusive
// "A thoughtful assistant, not a salesperson"
// ═══════════════════════════════════════════════════════════════════════════════

export type SuggestionType =
  | "missing_hotel"
  | "missing_transfer"
  | "missing_car"
  | "missing_activity"
  | "add_experience"
  | "add_insurance"
  | "complete_package";

export type SuggestionPriority = "high" | "medium" | "low";

export interface BundleSuggestion {
  id: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  targetTab: ProductType;
  headline: string;
  reason: string;
  benefit: string;
  triggeredAt: number;
  expiresAt: number | null; // null = never expires
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTUAL COPY - Agent-first, helpful tone (NEVER salesy)
// ═══════════════════════════════════════════════════════════════════════════════

const SUGGESTION_COPY: Record<SuggestionType, {
  headline: string;
  reason: string;
  benefit: string;
}> = {
  missing_hotel: {
    headline: "Add Accommodation",
    reason: "Flight booked but no hotel yet",
    benefit: "Completes the itinerary",
  },
  missing_transfer: {
    headline: "Airport Transfer",
    reason: "International arrival needs connection",
    benefit: "Improves trip comfort",
  },
  missing_car: {
    headline: "Consider Rental Car",
    reason: "Multi-day trip without ground transport",
    benefit: "Freedom to explore",
  },
  missing_activity: {
    headline: "Add Experience",
    reason: "Clients expect memorable activities",
    benefit: "Creates lasting memories",
  },
  add_experience: {
    headline: "Popular Experiences",
    reason: "Top-rated activities for this destination",
    benefit: "Most clients add 1-2 tours",
  },
  add_insurance: {
    headline: "Travel Protection",
    reason: "International trip without coverage",
    benefit: "Peace of mind for travelers",
  },
  complete_package: {
    headline: "Complete Package",
    reason: "Add remaining essentials",
    benefit: "Ready-to-book itinerary",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE RULES (Deterministic + Heuristic)
// ═══════════════════════════════════════════════════════════════════════════════

interface TripContext {
  items: QuoteItem[];
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: { adults: number; children: number; infants: number; total: number };
  tripDays: number;
  isInternational: boolean;
  hasFlight: boolean;
  hasHotel: boolean;
  hasCar: boolean;
  hasActivity: boolean;
  hasTransfer: boolean;
  hasInsurance: boolean;
  lastAddedType: ProductType | null;
  lastAddedAt: number | null;
  secondsSinceLastAdd: number;
}

function buildTripContext(items: QuoteItem[], state: any): TripContext {
  const now = Date.now();
  const types = new Set(items.map((i) => i.type));

  // Calculate trip days
  let tripDays = 1;
  if (state.startDate && state.endDate) {
    const start = new Date(state.startDate);
    const end = new Date(state.endDate);
    tripDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Detect international (simple heuristic: different country codes)
  const flights = items.filter((i) => i.type === "flight");
  const isInternational = flights.some((f: any) => {
    const origin = f.originCode || f.details?.originCode || "";
    const dest = f.destinationCode || f.details?.destinationCode || "";
    return origin.slice(0, 2) !== dest.slice(0, 2); // Different country prefix
  });

  // Last added item
  const sortedByTime = [...items].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  const lastItem = sortedByTime[0];
  const lastAddedAt = lastItem ? new Date(lastItem.createdAt || 0).getTime() : null;
  const secondsSinceLastAdd = lastAddedAt ? (now - lastAddedAt) / 1000 : Infinity;

  return {
    items,
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
    travelers: state.travelers || { adults: 1, children: 0, infants: 0, total: 1 },
    tripDays,
    isInternational,
    hasFlight: types.has("flight"),
    hasHotel: types.has("hotel"),
    hasCar: types.has("car"),
    hasActivity: types.has("activity"),
    hasTransfer: types.has("transfer"),
    hasInsurance: types.has("insurance"),
    lastAddedType: lastItem?.type || null,
    lastAddedAt,
    secondsSinceLastAdd,
  };
}

// Rule evaluation - returns suggestions based on trip context
function evaluateRules(ctx: TripContext): BundleSuggestion[] {
  const suggestions: BundleSuggestion[] = [];
  const now = Date.now();

  // RULE 1: Flight added, no hotel - show after 5 seconds (quick but not instant)
  if (ctx.hasFlight && !ctx.hasHotel && ctx.secondsSinceLastAdd >= 5) {
    suggestions.push({
      id: "missing_hotel",
      type: "missing_hotel",
      priority: "high",
      targetTab: "hotel",
      ...SUGGESTION_COPY.missing_hotel,
      triggeredAt: now,
      expiresAt: null,
    });
  }

  // RULE 2: International flight, no transfer
  if (ctx.hasFlight && ctx.isInternational && !ctx.hasTransfer) {
    suggestions.push({
      id: "missing_transfer",
      type: "missing_transfer",
      priority: "medium",
      targetTab: "transfer",
      ...SUGGESTION_COPY.missing_transfer,
      triggeredAt: now,
      expiresAt: null,
    });
  }

  // RULE 3: Multi-day trip (3+), no car, no activities
  if (ctx.tripDays >= 3 && !ctx.hasCar && ctx.hasHotel && !ctx.hasActivity) {
    suggestions.push({
      id: "missing_car",
      type: "missing_car",
      priority: "low",
      targetTab: "car",
      ...SUGGESTION_COPY.missing_car,
      triggeredAt: now,
      expiresAt: null,
    });
  }

  // RULE 4: Hotel booked, no activities, 10+ seconds elapsed
  if (ctx.hasHotel && !ctx.hasActivity && ctx.secondsSinceLastAdd >= 10) {
    suggestions.push({
      id: "missing_activity",
      type: "missing_activity",
      priority: "medium",
      targetTab: "activity",
      ...SUGGESTION_COPY.missing_activity,
      triggeredAt: now,
      expiresAt: null,
    });
  }

  // RULE 5: Family travelers (kids) → suggest kid-friendly activities
  if ((ctx.travelers.children > 0 || ctx.travelers.infants > 0) && !ctx.hasActivity) {
    suggestions.push({
      id: "add_experience",
      type: "add_experience",
      priority: "medium",
      targetTab: "activity",
      headline: "Family Activities",
      reason: "Kids on this trip need entertainment",
      benefit: "Keep the whole family happy",
      triggeredAt: now,
      expiresAt: null,
    });
  }

  // RULE 6: International trip, no insurance
  if (ctx.isInternational && !ctx.hasInsurance && ctx.items.length >= 2) {
    suggestions.push({
      id: "add_insurance",
      type: "add_insurance",
      priority: "low",
      targetTab: "insurance",
      ...SUGGESTION_COPY.add_insurance,
      triggeredAt: now,
      expiresAt: null,
    });
  }

  // Sort by priority (high first)
  const priorityOrder: Record<SuggestionPriority, number> = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK: usePredictiveBundling
// ═══════════════════════════════════════════════════════════════════════════════

export interface PredictiveBundlingState {
  suggestions: BundleSuggestion[];
  dismissedIds: Set<string>;
  acceptedIds: Set<string>;
  isEnabled: boolean;
}

export function usePredictiveBundling() {
  const items = useQuoteItems();
  const { state, setActiveTab } = useQuoteWorkspace();

  // Session memory - persists dismissed/accepted for this quote
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [isEnabled, setIsEnabled] = useState(true);

  // Timer for re-evaluation
  const evalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [, forceUpdate] = useState(0);

  // Build context and evaluate rules
  const context = useMemo(() => buildTripContext(items, state), [items, state]);
  const allSuggestions = useMemo(() => evaluateRules(context), [context]);

  // Filter out dismissed/accepted
  const activeSuggestions = useMemo(() => {
    if (!isEnabled) return [];
    return allSuggestions.filter(
      (s) => !dismissedIds.has(s.id) && !acceptedIds.has(s.id)
    );
  }, [allSuggestions, dismissedIds, acceptedIds, isEnabled]);

  // Top 2 suggestions only (avoid noise)
  const visibleSuggestions = activeSuggestions.slice(0, 2);

  // Re-evaluate periodically (every 5 seconds) for time-based rules
  useEffect(() => {
    evalTimerRef.current = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 5000);

    return () => {
      if (evalTimerRef.current) clearInterval(evalTimerRef.current);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const dismiss = useCallback((suggestionId: string) => {
    setDismissedIds((prev) => new Set(prev).add(suggestionId));
  }, []);

  const accept = useCallback(
    (suggestion: BundleSuggestion) => {
      setAcceptedIds((prev) => new Set(prev).add(suggestion.id));
      // Navigate to target tab
      setActiveTab(suggestion.targetTab);
    },
    [setActiveTab]
  );

  const snooze = useCallback((suggestionId: string, duration: number = 60000) => {
    // Temporarily dismiss, then re-show
    setDismissedIds((prev) => new Set(prev).add(suggestionId));
    setTimeout(() => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.delete(suggestionId);
        return next;
      });
    }, duration);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    setDismissedIds(new Set());
    setAcceptedIds(new Set());
    setIsEnabled(true);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════

  const stats = useMemo(() => ({
    totalSuggestions: allSuggestions.length,
    dismissed: dismissedIds.size,
    accepted: acceptedIds.size,
    visible: visibleSuggestions.length,
  }), [allSuggestions, dismissedIds, acceptedIds, visibleSuggestions]);

  return {
    // State
    suggestions: visibleSuggestions,
    allSuggestions,
    context,
    stats,
    isEnabled,

    // Actions
    dismiss,
    accept,
    snooze,
    toggle,
    reset,
  };
}

export type PredictiveBundlingReturn = ReturnType<typeof usePredictiveBundling>;
