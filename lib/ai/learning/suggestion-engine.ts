/**
 * Safe Suggestion Engine
 *
 * GOVERNANCE RULES (IMMUTABLE):
 * - NO auto-changing prompts
 * - ALL suggestions require MANUAL approval
 * - NO PII in suggestions
 * - Suggestions are template-based only
 */

import {
  metricsStore,
  getMostFailedIntents,
  getAgentPerformance,
  type InteractionMetric,
  type ResponsePattern,
  type InteractionOutcome,
} from './interaction-tracker';
import type { ConversationStage, ChaosClassification } from '../reasoning-layer';
import type { TeamType } from '../consultant-handoff';

// ============================================================================
// TYPES
// ============================================================================

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ResponseSuggestion {
  id: string;
  createdAt: number;
  status: SuggestionStatus;

  // Context (what triggers this)
  targetIntent: string;
  targetChaos: ChaosClassification;
  targetStage: ConversationStage;
  targetAgent: TeamType;

  // Suggestion (template only, no content)
  currentPattern: ResponsePattern;
  suggestedPattern: ResponsePattern;
  reasoning: string;

  // Metrics that triggered suggestion
  failureRate: number;
  sampleSize: number;

  // Approval
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;
}

// ============================================================================
// SUGGESTION STORE (Production: use DB)
// ============================================================================

class SuggestionStore {
  private suggestions: ResponseSuggestion[] = [];

  add(suggestion: ResponseSuggestion): void {
    this.suggestions.push(suggestion);
  }

  getAll(): ResponseSuggestion[] {
    return [...this.suggestions];
  }

  getPending(): ResponseSuggestion[] {
    return this.suggestions.filter(s => s.status === 'pending');
  }

  approve(id: string, approvedBy: string): boolean {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion && suggestion.status === 'pending') {
      suggestion.status = 'approved';
      suggestion.approvedBy = approvedBy;
      suggestion.approvedAt = Date.now();
      console.log(`[SUGGESTION-APPROVED] ${id} by ${approvedBy}`);
      return true;
    }
    return false;
  }

  reject(id: string, reason: string): boolean {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion && suggestion.status === 'pending') {
      suggestion.status = 'rejected';
      suggestion.rejectionReason = reason;
      console.log(`[SUGGESTION-REJECTED] ${id}: ${reason}`);
      return true;
    }
    return false;
  }

  getApproved(): ResponseSuggestion[] {
    return this.suggestions.filter(s => s.status === 'approved');
  }
}

export const suggestionStore = new SuggestionStore();

// ============================================================================
// SUGGESTION GENERATION RULES
// ============================================================================

interface PatternRecommendation {
  from: ResponsePattern;
  to: ResponsePattern;
  condition: string;
}

// Pattern improvement rules (static, governance-safe)
const PATTERN_IMPROVEMENTS: PatternRecommendation[] = [
  {
    from: 'error_recovery',
    to: 'consultative',
    condition: 'High failure rate with error recovery pattern',
  },
  {
    from: 'clarifying_question',
    to: 'inspirational',
    condition: 'DISCOVERY stage with excessive clarifying questions',
  },
  {
    from: 'dead_end_prevented',
    to: 'consultative',
    condition: 'Frequent dead-end prevention triggered',
  },
  {
    from: 'search_results',
    to: 'consultative',
    condition: 'High abandonment in search results',
  },
];

// ============================================================================
// SUGGESTION ENGINE
// ============================================================================

/**
 * Generate unique suggestion ID
 */
function generateSuggestionId(): string {
  return `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Analyze metrics and generate suggestions (REQUIRES MANUAL APPROVAL)
 */
export function generateSuggestions(): ResponseSuggestion[] {
  const metrics = metricsStore.getAll();
  const failedIntents = getMostFailedIntents(5);
  const suggestions: ResponseSuggestion[] = [];

  // Rule 1: High failure rate intents
  failedIntents.forEach(intent => {
    if (intent.failureRate > 30 && intent.totalCount >= 10) {
      const intentMetrics = metrics.filter(m => m.intentType === intent.intent);

      // Find most common failing pattern
      const patternCounts = new Map<ResponsePattern, number>();
      intentMetrics
        .filter(m => m.outcome === 'abandoned' || m.outcome === 'escalated')
        .forEach(m => {
          patternCounts.set(m.responsePattern, (patternCounts.get(m.responsePattern) || 0) + 1);
        });

      let failingPattern: ResponsePattern | null = null;
      let maxCount = 0;
      patternCounts.forEach((count, pattern) => {
        if (count > maxCount) {
          maxCount = count;
          failingPattern = pattern;
        }
      });

      if (failingPattern) {
        // Find recommended improvement
        const improvement = PATTERN_IMPROVEMENTS.find(p => p.from === failingPattern);
        if (improvement) {
          suggestions.push({
            id: generateSuggestionId(),
            createdAt: Date.now(),
            status: 'pending',
            targetIntent: intent.intent,
            targetChaos: intent.commonChaos || 'CLEAR_INTENT',
            targetStage: 'DISCOVERY',  // Default
            targetAgent: intent.topAgent || 'general',
            currentPattern: failingPattern,
            suggestedPattern: improvement.to,
            reasoning: `${improvement.condition}. Intent "${intent.intent}" has ${intent.failureRate}% failure rate with ${failingPattern} pattern.`,
            failureRate: intent.failureRate,
            sampleSize: intent.totalCount,
          });
        }
      }
    }
  });

  // Rule 2: Agent-specific improvements
  const agentPerf = getAgentPerformance();
  agentPerf.forEach(perf => {
    if (perf.abandonedRate > 25 && perf.totalInteractions >= 20) {
      const agentMetrics = metrics.filter(m => m.primaryAgent === perf.agent);

      // Check if mostly in early stages
      const discoveryCount = agentMetrics.filter(m => m.conversationStage === 'DISCOVERY').length;
      if (discoveryCount > agentMetrics.length * 0.5) {
        suggestions.push({
          id: generateSuggestionId(),
          createdAt: Date.now(),
          status: 'pending',
          targetIntent: 'general_inquiry',
          targetChaos: 'LOW_INFORMATION',
          targetStage: 'DISCOVERY',
          targetAgent: perf.agent,
          currentPattern: 'clarifying_question',
          suggestedPattern: 'inspirational',
          reasoning: `Agent "${perf.agent}" has ${perf.abandonedRate}% abandonment rate, mostly in DISCOVERY stage. Suggest more inspirational approach.`,
          failureRate: perf.abandonedRate,
          sampleSize: perf.totalInteractions,
        });
      }
    }
  });

  // Store new suggestions
  suggestions.forEach(s => suggestionStore.add(s));

  // Log for monitoring
  if (suggestions.length > 0) {
    console.log(`[SUGGESTION-ENGINE] Generated ${suggestions.length} new suggestions (PENDING APPROVAL)`);
    suggestions.forEach(s => {
      console.log(`  - [${s.id}] ${s.targetIntent}: ${s.currentPattern} → ${s.suggestedPattern}`);
    });
  }

  return suggestions;
}

/**
 * Get approved suggestions for a specific context
 */
export function getApprovedSuggestionsFor(
  intent: string,
  chaos: ChaosClassification,
  stage: ConversationStage,
  agent: TeamType
): ResponseSuggestion[] {
  return suggestionStore.getApproved().filter(s =>
    s.targetIntent === intent ||
    s.targetChaos === chaos ||
    s.targetStage === stage ||
    s.targetAgent === agent
  );
}

/**
 * Check if a pattern improvement is approved
 */
export function isPatternImprovementApproved(
  currentPattern: ResponsePattern,
  context: {
    intent: string;
    chaos: ChaosClassification;
    stage: ConversationStage;
    agent: TeamType;
  }
): ResponsePattern | null {
  const approved = getApprovedSuggestionsFor(
    context.intent,
    context.chaos,
    context.stage,
    context.agent
  );

  const match = approved.find(s => s.currentPattern === currentPattern);
  return match ? match.suggestedPattern : null;
}

// ============================================================================
// GOVERNANCE-SAFE API
// ============================================================================

/**
 * Manual approval endpoint (requires admin auth)
 */
export function approveSuggestion(suggestionId: string, adminId: string): boolean {
  // In production: verify admin permissions
  return suggestionStore.approve(suggestionId, adminId);
}

/**
 * Manual rejection endpoint
 */
export function rejectSuggestion(suggestionId: string, reason: string): boolean {
  return suggestionStore.reject(suggestionId, reason);
}

/**
 * Get all pending suggestions for admin review
 */
export function getPendingSuggestions(): ResponseSuggestion[] {
  return suggestionStore.getPending();
}

/**
 * Log pending suggestions for admin review
 */
export function logPendingSuggestions(): void {
  const pending = getPendingSuggestions();

  if (pending.length === 0) {
    console.log('[SUGGESTIONS] No pending suggestions');
    return;
  }

  console.log('\n========== PENDING SUGGESTIONS (REQUIRE APPROVAL) ==========');
  pending.forEach(s => {
    console.log(`\n[${s.id}]`);
    console.log(`  Intent: ${s.targetIntent} | Agent: ${s.targetAgent}`);
    console.log(`  Current: ${s.currentPattern} → Suggested: ${s.suggestedPattern}`);
    console.log(`  Reason: ${s.reasoning}`);
    console.log(`  Metrics: ${s.failureRate}% failure, ${s.sampleSize} samples`);
  });
  console.log('\n=============================================================\n');
}
