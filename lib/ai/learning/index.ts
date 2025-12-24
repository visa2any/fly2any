/**
 * Safe Learning & Optimization Module
 *
 * ML-SAFE ARCHITECTURE:
 * - NO PII stored
 * - NO raw conversation training
 * - ALL suggestions require manual approval
 * - Governance rules are immutable
 */

export {
  // Tracker
  trackInteraction,
  metricsStore,
  type InteractionMetric,
  type InteractionOutcome,
  type ResponsePattern,

  // Analytics
  getAgentPerformance,
  getMostFailedIntents,
  getMostSuccessfulFlows,
  logDashboardSummary,
  type AgentPerformance,
  type IntentAnalysis,
} from './interaction-tracker';

export {
  // Suggestion Engine
  generateSuggestions,
  getPendingSuggestions,
  approveSuggestion,
  rejectSuggestion,
  getApprovedSuggestionsFor,
  isPatternImprovementApproved,
  logPendingSuggestions,
  suggestionStore,
  type ResponseSuggestion,
  type SuggestionStatus,
} from './suggestion-engine';
