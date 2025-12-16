/**
 * Conversation Replay & QA Scoring Engine — Fly2Any AI Ecosystem
 *
 * Analyzes completed conversations, scores agent performance,
 * detects risks, and generates improvements.
 */

import { recordOutcome, type ConversationOutcome } from './memory-learning';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  agent_id?: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    emotional_state?: string;
    urgency_level?: string;
    handoff?: boolean;
  };
}

export interface QAScores {
  accuracy: number;      // 0-100
  safety: number;        // 0-100
  emotional_alignment: number; // 0-100
  efficiency: number;    // 0-100
  conversion_impact: number; // 0-100
  escalation_correctness: number; // 0-100
  overall: number;       // 0-100
}

export interface QAFlags {
  incorrect_info: boolean;
  unresolved_confusion: boolean;
  unnecessary_escalation: boolean;
  missed_upsell: boolean;
  policy_ambiguity: boolean;
  hallucination_detected: boolean;
  emotional_mismatch: boolean;
  oververbosity: boolean;
}

export interface QAReport {
  conversation_id: string;
  scores: QAScores;
  flags: QAFlags;
  issues: string[];
  recommendations: string[];
  reviewed_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════
const HALLUCINATION_INDICATORS = [
  /\$\d+\.\d{2}/, // Specific prices
  /guaranteed|definitely|certainly/, // Absolutes
  /policy states|according to our policy/, // Fake policy
  /\d+%\s*(discount|refund|off)/, // Made-up discounts
];

const CONFUSION_INDICATORS = [
  /\?{2,}/, // Multiple question marks
  /don't understand|confused|what do you mean/i,
  /can you explain|please clarify/i,
];

const FRUSTRATION_INDICATORS = [
  /!{2,}/, // Multiple exclamation
  /angry|frustrated|unacceptable|terrible/i,
  /this is ridiculous|waste of time/i,
];

const OVERVERBOSITY_THRESHOLD = 500; // chars

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze completed conversation
 */
export function analyzeConversation(
  conversationId: string,
  messages: ConversationMessage[],
  outcome: {
    resolved: boolean;
    converted: boolean;
    escalated: boolean;
  }
): QAReport {
  const flags = detectFlags(messages);
  const scores = calculateScores(messages, outcome, flags);
  const { issues, recommendations } = generateFeedback(flags, scores);

  const report: QAReport = {
    conversation_id: conversationId,
    scores,
    flags,
    issues,
    recommendations,
    reviewed_at: new Date().toISOString(),
  };

  // Record outcome for learning
  const emotionalJourney = extractEmotionalJourney(messages);
  const agentsInvolved = extractAgents(messages);

  recordOutcome({
    conversation_id: conversationId,
    primary_intent: messages[0]?.metadata?.intent || 'UNKNOWN',
    agents_involved: agentsInvolved,
    resolution_status: outcome.resolved ? 'resolved' : outcome.escalated ? 'escalated' : 'abandoned',
    resolution_time_ms: calculateDuration(messages),
    handoff_count: countHandoffs(messages),
    emotional_journey: emotionalJourney,
    converted: outcome.converted,
  });

  return report;
}

/**
 * Detect QA flags
 */
function detectFlags(messages: ConversationMessage[]): QAFlags {
  const allAssistantContent = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join(' ');

  const allUserContent = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  // Check for hallucinations
  const hallucination_detected = HALLUCINATION_INDICATORS.some(p => p.test(allAssistantContent));

  // Check for unresolved confusion
  const lastUserMessages = messages.filter(m => m.role === 'user').slice(-2);
  const unresolved_confusion = lastUserMessages.some(m =>
    CONFUSION_INDICATORS.some(p => p.test(m.content))
  );

  // Check for emotional mismatch
  const userFrustrated = FRUSTRATION_INDICATORS.some(p => p.test(allUserContent));
  const assistantTooFormal = userFrustrated &&
    !allAssistantContent.toLowerCase().includes('understand') &&
    !allAssistantContent.toLowerCase().includes('sorry');
  const emotional_mismatch = assistantTooFormal;

  // Check for oververbosity
  const avgAssistantLength = messages
    .filter(m => m.role === 'assistant')
    .reduce((sum, m) => sum + m.content.length, 0) /
    Math.max(messages.filter(m => m.role === 'assistant').length, 1);
  const oververbosity = avgAssistantLength > OVERVERBOSITY_THRESHOLD;

  // Check for unnecessary escalation
  const handoffCount = countHandoffs(messages);
  const unnecessary_escalation = handoffCount > 2;

  return {
    incorrect_info: false, // Would need external validation
    unresolved_confusion,
    unnecessary_escalation,
    missed_upsell: false, // Would need conversion tracking
    policy_ambiguity: /policy|depend|varies|might/i.test(allAssistantContent),
    hallucination_detected,
    emotional_mismatch,
    oververbosity,
  };
}

/**
 * Calculate QA scores
 */
function calculateScores(
  messages: ConversationMessage[],
  outcome: { resolved: boolean; converted: boolean; escalated: boolean },
  flags: QAFlags
): QAScores {
  // Base scores
  let accuracy = 100;
  let safety = 100;
  let emotional_alignment = 100;
  let efficiency = 100;
  let conversion_impact = 50; // Neutral default
  let escalation_correctness = 100;

  // Deductions
  if (flags.hallucination_detected) {
    accuracy -= 40;
    safety -= 30;
  }

  if (flags.incorrect_info) {
    accuracy -= 50;
  }

  if (flags.emotional_mismatch) {
    emotional_alignment -= 30;
  }

  if (flags.unresolved_confusion) {
    emotional_alignment -= 20;
    accuracy -= 10;
  }

  if (flags.oververbosity) {
    efficiency -= 20;
  }

  if (flags.unnecessary_escalation) {
    escalation_correctness -= 40;
    efficiency -= 20;
  }

  // Outcome bonuses
  if (outcome.resolved) {
    accuracy += 10;
    efficiency += 10;
  }

  if (outcome.converted) {
    conversion_impact = 100;
  } else if (outcome.resolved) {
    conversion_impact = 70;
  }

  // Clamp all scores
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const scores = {
    accuracy: clamp(accuracy),
    safety: clamp(safety),
    emotional_alignment: clamp(emotional_alignment),
    efficiency: clamp(efficiency),
    conversion_impact: clamp(conversion_impact),
    escalation_correctness: clamp(escalation_correctness),
    overall: 0,
  };

  // Calculate overall (weighted average)
  scores.overall = Math.round(
    scores.accuracy * 0.25 +
    scores.safety * 0.25 +
    scores.emotional_alignment * 0.15 +
    scores.efficiency * 0.15 +
    scores.conversion_impact * 0.1 +
    scores.escalation_correctness * 0.1
  );

  return scores;
}

/**
 * Generate feedback
 */
function generateFeedback(
  flags: QAFlags,
  scores: QAScores
): { issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (flags.hallucination_detected) {
    issues.push('Potential hallucination detected in responses');
    recommendations.push('Verify all pricing and policy information before responding');
  }

  if (flags.unresolved_confusion) {
    issues.push('User confusion was not fully resolved');
    recommendations.push('Add clarifying questions and use simpler language');
  }

  if (flags.emotional_mismatch) {
    issues.push('Response tone did not match user emotional state');
    recommendations.push('Acknowledge user frustration before providing solutions');
  }

  if (flags.oververbosity) {
    issues.push('Responses were overly verbose');
    recommendations.push('Reduce response length, focus on key information');
  }

  if (flags.unnecessary_escalation) {
    issues.push('Too many handoffs occurred');
    recommendations.push('Improve first-contact resolution, limit to 2 handoffs max');
  }

  if (scores.overall < 70) {
    issues.push(`Overall QA score below threshold (${scores.overall}/100)`);
    recommendations.push('Review conversation for training opportunities');
  }

  return { issues, recommendations };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function extractEmotionalJourney(messages: ConversationMessage[]): string[] {
  return messages
    .filter(m => m.metadata?.emotional_state)
    .map(m => m.metadata!.emotional_state!)
    .filter((v, i, a) => i === 0 || v !== a[i - 1]); // Dedupe consecutive
}

function extractAgents(messages: ConversationMessage[]): string[] {
  return [...new Set(
    messages
      .filter(m => m.agent_id)
      .map(m => m.agent_id!)
  )];
}

function calculateDuration(messages: ConversationMessage[]): number {
  if (messages.length < 2) return 0;
  return messages[messages.length - 1].timestamp - messages[0].timestamp;
}

function countHandoffs(messages: ConversationMessage[]): number {
  return messages.filter(m => m.metadata?.handoff).length;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze batch of conversations
 */
export function analyzeBatch(
  conversations: Array<{
    id: string;
    messages: ConversationMessage[];
    outcome: { resolved: boolean; converted: boolean; escalated: boolean };
  }>
): {
  reports: QAReport[];
  summary: {
    total: number;
    avg_score: number;
    flagged_count: number;
    top_issues: string[];
  };
} {
  const reports = conversations.map(c =>
    analyzeConversation(c.id, c.messages, c.outcome)
  );

  const avg_score = reports.reduce((sum, r) => sum + r.scores.overall, 0) / reports.length;
  const flagged_count = reports.filter(r => r.issues.length > 0).length;

  // Aggregate top issues
  const issueCount = new Map<string, number>();
  reports.forEach(r => {
    r.issues.forEach(issue => {
      issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
    });
  });

  const top_issues = [...issueCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue]) => issue);

  return {
    reports,
    summary: {
      total: conversations.length,
      avg_score: Math.round(avg_score),
      flagged_count,
      top_issues,
    },
  };
}
