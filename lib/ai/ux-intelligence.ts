/**
 * Real-Time UX Intelligence Engine — Fly2Any
 * Eyes and ears of product quality.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type SignalCategory = 'error' | 'friction' | 'confusion' | 'conversion_blocker' | 'trust_concern' | 'feedback';
export type SignalSource = 'technical' | 'behavioral' | 'emotional';
export type Severity = 1 | 2 | 3 | 4 | 5;

export interface UXSignal {
  signal_id: string;
  session_id: string;
  timestamp: number;
  category: SignalCategory;
  source: SignalSource;
  page: string;
  component?: string;
  step?: string;
  description: string;
  severity: Severity;
  impact: { conversion: number; trust: number; revenue: number };
  metadata: Record<string, unknown>;
  user_intent?: string;
}

export interface TechnicalError {
  type: 'js_error' | 'api_failure' | 'slow_response' | 'payment_decline' | 'third_party_outage';
  message: string;
  stack?: string;
  endpoint?: string;
  status_code?: number;
  latency_ms?: number;
}

export interface BehavioralSignal {
  type: 'rage_click' | 'form_correction_loop' | 'hesitation' | 'scroll_stall' | 'back_forth_nav' | 'drop_off';
  element?: string;
  click_count?: number;
  duration_ms?: number;
  corrections?: number;
}

export interface FeedbackEntry {
  feedback_id: string;
  session_id: string;
  page: string;
  component?: string;
  rating: 1 | 2 | 3; // 😞 😐 😊
  comment?: string;
  trigger: 'error' | 'hesitation' | 'abandonment' | 'manual';
  timestamp: number;
}

export interface UXIssue {
  issue_id: string;
  category: SignalCategory;
  page: string;
  component?: string;
  description: string;
  frequency: number;
  severity_avg: number;
  revenue_impact: number;
  trust_risk: number;
  ease_of_fix: 'easy' | 'medium' | 'hard';
  root_cause?: string;
  recommended_fix?: string;
  expected_uplift?: string;
  first_seen: number;
  last_seen: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  signals: [] as UXSignal[],
  feedback: [] as FeedbackEntry[],
  issues: new Map<string, UXIssue>(),
  metrics: {
    errors_1h: 0,
    friction_1h: 0,
    feedback_collected: 0,
    conversion_blockers: 0,
  },
  heatmap: new Map<string, number>(), // page:component -> count
};

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL CAPTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Capture technical error
 */
export function captureTechnicalError(sessionId: string, page: string, error: TechnicalError): UXSignal {
  const severity = getSeverityFromError(error);
  const impact = calculateImpact('error', severity, page);

  const signal: UXSignal = {
    signal_id: generateEventId(),
    session_id: sessionId,
    timestamp: Date.now(),
    category: 'error',
    source: 'technical',
    page,
    component: error.endpoint || 'unknown',
    description: `${error.type}: ${error.message}`,
    severity,
    impact,
    metadata: { ...error },
  };

  recordSignal(signal);
  return signal;
}

/**
 * Capture behavioral signal
 */
export function captureBehavioralSignal(
  sessionId: string,
  page: string,
  signal: BehavioralSignal,
  step?: string
): UXSignal {
  const category = classifyBehavioralSignal(signal);
  const severity = getBehavioralSeverity(signal);
  const impact = calculateImpact(category, severity, page);

  const uxSignal: UXSignal = {
    signal_id: generateEventId(),
    session_id: sessionId,
    timestamp: Date.now(),
    category,
    source: 'behavioral',
    page,
    component: signal.element,
    step,
    description: describeBehavioralSignal(signal),
    severity,
    impact,
    metadata: { ...signal },
  };

  recordSignal(uxSignal);
  return uxSignal;
}

/**
 * Capture emotional/intent signal
 */
export function captureEmotionalSignal(
  sessionId: string,
  page: string,
  type: 'frustration' | 'confusion' | 'abandonment' | 'trust_issue',
  context: string
): UXSignal {
  const categoryMap: Record<string, SignalCategory> = {
    frustration: 'friction',
    confusion: 'confusion',
    abandonment: 'conversion_blocker',
    trust_issue: 'trust_concern',
  };

  const signal: UXSignal = {
    signal_id: generateEventId(),
    session_id: sessionId,
    timestamp: Date.now(),
    category: categoryMap[type],
    source: 'emotional',
    page,
    description: context,
    severity: type === 'abandonment' ? 4 : 3,
    impact: calculateImpact(categoryMap[type], 3, page),
    metadata: { type },
  };

  recordSignal(signal);
  return signal;
}

function recordSignal(signal: UXSignal): void {
  state.signals.unshift(signal);
  if (state.signals.length > 1000) state.signals = state.signals.slice(0, 1000);

  // Update metrics
  if (signal.category === 'error') state.metrics.errors_1h++;
  if (signal.category === 'friction') state.metrics.friction_1h++;
  if (signal.category === 'conversion_blocker') state.metrics.conversion_blockers++;

  // Update heatmap
  const key = `${signal.page}:${signal.component || 'page'}`;
  state.heatmap.set(key, (state.heatmap.get(key) || 0) + 1);

  // Aggregate into issues
  aggregateToIssue(signal);
}

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record micro-feedback
 */
export function recordFeedback(
  sessionId: string,
  page: string,
  rating: 1 | 2 | 3,
  trigger: FeedbackEntry['trigger'],
  component?: string,
  comment?: string
): FeedbackEntry {
  const entry: FeedbackEntry = {
    feedback_id: generateEventId(),
    session_id: sessionId,
    page,
    component,
    rating,
    comment: comment?.slice(0, 500), // Limit length
    trigger,
    timestamp: Date.now(),
  };

  state.feedback.unshift(entry);
  if (state.feedback.length > 500) state.feedback = state.feedback.slice(0, 500);
  state.metrics.feedback_collected++;

  // If negative feedback, create signal
  if (rating === 1) {
    captureEmotionalSignal(sessionId, page, 'frustration', comment || 'Negative feedback submitted');
  }

  return entry;
}

/**
 * Check if should show feedback prompt
 */
export function shouldShowFeedbackPrompt(context: {
  has_error: boolean;
  hesitation_ms: number;
  form_corrections: number;
  price_changed: boolean;
  abandoning: boolean;
}): { show: boolean; trigger: FeedbackEntry['trigger'] } {
  if (context.has_error) return { show: true, trigger: 'error' };
  if (context.hesitation_ms > 10000) return { show: true, trigger: 'hesitation' };
  if (context.form_corrections > 3) return { show: true, trigger: 'hesitation' };
  if (context.abandoning) return { show: true, trigger: 'abandonment' };
  return { show: false, trigger: 'manual' };
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE AGGREGATION & PRIORITIZATION
// ═══════════════════════════════════════════════════════════════════════════

function aggregateToIssue(signal: UXSignal): void {
  const key = `${signal.category}:${signal.page}:${signal.component || 'general'}`;
  const existing = state.issues.get(key);

  if (existing) {
    existing.frequency++;
    existing.severity_avg = (existing.severity_avg + signal.severity) / 2;
    existing.revenue_impact += signal.impact.revenue;
    existing.last_seen = signal.timestamp;
  } else {
    const issue: UXIssue = {
      issue_id: generateEventId(),
      category: signal.category,
      page: signal.page,
      component: signal.component,
      description: signal.description,
      frequency: 1,
      severity_avg: signal.severity,
      revenue_impact: signal.impact.revenue,
      trust_risk: signal.impact.trust,
      ease_of_fix: inferEaseOfFix(signal),
      first_seen: signal.timestamp,
      last_seen: signal.timestamp,
    };
    generateFixRecommendation(issue, signal);
    state.issues.set(key, issue);
  }
}

function generateFixRecommendation(issue: UXIssue, signal: UXSignal): void {
  switch (signal.category) {
    case 'error':
      if (signal.description.includes('api_failure')) {
        issue.root_cause = 'API endpoint returning errors';
        issue.recommended_fix = 'Add retry logic and graceful error handling';
        issue.expected_uplift = '2-5% conversion improvement';
      } else if (signal.description.includes('payment')) {
        issue.root_cause = 'Payment processing issue';
        issue.recommended_fix = 'Review payment gateway logs, add fallback provider';
        issue.expected_uplift = '5-10% checkout recovery';
      }
      break;

    case 'friction':
      if (signal.metadata?.type === 'rage_click') {
        issue.root_cause = 'Unresponsive or confusing element';
        issue.recommended_fix = 'Add loading state, improve click target size';
        issue.expected_uplift = '1-3% drop-off reduction';
      } else if (signal.metadata?.type === 'form_correction_loop') {
        issue.root_cause = 'Unclear form validation';
        issue.recommended_fix = 'Improve inline validation messages';
        issue.expected_uplift = '2-4% form completion improvement';
      }
      break;

    case 'confusion':
      issue.root_cause = 'Content or flow unclear';
      issue.recommended_fix = 'Simplify copy, add tooltips or help text';
      issue.expected_uplift = '1-2% engagement improvement';
      break;

    case 'conversion_blocker':
      issue.root_cause = 'Critical path interrupted';
      issue.recommended_fix = 'Review funnel step, A/B test alternatives';
      issue.expected_uplift = '3-8% conversion improvement';
      break;
  }
}

/**
 * Get prioritized issues (Fix-first ranking)
 */
export function getPrioritizedIssues(limit = 20): UXIssue[] {
  return Array.from(state.issues.values())
    .map(issue => ({
      ...issue,
      priority_score: calculatePriorityScore(issue),
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

function calculatePriorityScore(issue: UXIssue): number {
  const easeMultiplier = { easy: 1.5, medium: 1, hard: 0.5 };
  return (
    issue.revenue_impact * 0.35 +
    issue.frequency * 0.25 +
    issue.severity_avg * 10 * 0.2 +
    issue.trust_risk * 0.15 +
    easeMultiplier[issue.ease_of_fix] * 10 * 0.05
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getSeverityFromError(error: TechnicalError): Severity {
  if (error.type === 'payment_decline') return 5;
  if (error.type === 'api_failure' && error.status_code && error.status_code >= 500) return 4;
  if (error.type === 'slow_response' && error.latency_ms && error.latency_ms > 5000) return 3;
  if (error.type === 'js_error') return 2;
  return 2;
}

function classifyBehavioralSignal(signal: BehavioralSignal): SignalCategory {
  switch (signal.type) {
    case 'rage_click': return 'friction';
    case 'form_correction_loop': return 'confusion';
    case 'hesitation': return 'confusion';
    case 'drop_off': return 'conversion_blocker';
    case 'back_forth_nav': return 'confusion';
    default: return 'friction';
  }
}

function getBehavioralSeverity(signal: BehavioralSignal): Severity {
  if (signal.type === 'drop_off') return 4;
  if (signal.type === 'rage_click' && signal.click_count && signal.click_count > 5) return 4;
  if (signal.type === 'form_correction_loop' && signal.corrections && signal.corrections > 5) return 3;
  return 2;
}

function describeBehavioralSignal(signal: BehavioralSignal): string {
  switch (signal.type) {
    case 'rage_click': return `Rage click detected (${signal.click_count} clicks) on ${signal.element}`;
    case 'form_correction_loop': return `Form correction loop (${signal.corrections} corrections)`;
    case 'hesitation': return `User hesitation (${signal.duration_ms}ms)`;
    case 'drop_off': return 'User dropped off at this step';
    case 'back_forth_nav': return 'User navigating back and forth';
    default: return signal.type;
  }
}

function calculateImpact(category: SignalCategory, severity: Severity, page: string): UXSignal['impact'] {
  const isCheckout = page.includes('checkout') || page.includes('payment');
  const base = severity * 10;

  return {
    conversion: category === 'conversion_blocker' ? base * 2 : base,
    trust: category === 'trust_concern' ? base * 2 : base * 0.5,
    revenue: isCheckout ? base * 3 : base,
  };
}

function inferEaseOfFix(signal: UXSignal): UXIssue['ease_of_fix'] {
  if (signal.source === 'technical' && signal.description.includes('js_error')) return 'easy';
  if (signal.category === 'confusion') return 'easy';
  if (signal.description.includes('payment')) return 'hard';
  if (signal.description.includes('api')) return 'medium';
  return 'medium';
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD DATA
// ═══════════════════════════════════════════════════════════════════════════

export function getUXDashboard(): {
  metrics: typeof state.metrics;
  live_errors: UXSignal[];
  heatmap: Array<{ location: string; count: number }>;
  top_blockers: UXIssue[];
  recent_feedback: FeedbackEntry[];
} {
  return {
    metrics: { ...state.metrics },
    live_errors: state.signals.filter(s => s.category === 'error').slice(0, 20),
    heatmap: Array.from(state.heatmap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    top_blockers: getPrioritizedIssues(10),
    recent_feedback: state.feedback.slice(0, 20),
  };
}

export function getRecentSignals(limit = 50): UXSignal[] {
  return state.signals.slice(0, limit);
}

export function resetHourlyMetrics(): void {
  state.metrics.errors_1h = 0;
  state.metrics.friction_1h = 0;
}
