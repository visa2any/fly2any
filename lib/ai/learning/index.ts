/**
 * Safe Learning & Optimization Module
 *
 * ML-SAFE ARCHITECTURE:
 * - NO PII stored
 * - NO raw conversation training
 * - ALL suggestions require manual approval
 * - Governance rules are immutable
 */

// Interaction Tracker
export {
  trackInteraction,
  metricsStore,
  type InteractionMetric,
  type InteractionOutcome,
  type ResponsePattern,
  getAgentPerformance,
  getMostFailedIntents,
  getMostSuccessfulFlows,
  logDashboardSummary,
  type AgentPerformance,
  type IntentAnalysis,
} from './interaction-tracker';

// Suggestion Engine
export {
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

// Store Abstraction
export {
  type ILearningStore,
  type AggregatedMetrics,
  type TimeBucket,
  type StoreConfig,
  type StoreHealth,
  InMemoryLearningStore,
  RedisLearningStore,
  createLearningStore,
  getActiveStore,
  setActiveStore,
  checkStoreHealth,
} from './store-abstraction';

// Recommendation Engine
export {
  type Recommendation,
  type RecommendationType,
  type RecommendationStatus,
  type DashboardReport,
  isBlockedDomain,
  recommendationStore,
  generateRecommendations,
  generateDashboard,
  logDashboard,
} from './recommendation-engine';
