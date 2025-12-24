/**
 * Conversational Conversion Intelligence Module
 *
 * Stage-based conversation management for conversion optimization.
 * Strict rules: no skipping, no aggressive selling, consent-gated actions.
 */

// Stage Engine
export {
  // Types
  type StageContext,
  type StageTransition,
  type CollectedData,
  type UserConsents,
  type TransitionResult,

  // Rules
  STAGE_RULES,

  // Store functions
  getStageContext,
  initStageContext,
  getOrCreateStageContext,
  stageStore,

  // Data extraction
  extractDataFromMessage,
  determineNextStage,

  // Transitions
  attemptTransition,
  isActionAllowed,
  isActionForbidden,

  // Guidance
  getStageGuidance,
  getConsentPrompt,
} from './stage-engine';

// Analytics
export {
  // Types
  type StageMetric,
  type StageAnalytics,
  type FunnelMetrics,

  // Store
  stageMetricsStore,

  // Analytics functions
  getStageAnalytics,
  getFunnelMetrics,
  getStageTransitionRates,
  logFunnelSummary,

  // Tracking hooks
  trackStageTransition,
  trackSessionStart,
  trackSessionDropOff,
} from './stage-analytics';

// Stage-Aware Agent Behavior
export {
  // Types
  type StageAgentGuidance,

  // Guidance
  getStageAgentGuidance,
  buildStageInstructionBlock,
  validateAgentResponse,
  getConsentQuestion,
} from './stage-behavior';
