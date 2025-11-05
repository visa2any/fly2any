/**
 * AI Agent Suggestion Timing System
 * Determines when and how to present suggestions to users
 */

import type { Suggestion, SuggestionPriority } from './agent-suggestions';

export type ConversationStage =
  | 'greeting'           // Initial contact
  | 'search'             // User searching
  | 'results'            // Viewing results
  | 'details'            // Looking at specific option
  | 'comparison'         // Comparing options
  | 'booking'            // Checkout process
  | 'confirmation';      // After booking

export type UserEngagement = 'high' | 'medium' | 'low';

export interface TimingContext {
  lastSuggestionTime?: Date;
  userEngagement: UserEngagement;
  conversationStage: ConversationStage;
  numberOfSuggestions: number;
  suggestionsAccepted?: number;
  suggestionsDismissed?: number;
  timeOnPage?: number; // seconds
  interactionCount?: number;
  lastUserMessage?: Date;
}

export interface SuggestionTiming {
  shouldSuggest: boolean;
  reason?: string;
  suggestAfter?: number; // milliseconds to wait
  maxSuggestions?: number;
  insertionPoint: 'now' | 'after-results' | 'before-booking' | 'never';
}

/**
 * Determine if we should suggest something now
 */
export function shouldSuggestNow(context: TimingContext): boolean {
  const timing = getSuggestionTiming(context);
  return timing.shouldSuggest && timing.insertionPoint === 'now';
}

/**
 * Get detailed timing recommendation
 */
export function getSuggestionTiming(context: TimingContext): SuggestionTiming {
  // Never suggest during confirmation
  if (context.conversationStage === 'confirmation') {
    return {
      shouldSuggest: false,
      reason: 'User has completed booking',
      insertionPoint: 'never'
    };
  }

  // Check if we're spamming
  if (isSuggestionSpam(context)) {
    return {
      shouldSuggest: false,
      reason: 'Too many suggestions too quickly',
      suggestAfter: 30000, // Wait 30 seconds
      insertionPoint: 'never'
    };
  }

  // Check user engagement level
  if (context.userEngagement === 'low' && context.numberOfSuggestions > 0) {
    return {
      shouldSuggest: false,
      reason: 'User engagement is low - avoid overwhelming',
      insertionPoint: 'never'
    };
  }

  // Determine insertion point based on stage
  const insertionPoint = findInsertionPoint(context.conversationStage);

  // Calculate max suggestions based on engagement
  const maxSuggestions = getMaxSuggestions(context.userEngagement, context.conversationStage);

  // Check if we've hit the limit
  if (context.numberOfSuggestions >= maxSuggestions) {
    return {
      shouldSuggest: false,
      reason: `Already shown ${maxSuggestions} suggestions for this stage`,
      insertionPoint: 'never'
    };
  }

  // Check time since last suggestion
  if (context.lastSuggestionTime) {
    const minInterval = getMinimumInterval(context.userEngagement);
    const timeSinceLastSuggestion = Date.now() - context.lastSuggestionTime.getTime();

    if (timeSinceLastSuggestion < minInterval) {
      return {
        shouldSuggest: false,
        reason: 'Too soon since last suggestion',
        suggestAfter: minInterval - timeSinceLastSuggestion,
        insertionPoint
      };
    }
  }

  // Check if user is actively engaged
  if (context.lastUserMessage) {
    const timeSinceLastMessage = Date.now() - context.lastUserMessage.getTime();

    // If user hasn't interacted in 5+ minutes, don't suggest
    if (timeSinceLastMessage > 300000) {
      return {
        shouldSuggest: false,
        reason: 'User inactive',
        insertionPoint: 'never'
      };
    }
  }

  // All checks passed - suggest now!
  return {
    shouldSuggest: true,
    insertionPoint,
    maxSuggestions
  };
}

/**
 * Prioritize suggestions based on timing and context
 */
export function prioritizeSuggestions(
  suggestions: Suggestion[],
  context: TimingContext
): Suggestion[] {
  // Sort by multiple factors
  const scored = suggestions.map(s => ({
    suggestion: s,
    score: calculateSuggestionScore(s, context)
  }));

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Limit based on engagement
  const maxSuggestions = getMaxSuggestions(context.userEngagement, context.conversationStage);

  return scored
    .slice(0, maxSuggestions)
    .map(s => s.suggestion);
}

/**
 * Calculate relevance score for a suggestion
 */
function calculateSuggestionScore(
  suggestion: Suggestion,
  context: TimingContext
): number {
  let score = 0;

  // Base score from priority
  const priorityScores = { high: 10, medium: 5, low: 2 };
  score += priorityScores[suggestion.priority];

  // Stage relevance
  const stageBonus = getStageRelevanceBonus(suggestion.type, context.conversationStage);
  score += stageBonus;

  // Time sensitivity
  if (suggestion.expiresAt) {
    const timeRemaining = suggestion.expiresAt.getTime() - Date.now();
    if (timeRemaining < 3600000) { // Less than 1 hour
      score += 5;
    } else if (timeRemaining < 86400000) { // Less than 24 hours
      score += 3;
    }
  }

  // Savings amount
  if (suggestion.savingsAmount) {
    if (suggestion.savingsAmount > 200) score += 4;
    else if (suggestion.savingsAmount > 100) score += 2;
    else if (suggestion.savingsAmount > 50) score += 1;
  }

  // User engagement modifier
  if (context.userEngagement === 'high') {
    // High engagement users can handle more suggestions
    score *= 1.2;
  } else if (context.userEngagement === 'low') {
    // Only show really important stuff to low engagement users
    if (suggestion.priority !== 'high') {
      score *= 0.5;
    }
  }

  // Acceptance rate bonus
  if (context.suggestionsAccepted && context.numberOfSuggestions > 0) {
    const acceptanceRate = context.suggestionsAccepted / context.numberOfSuggestions;
    if (acceptanceRate > 0.5) {
      score *= 1.3; // User likes suggestions
    } else if (acceptanceRate < 0.2) {
      score *= 0.7; // User doesn't like suggestions
    }
  }

  return score;
}

/**
 * Get stage-specific relevance bonus
 */
function getStageRelevanceBonus(
  suggestionType: Suggestion['type'],
  stage: ConversationStage
): number {
  const relevanceMap: Record<ConversationStage, Record<string, number>> = {
    greeting: {
      'personalized': 3,
      'insider-tip': 2
    },
    search: {
      'insider-tip': 5,
      'cost-saving': 4,
      'personalized': 3
    },
    results: {
      'deal-alert': 5,
      'better-option': 5,
      'cost-saving': 4,
      'time-saving': 3
    },
    details: {
      'better-option': 5,
      'upsell': 4,
      'package-deal': 4
    },
    comparison: {
      'better-option': 5,
      'cost-saving': 4,
      'insider-tip': 3
    },
    booking: {
      'urgency': 5,
      'upsell': 4,
      'package-deal': 3,
      'deal-alert': 2
    },
    confirmation: {
      // No suggestions during confirmation
    }
  };

  return relevanceMap[stage]?.[suggestionType] || 0;
}

/**
 * Find natural insertion point in conversation
 */
export function findInsertionPoint(stage: ConversationStage): SuggestionTiming['insertionPoint'] {
  switch (stage) {
    case 'greeting':
      return 'now'; // Can suggest right away

    case 'search':
      return 'now'; // Suggest improvements to search

    case 'results':
      return 'after-results'; // Wait for results to load

    case 'details':
      return 'now'; // Can suggest when viewing details

    case 'comparison':
      return 'now'; // Good time to suggest

    case 'booking':
      return 'before-booking'; // Last chance for upsells

    case 'confirmation':
      return 'never'; // Don't interrupt confirmation

    default:
      return 'now';
  }
}

/**
 * Check if we're spamming the user with suggestions
 */
function isSuggestionSpam(context: TimingContext): boolean {
  // Too many suggestions in total
  if (context.numberOfSuggestions > 10) {
    return true;
  }

  // Too many in a short time
  if (context.lastSuggestionTime) {
    const timeSinceLastSuggestion = Date.now() - context.lastSuggestionTime.getTime();

    // Don't suggest more than once per 15 seconds for low engagement
    if (context.userEngagement === 'low' && timeSinceLastSuggestion < 15000) {
      return true;
    }

    // Don't suggest more than once per 10 seconds for medium engagement
    if (context.userEngagement === 'medium' && timeSinceLastSuggestion < 10000) {
      return true;
    }

    // Don't suggest more than once per 5 seconds even for high engagement
    if (timeSinceLastSuggestion < 5000) {
      return true;
    }
  }

  // Low acceptance rate = spam
  if (
    context.numberOfSuggestions >= 3 &&
    context.suggestionsDismissed &&
    context.suggestionsAccepted !== undefined
  ) {
    const dismissalRate = context.suggestionsDismissed / context.numberOfSuggestions;
    if (dismissalRate > 0.7) {
      return true; // User dismissing most suggestions
    }
  }

  return false;
}

/**
 * Get minimum interval between suggestions based on engagement
 */
function getMinimumInterval(engagement: UserEngagement): number {
  switch (engagement) {
    case 'high':
      return 5000;  // 5 seconds
    case 'medium':
      return 10000; // 10 seconds
    case 'low':
      return 15000; // 15 seconds
  }
}

/**
 * Get maximum suggestions based on engagement and stage
 */
function getMaxSuggestions(engagement: UserEngagement, stage: ConversationStage): number {
  // Stage-specific limits
  const stageLimits: Record<ConversationStage, number> = {
    greeting: 1,
    search: 2,
    results: 3,
    details: 2,
    comparison: 2,
    booking: 2,
    confirmation: 0
  };

  const stageLimit = stageLimits[stage] || 2;

  // Engagement multiplier
  const engagementMultiplier: Record<UserEngagement, number> = {
    high: 1.5,
    medium: 1,
    low: 0.5
  };

  return Math.floor(stageLimit * engagementMultiplier[engagement]);
}

/**
 * Detect user engagement level based on behavior
 */
export function detectUserEngagement(context: {
  interactionCount?: number;
  timeOnPage?: number;
  suggestionsAccepted?: number;
  suggestionsDismissed?: number;
  numberOfSearches?: number;
  messagesCount?: number;
}): UserEngagement {
  let score = 0;

  // Interaction count (clicks, selections, etc.)
  if (context.interactionCount) {
    if (context.interactionCount > 20) score += 3;
    else if (context.interactionCount > 10) score += 2;
    else if (context.interactionCount > 5) score += 1;
  }

  // Time on page
  if (context.timeOnPage) {
    if (context.timeOnPage > 600) score += 3; // 10+ minutes
    else if (context.timeOnPage > 300) score += 2; // 5+ minutes
    else if (context.timeOnPage > 120) score += 1; // 2+ minutes
  }

  // Suggestion acceptance
  if (context.suggestionsAccepted && context.suggestionsDismissed !== undefined) {
    const total = context.suggestionsAccepted + context.suggestionsDismissed;
    if (total > 0) {
      const acceptanceRate = context.suggestionsAccepted / total;
      if (acceptanceRate > 0.6) score += 2;
      else if (acceptanceRate > 0.3) score += 1;
      else score -= 1; // Penalize low acceptance
    }
  }

  // Number of searches (shows intent)
  if (context.numberOfSearches) {
    if (context.numberOfSearches > 5) score += 2;
    else if (context.numberOfSearches > 2) score += 1;
  }

  // Message count (conversation depth)
  if (context.messagesCount) {
    if (context.messagesCount > 10) score += 2;
    else if (context.messagesCount > 5) score += 1;
  }

  // Classify based on score
  if (score >= 8) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/**
 * Group suggestions for presentation
 */
export function groupSuggestionsForPresentation(
  suggestions: Suggestion[]
): {
  primary: Suggestion[];
  secondary: Suggestion[];
} {
  const primary = suggestions.filter(s => s.priority === 'high');
  const secondary = suggestions.filter(s => s.priority !== 'high');

  return {
    primary: primary.slice(0, 1), // Show max 1 high priority
    secondary: secondary.slice(0, 2) // Show max 2 medium/low priority
  };
}

/**
 * Format suggestions for natural conversation flow
 */
export function formatForConversation(
  suggestions: Suggestion[],
  stage: ConversationStage
): string[] {
  const grouped = groupSuggestionsForPresentation(suggestions);
  const messages: string[] = [];

  // Primary suggestions get their own message
  if (grouped.primary.length > 0) {
    messages.push(grouped.primary[0].message);
  }

  // Secondary suggestions can be combined
  if (grouped.secondary.length > 0) {
    if (stage === 'results' || stage === 'details') {
      // At results/details, present as options
      messages.push(
        "A couple more things that might interest you:\n" +
        grouped.secondary.map((s, i) => `${i + 1}. ${s.message}`).join('\n')
      );
    } else {
      // In other stages, present individually
      messages.push(...grouped.secondary.map(s => s.message));
    }
  }

  return messages;
}

/**
 * Determine optimal timing to show a specific suggestion
 */
export function getOptimalTimingForSuggestion(
  suggestion: Suggestion,
  context: TimingContext
): 'immediate' | 'delayed' | 'skip' {
  // Always immediate for urgent/expiring suggestions
  if (suggestion.type === 'urgency' || suggestion.expiresAt) {
    return 'immediate';
  }

  // Immediate for high priority in engaged users
  if (suggestion.priority === 'high' && context.userEngagement === 'high') {
    return 'immediate';
  }

  // Delay upsells and low priority items
  if (suggestion.type === 'upsell' || suggestion.priority === 'low') {
    return context.userEngagement === 'high' ? 'delayed' : 'skip';
  }

  // Skip if user is not engaged
  if (context.userEngagement === 'low' && suggestion.priority !== 'high') {
    return 'skip';
  }

  return 'delayed';
}
