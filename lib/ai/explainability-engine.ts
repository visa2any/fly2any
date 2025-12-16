/**
 * AI Explainability Engine — Fly2Any AI Ecosystem
 *
 * Transforms AI decisions from black box to glass box.
 * Admin-facing, audit-ready explanations.
 */

import type { ConversationLog, DecisionLog, LLMCallLog } from './admin-observer';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface DecisionExplanation {
  // 1. Decision Summary
  summary: {
    decision_made: string;
    decision_type: string;
    timestamp: string;
  };

  // 2. Trigger Context
  trigger_context: {
    user_intent: string;
    user_emotion: string;
    session_state: string;
    urgency_level: string;
  };

  // 3. Agent Selection Logic
  agent_selection: {
    selected_agent: string;
    selection_reason: string;
    agents_not_selected: Array<{
      agent: string;
      reason: string;
    }>;
  };

  // 4. Data Sources Used
  data_sources: {
    apis_called: string[];
    user_history_accessed: boolean;
    pricing_data_used: boolean;
    business_rules_applied: string[];
  };

  // 5. Constraints Applied
  constraints: {
    trust_limits: string[];
    cost_limits: string[];
    compliance_rules: string[];
  };

  // 6. Alternative Paths
  alternatives: Array<{
    path: string;
    why_rejected: string;
  }>;

  // 7. Risk & Confidence
  risk_assessment: {
    confidence_score: number;
    known_uncertainties: string[];
    risk_level: 'low' | 'medium' | 'high';
  };
}

export interface ConversationExplanation {
  conversation_id: string;
  overview: {
    start_time: string;
    end_time: string;
    duration: string;
    outcome: string;
    total_decisions: number;
    total_handoffs: number;
    total_cost: string;
  };
  journey: Array<{
    timestamp: string;
    event: string;
    details: string;
  }>;
  key_decisions: DecisionExplanation[];
  performance_metrics: {
    response_times: number[];
    avg_confidence: number;
    escalation_needed: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT DESCRIPTIONS (for explanations)
// ═══════════════════════════════════════════════════════════════════════════
const AGENT_DESCRIPTIONS: Record<string, string> = {
  'customer-service': 'Lisa Thompson - Primary contact for general inquiries and trip planning',
  'flight-operations': 'Sarah Chen - Flight search, bookings, and schedule changes',
  'hotel-accommodations': 'Marcus Rodriguez - Hotel search and accommodation bookings',
  'payment-billing': 'David Park - Payment processing, refunds, and billing issues',
  'legal-compliance': 'Dr. Emily Watson - Traveler rights and compensation claims',
  'travel-insurance': 'Robert Martinez - Insurance coverage and claims guidance',
  'visa-documentation': 'Sophia Nguyen - Visa requirements and documentation',
  'car-rental': 'James Anderson - Ground transportation and car rentals',
  'loyalty-rewards': 'Amanda Foster - Points, miles, and loyalty programs',
  'crisis-management': 'Captain Mike Johnson - Emergency response and disruptions',
  'technical-support': 'Alex Kumar - Platform issues and account problems',
  'special-services': 'Nina Davis - Accessibility and special needs coordination',
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate explanation for a single decision
 */
export function explainDecision(
  decision: DecisionLog,
  context: {
    intent?: string;
    emotion?: string;
    urgency?: string;
    agents_available?: string[];
  } = {}
): DecisionExplanation {
  const { intent = 'unknown', emotion = 'CALM', urgency = 'MEDIUM', agents_available = [] } = context;

  // Build agents not selected
  const agents_not_selected = agents_available
    .filter(a => a !== decision.agent_id)
    .slice(0, 3)
    .map(agent => ({
      agent: AGENT_DESCRIPTIONS[agent] || agent,
      reason: getAgentRejectionReason(agent, intent, decision.agent_id),
    }));

  return {
    summary: {
      decision_made: decision.decision_reason,
      decision_type: decision.decision_type,
      timestamp: new Date(decision.timestamp).toISOString(),
    },
    trigger_context: {
      user_intent: intent,
      user_emotion: emotion,
      session_state: decision.fallback_or_escalation ? 'escalated' : 'normal',
      urgency_level: urgency,
    },
    agent_selection: {
      selected_agent: AGENT_DESCRIPTIONS[decision.agent_id] || decision.agent_id,
      selection_reason: decision.decision_reason,
      agents_not_selected,
    },
    data_sources: {
      apis_called: inferAPIsUsed(decision.decision_type),
      user_history_accessed: false,
      pricing_data_used: decision.decision_type.includes('booking') || decision.decision_type.includes('price'),
      business_rules_applied: inferBusinessRules(decision),
    },
    constraints: {
      trust_limits: decision.confidence_score < 0.7 ? ['Low confidence - verification recommended'] : [],
      cost_limits: [],
      compliance_rules: inferComplianceRules(intent),
    },
    alternatives: decision.alternatives_considered.map(alt => ({
      path: alt,
      why_rejected: `${decision.decision_reason} was determined to be more appropriate`,
    })),
    risk_assessment: {
      confidence_score: decision.confidence_score,
      known_uncertainties: decision.confidence_score < 0.8 ? ['Intent classification not fully certain'] : [],
      risk_level: decision.confidence_score >= 0.8 ? 'low' : decision.confidence_score >= 0.6 ? 'medium' : 'high',
    },
  };
}

/**
 * Generate full conversation explanation
 */
export function explainConversation(log: ConversationLog): ConversationExplanation {
  const startTime = new Date(log.timestamp);
  const endTime = new Date(log.timestamp + log.duration_ms);

  // Build journey timeline
  const journey = log.events.map(event => ({
    timestamp: new Date(event.timestamp).toISOString(),
    event: event.event_type,
    details: summarizeEventDetails(event),
  }));

  // Explain key decisions
  const key_decisions = log.decisions.map(d =>
    explainDecision(d, {
      intent: log.intents[0],
      emotion: log.emotions[log.emotions.length - 1],
      agents_available: Object.keys(AGENT_DESCRIPTIONS),
    })
  );

  // Calculate metrics
  const response_times = log.llm_calls.map(c => c.latency_ms);
  const avg_confidence = log.decisions.length > 0
    ? log.decisions.reduce((sum, d) => sum + d.confidence_score, 0) / log.decisions.length
    : 0;

  return {
    conversation_id: log.id,
    overview: {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: formatDuration(log.duration_ms),
      outcome: log.outcome,
      total_decisions: log.decisions.length,
      total_handoffs: log.events.filter(e => e.event_type === 'handoff').length,
      total_cost: `$${log.cost.toFixed(4)}`,
    },
    journey,
    key_decisions,
    performance_metrics: {
      response_times,
      avg_confidence: parseFloat(avg_confidence.toFixed(2)),
      escalation_needed: log.decisions.some(d => d.fallback_or_escalation),
    },
  };
}

/**
 * Generate summary explanation (for quick view)
 */
export function generateQuickExplanation(log: ConversationLog): string {
  const agents = log.agents_involved.map(a => AGENT_DESCRIPTIONS[a]?.split(' - ')[0] || a);
  const outcome_text = log.conversion ? 'converted' : log.outcome;

  return `Conversation ${log.id.slice(0, 8)}... | ${formatDuration(log.duration_ms)} | ` +
         `Agents: ${agents.join(' → ')} | ` +
         `Intents: ${log.intents.join(', ') || 'none'} | ` +
         `Outcome: ${outcome_text} | ` +
         `Cost: $${log.cost.toFixed(4)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getAgentRejectionReason(agent: string, intent: string, selectedAgent: string): string {
  const reasons: Record<string, string> = {
    'flight-operations': 'User intent did not involve flights',
    'hotel-accommodations': 'User intent did not involve accommodations',
    'payment-billing': 'No payment or billing issues detected',
    'legal-compliance': 'No legal or compensation matters raised',
    'crisis-management': 'No emergency or critical situation detected',
    'technical-support': 'No platform or technical issues reported',
  };

  return reasons[agent] || `${AGENT_DESCRIPTIONS[selectedAgent]?.split(' - ')[0]} was better suited for this intent`;
}

function inferAPIsUsed(decisionType: string): string[] {
  const apis: string[] = ['Smart Router API'];

  if (decisionType.includes('flight')) apis.push('Duffel Flights API');
  if (decisionType.includes('hotel')) apis.push('Hotel Availability API');
  if (decisionType.includes('payment')) apis.push('Stripe API');

  return apis;
}

function inferBusinessRules(decision: DecisionLog): string[] {
  const rules: string[] = [];

  if (decision.fallback_or_escalation) {
    rules.push('Escalation policy triggered');
  }
  if (decision.confidence_score < 0.7) {
    rules.push('Low confidence handling rule');
  }
  rules.push('Intent-to-agent routing rules');

  return rules;
}

function inferComplianceRules(intent: string): string[] {
  const rules: string[] = ['GDPR data minimization'];

  if (intent.includes('PAYMENT') || intent.includes('REFUND')) {
    rules.push('PCI-DSS payment handling');
  }
  if (intent.includes('LEGAL')) {
    rules.push('EU261 compensation eligibility');
  }

  return rules;
}

function summarizeEventDetails(event: { event_type: string; data: Record<string, unknown> }): string {
  switch (event.event_type) {
    case 'start':
      return 'Conversation initiated';
    case 'end':
      return `Conversation ended - ${event.data.outcome}`;
    case 'message':
      return `${event.data.role} message (${event.data.content_length} chars)`;
    case 'decision':
      return `Decision: ${event.data.decision_reason}`;
    case 'handoff':
      return `Handoff: ${event.data.from_agent} → ${event.data.to_agent}`;
    case 'api_call':
      return `API: ${event.data.provider}/${event.data.model} (${event.data.latency_ms}ms)`;
    case 'error':
      return `Error: ${event.data.error}`;
    default:
      return event.event_type;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}
