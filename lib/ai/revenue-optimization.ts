/**
 * AI Revenue Optimization Loop — Fly2Any
 * Maximize revenue sustainably and intelligently.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type PriceElasticity = 'high' | 'medium' | 'low';
export type IncentiveType = 'discount' | 'cashback' | 'perk' | 'upgrade' | 'none';

export interface RevenueDecision {
  decision_id: string;
  user_id: string;
  context: string;
  action: string;
  expected_uplift: number;
  trust_impact: number; // -1 to +1
  margin_protected: boolean;
  timestamp: number;
}

export interface UserRevenueProfile {
  user_id: string;
  price_elasticity: PriceElasticity;
  avg_order_value: number;
  attachment_rate: number;
  discount_sensitivity: number; // 0-1
  churn_risk: number; // 0-1
  ltv_estimate: number;
  last_incentive?: { type: IncentiveType; value: number; timestamp: number };
}

export interface UpsellOpportunity {
  type: 'seat' | 'baggage' | 'insurance' | 'lounge' | 'upgrade' | 'wifi';
  relevance: number; // 0-100
  price: number;
  margin: number;
  reason: string;
}

export interface IncentiveRecommendation {
  type: IncentiveType;
  value: number;
  display: string;
  confidence: number;
  expected_conversion_lift: number;
  margin_impact: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  profiles: new Map<string, UserRevenueProfile>(),
  decisions: [] as RevenueDecision[],
  metrics: {
    total_revenue: 0,
    total_margin: 0,
    incentives_given: 0,
    incentive_value: 0,
    conversions_with_incentive: 0,
    conversions_without: 0,
    attachment_revenue: 0,
  },
  config: {
    max_discount_pct: 15,
    min_margin_pct: 8,
    incentive_cooldown_hours: 72,
    urgency_threshold_hours: 24,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export function getRevenueProfile(userId: string): UserRevenueProfile {
  let profile = state.profiles.get(userId);
  if (!profile) {
    profile = {
      user_id: userId,
      price_elasticity: 'medium',
      avg_order_value: 0,
      attachment_rate: 0,
      discount_sensitivity: 0.5,
      churn_risk: 0.3,
      ltv_estimate: 0,
    };
    state.profiles.set(userId, profile);
  }
  return profile;
}

export function updateRevenueProfile(userId: string, updates: Partial<UserRevenueProfile>): void {
  const profile = getRevenueProfile(userId);
  Object.assign(profile, updates);
}

export function recordPurchase(userId: string, amount: number, withIncentive: boolean, attachments: number): void {
  const profile = getRevenueProfile(userId);

  // Update AOV
  profile.avg_order_value = profile.avg_order_value > 0
    ? (profile.avg_order_value + amount) / 2
    : amount;

  // Update attachment rate
  profile.attachment_rate = (profile.attachment_rate + attachments) / 2;

  // Update LTV estimate
  profile.ltv_estimate += amount;

  // Update metrics
  state.metrics.total_revenue += amount;
  if (withIncentive) state.metrics.conversions_with_incentive++;
  else state.metrics.conversions_without++;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICING INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect price elasticity from behavior
 */
export function detectPriceElasticity(userId: string, signals: {
  price_checks: number;
  time_on_price_page_ms: number;
  sorted_by_price: boolean;
  compared_fares: boolean;
}): PriceElasticity {
  const profile = getRevenueProfile(userId);
  let score = 50;

  if (signals.sorted_by_price) score += 20;
  if (signals.compared_fares) score += 15;
  if (signals.price_checks > 3) score += 15;
  if (signals.time_on_price_page_ms > 30000) score += 10;

  if (score >= 70) profile.price_elasticity = 'high';
  else if (score >= 40) profile.price_elasticity = 'medium';
  else profile.price_elasticity = 'low';

  profile.discount_sensitivity = score / 100;

  return profile.price_elasticity;
}

/**
 * Decide whether to show incentive
 */
export function shouldShowIncentive(userId: string, cartValue: number): IncentiveRecommendation {
  const profile = getRevenueProfile(userId);
  const { config } = state;

  // Check cooldown
  if (profile.last_incentive) {
    const hoursSince = (Date.now() - profile.last_incentive.timestamp) / (1000 * 60 * 60);
    if (hoursSince < config.incentive_cooldown_hours) {
      return { type: 'none', value: 0, display: '', confidence: 1, expected_conversion_lift: 0, margin_impact: 0 };
    }
  }

  // High elasticity + high churn risk = offer incentive
  if (profile.price_elasticity === 'high' && profile.churn_risk > 0.5) {
    const discountPct = Math.min(config.max_discount_pct, Math.round(profile.discount_sensitivity * 15));
    const discountValue = Math.round(cartValue * discountPct / 100);

    logDecision(userId, 'incentive', `Offering ${discountPct}% discount`, 0.12, 0.1, true);

    return {
      type: 'discount',
      value: discountValue,
      display: `${discountPct}% off`,
      confidence: 0.75,
      expected_conversion_lift: 0.15,
      margin_impact: -discountPct / 100,
    };
  }

  // Medium elasticity = cashback (preserves perceived value)
  if (profile.price_elasticity === 'medium') {
    const cashback = Math.round(cartValue * 0.05);

    return {
      type: 'cashback',
      value: cashback,
      display: `$${cashback} cashback`,
      confidence: 0.65,
      expected_conversion_lift: 0.08,
      margin_impact: -0.05,
    };
  }

  // Low elasticity = perks instead
  if (profile.price_elasticity === 'low' && profile.ltv_estimate > 1000) {
    return {
      type: 'perk',
      value: 0,
      display: 'Free priority boarding',
      confidence: 0.6,
      expected_conversion_lift: 0.05,
      margin_impact: -0.01,
    };
  }

  return { type: 'none', value: 0, display: '', confidence: 0.9, expected_conversion_lift: 0, margin_impact: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════
// UPSELL & CROSS-SELL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get personalized upsell opportunities
 */
export function getUpsellOpportunities(userId: string, context: {
  route: string;
  cabin: string;
  flight_duration_hours: number;
  has_layover: boolean;
  travelers: number;
}): UpsellOpportunity[] {
  const profile = getRevenueProfile(userId);
  const opportunities: UpsellOpportunity[] = [];

  // Seat selection - always relevant
  opportunities.push({
    type: 'seat',
    relevance: 80,
    price: 25 * context.travelers,
    margin: 0.9,
    reason: 'Guarantee preferred seats',
  });

  // Baggage - based on duration and travelers
  if (context.flight_duration_hours > 4 || context.travelers > 1) {
    opportunities.push({
      type: 'baggage',
      relevance: context.flight_duration_hours > 8 ? 95 : 75,
      price: 35 * context.travelers,
      margin: 0.85,
      reason: context.flight_duration_hours > 8 ? 'Long-haul flight' : 'Travel with essentials',
    });
  }

  // Insurance - always offer, higher relevance for international
  const isInternational = context.route.includes('→');
  opportunities.push({
    type: 'insurance',
    relevance: isInternational ? 85 : 60,
    price: 29 * context.travelers,
    margin: 0.7,
    reason: isInternational ? 'International travel protection' : 'Peace of mind',
  });

  // Lounge - for business travelers or long layovers
  if (context.has_layover || profile.avg_order_value > 800) {
    opportunities.push({
      type: 'lounge',
      relevance: context.has_layover ? 80 : 50,
      price: 45 * context.travelers,
      margin: 0.6,
      reason: 'Relax during layover',
    });
  }

  // WiFi - for long flights
  if (context.flight_duration_hours > 3) {
    opportunities.push({
      type: 'wifi',
      relevance: 70,
      price: 15,
      margin: 0.95,
      reason: 'Stay connected',
    });
  }

  // Cabin upgrade - only for high-value users
  if (profile.ltv_estimate > 2000 && context.cabin === 'economy') {
    opportunities.push({
      type: 'upgrade',
      relevance: 65,
      price: 150 * context.travelers,
      margin: 0.4,
      reason: 'VIP upgrade offer',
    });
  }

  // Sort by relevance and limit to avoid overwhelm
  return opportunities
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 4);
}

// ═══════════════════════════════════════════════════════════════════════════
// URGENCY & SCARCITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get urgency messaging (ONLY when real)
 */
export function getUrgencyMessage(context: {
  seats_left: number;
  price_trend: 'rising' | 'stable' | 'falling';
  departure_hours: number;
}): { show: boolean; message: string; type: 'scarcity' | 'price' | 'time'; confidence: number } | null {
  // Only show if genuinely true
  if (context.seats_left <= 3 && context.seats_left > 0) {
    return {
      show: true,
      message: `Only ${context.seats_left} seats left at this price`,
      type: 'scarcity',
      confidence: 1,
    };
  }

  if (context.price_trend === 'rising') {
    return {
      show: true,
      message: 'Prices have increased recently',
      type: 'price',
      confidence: 0.9,
    };
  }

  if (context.departure_hours < state.config.urgency_threshold_hours) {
    return {
      show: true,
      message: 'Departing soon - book now',
      type: 'time',
      confidence: 1,
    };
  }

  // No fake urgency
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST GUARDRAILS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate decision against trust guardrails
 */
export function validateTrustGuardrails(decision: {
  type: string;
  value: number;
  context: string;
}): { approved: boolean; reason?: string } {
  // No dark patterns
  const darkPatterns = ['fake_countdown', 'hidden_fees', 'misleading_price', 'forced_upsell'];
  if (darkPatterns.some(p => decision.context.toLowerCase().includes(p))) {
    return { approved: false, reason: 'Dark pattern detected' };
  }

  // Discount limits
  if (decision.type === 'discount' && decision.value > state.config.max_discount_pct) {
    return { approved: false, reason: 'Exceeds max discount' };
  }

  // Margin protection
  if (decision.type === 'price_reduction') {
    const impliedMargin = 100 - decision.value;
    if (impliedMargin < state.config.min_margin_pct) {
      return { approved: false, reason: 'Below minimum margin' };
    }
  }

  return { approved: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

function logDecision(
  userId: string,
  context: string,
  action: string,
  expectedUplift: number,
  trustImpact: number,
  marginProtected: boolean
): RevenueDecision {
  const decision: RevenueDecision = {
    decision_id: generateEventId(),
    user_id: userId,
    context,
    action,
    expected_uplift: expectedUplift,
    trust_impact: trustImpact,
    margin_protected: marginProtected,
    timestamp: Date.now(),
  };

  state.decisions.unshift(decision);
  if (state.decisions.length > 500) state.decisions = state.decisions.slice(0, 500);

  return decision;
}

export function getRevenueMetrics(): typeof state.metrics & {
  conversion_rate_with_incentive: number;
  conversion_rate_without: number;
  incentive_roi: number;
} {
  const withIncentive = state.metrics.conversions_with_incentive;
  const without = state.metrics.conversions_without;
  const total = withIncentive + without || 1;

  return {
    ...state.metrics,
    conversion_rate_with_incentive: withIncentive / total,
    conversion_rate_without: without / total,
    incentive_roi: state.metrics.incentive_value > 0
      ? state.metrics.total_revenue / state.metrics.incentive_value
      : 0,
  };
}

export function getRecentDecisions(limit = 20): RevenueDecision[] {
  return state.decisions.slice(0, limit);
}

export function recordIncentiveUsed(userId: string, type: IncentiveType, value: number): void {
  const profile = getRevenueProfile(userId);
  profile.last_incentive = { type, value, timestamp: Date.now() };
  state.metrics.incentives_given++;
  state.metrics.incentive_value += value;
}

export function recordAttachmentRevenue(amount: number): void {
  state.metrics.attachment_revenue += amount;
}
