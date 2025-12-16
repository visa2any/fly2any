/**
 * AI KPI & Board Intelligence — Fly2Any
 * Single source of truth for performance.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface CAC {
  total: number;
  by_channel: Record<string, number>;
  trend_7d: number; // % change
  trend_30d: number;
}

export interface LTV {
  overall: number;
  by_segment: Record<string, number>;
  repeat_booking_rate: number;
  avg_bookings_per_user: number;
}

export interface AICostMetrics {
  cost_per_conversation: number;
  cost_per_booking_assisted: number;
  cost_per_retained_user: number;
  roi_vs_human: number; // multiplier
  total_spend_today: number;
  total_spend_month: number;
}

export interface TrustScore {
  overall: number; // 0-100
  components: {
    booking_success_rate: number;
    error_rate: number;
    complaint_ratio: number;
    refund_resolution_speed: number;
    user_sentiment: number;
  };
  trend: 'improving' | 'stable' | 'declining';
}

export interface ConversionFunnel {
  visit: number;
  search: number;
  results: number;
  select: number;
  payment_start: number;
  payment_complete: number;
  rates: {
    visit_to_search: number;
    search_to_results: number;
    results_to_select: number;
    select_to_payment: number;
    payment_success: number;
    overall: number;
  };
  ai_assisted_lift: number;
}

export interface ExecutiveSummary {
  date: string;
  revenue_today: number;
  revenue_mtd: number;
  bookings_today: number;
  bookings_mtd: number;
  cac: CAC;
  ltv: LTV;
  ltv_cac_ratio: number;
  trust_score: TrustScore;
  funnel: ConversionFunnel;
  ai_costs: AICostMetrics;
  alerts: KPIAlert[];
  insights: string[];
}

export interface KPIAlert {
  id: string;
  metric: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  // Revenue
  revenue: { today: 0, mtd: 0, last_month: 0 },
  bookings: { today: 0, mtd: 0, last_month: 0 },

  // Acquisition
  marketing_spend: { seo: 0, ads: 0, email: 0, social: 0, total: 0 },
  new_customers: { seo: 0, ads: 0, email: 0, social: 0, total: 0 },

  // Funnel
  funnel_counts: { visit: 0, search: 0, results: 0, select: 0, payment_start: 0, payment_complete: 0 },
  funnel_ai_assisted: { visit: 0, search: 0, results: 0, select: 0, payment_start: 0, payment_complete: 0 },

  // Trust
  trust_metrics: {
    successful_bookings: 0,
    failed_bookings: 0,
    errors: 0,
    complaints: 0,
    refunds_resolved: 0,
    refunds_pending: 0,
    sentiment_sum: 0,
    sentiment_count: 0,
  },

  // AI Costs
  ai_costs: { conversations: 0, cost: 0, bookings_assisted: 0, users_retained: 0 },

  // Alerts
  alerts: [] as KPIAlert[],

  // Thresholds
  thresholds: {
    cac_max: 50,
    ltv_cac_min: 3,
    trust_score_min: 80,
    conversion_rate_min: 0.02,
    error_rate_max: 0.05,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export function trackRevenue(amount: number): void {
  state.revenue.today += amount;
  state.revenue.mtd += amount;
}

export function trackBooking(assisted_by_ai: boolean): void {
  state.bookings.today++;
  state.bookings.mtd++;
  state.trust_metrics.successful_bookings++;
  if (assisted_by_ai) state.ai_costs.bookings_assisted++;
}

export function trackFailedBooking(): void {
  state.trust_metrics.failed_bookings++;
}

export function trackMarketingSpend(channel: 'seo' | 'ads' | 'email' | 'social', amount: number): void {
  state.marketing_spend[channel] += amount;
  state.marketing_spend.total += amount;
}

export function trackNewCustomer(channel: 'seo' | 'ads' | 'email' | 'social'): void {
  state.new_customers[channel]++;
  state.new_customers.total++;
}

export function trackFunnelStep(step: keyof typeof state.funnel_counts, ai_assisted = false): void {
  state.funnel_counts[step]++;
  if (ai_assisted) state.funnel_ai_assisted[step]++;
}

export function trackAICost(cost: number): void {
  state.ai_costs.cost += cost;
  state.ai_costs.conversations++;
}

export function trackSentiment(score: number): void {
  state.trust_metrics.sentiment_sum += score;
  state.trust_metrics.sentiment_count++;
}

export function trackError(): void {
  state.trust_metrics.errors++;
}

export function trackComplaint(): void {
  state.trust_metrics.complaints++;
}

export function trackRefund(resolved: boolean): void {
  if (resolved) state.trust_metrics.refunds_resolved++;
  else state.trust_metrics.refunds_pending++;
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateCAC(): CAC {
  const byChannel: Record<string, number> = {};
  for (const ch of ['seo', 'ads', 'email', 'social'] as const) {
    byChannel[ch] = state.new_customers[ch] > 0
      ? state.marketing_spend[ch] / state.new_customers[ch]
      : 0;
  }

  return {
    total: state.new_customers.total > 0
      ? state.marketing_spend.total / state.new_customers.total
      : 0,
    by_channel: byChannel,
    trend_7d: 0, // Would calculate from historical data
    trend_30d: 0,
  };
}

export function calculateLTV(): LTV {
  const avgRevenue = state.bookings.mtd > 0 ? state.revenue.mtd / state.bookings.mtd : 0;
  const repeatRate = 0.35; // Would calculate from actual data

  return {
    overall: avgRevenue * (1 / (1 - repeatRate)), // Simple LTV formula
    by_segment: { vip: avgRevenue * 3, frequent: avgRevenue * 1.5, casual: avgRevenue * 0.8 },
    repeat_booking_rate: repeatRate,
    avg_bookings_per_user: 1.4,
  };
}

export function calculateTrustScore(): TrustScore {
  const { successful_bookings, failed_bookings, errors, complaints, refunds_resolved, refunds_pending, sentiment_sum, sentiment_count } = state.trust_metrics;
  const total = successful_bookings + failed_bookings || 1;

  const components = {
    booking_success_rate: successful_bookings / total,
    error_rate: errors / total,
    complaint_ratio: complaints / total,
    refund_resolution_speed: refunds_resolved / (refunds_resolved + refunds_pending || 1),
    user_sentiment: sentiment_count > 0 ? sentiment_sum / sentiment_count : 0.5,
  };

  // Weighted average
  const overall = Math.round(
    (components.booking_success_rate * 30 +
      (1 - components.error_rate) * 20 +
      (1 - components.complaint_ratio) * 20 +
      components.refund_resolution_speed * 15 +
      components.user_sentiment * 15) * 100 / 100
  );

  return { overall, components, trend: overall >= 80 ? 'stable' : 'declining' };
}

export function calculateFunnel(): ConversionFunnel {
  const f = state.funnel_counts;
  const ai = state.funnel_ai_assisted;

  const rates = {
    visit_to_search: f.visit > 0 ? f.search / f.visit : 0,
    search_to_results: f.search > 0 ? f.results / f.search : 0,
    results_to_select: f.results > 0 ? f.select / f.results : 0,
    select_to_payment: f.select > 0 ? f.payment_start / f.select : 0,
    payment_success: f.payment_start > 0 ? f.payment_complete / f.payment_start : 0,
    overall: f.visit > 0 ? f.payment_complete / f.visit : 0,
  };

  // AI lift calculation
  const aiConversion = ai.visit > 0 ? ai.payment_complete / ai.visit : 0;
  const nonAiVisits = f.visit - ai.visit || 1;
  const nonAiComplete = f.payment_complete - ai.payment_complete;
  const nonAiConversion = nonAiComplete / nonAiVisits;
  const aiLift = nonAiConversion > 0 ? ((aiConversion - nonAiConversion) / nonAiConversion) * 100 : 0;

  return { ...f, rates, ai_assisted_lift: aiLift };
}

export function calculateAICosts(): AICostMetrics {
  const { conversations, cost, bookings_assisted, users_retained } = state.ai_costs;
  const humanCostPerConv = 5; // Estimated human agent cost

  return {
    cost_per_conversation: conversations > 0 ? cost / conversations : 0,
    cost_per_booking_assisted: bookings_assisted > 0 ? cost / bookings_assisted : 0,
    cost_per_retained_user: users_retained > 0 ? cost / users_retained : 0,
    roi_vs_human: conversations > 0 ? humanCostPerConv / (cost / conversations) : 0,
    total_spend_today: cost,
    total_spend_month: cost, // Would track monthly
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════════════════════

function checkThresholds(): void {
  const cac = calculateCAC();
  const ltv = calculateLTV();
  const trust = calculateTrustScore();
  const funnel = calculateFunnel();

  const alerts: KPIAlert[] = [];

  if (cac.total > state.thresholds.cac_max) {
    alerts.push({
      id: generateEventId(),
      metric: 'CAC',
      severity: 'warning',
      message: `CAC ($${cac.total.toFixed(2)}) exceeds threshold ($${state.thresholds.cac_max})`,
      value: cac.total,
      threshold: state.thresholds.cac_max,
      timestamp: Date.now(),
    });
  }

  const ltvCacRatio = cac.total > 0 ? ltv.overall / cac.total : 0;
  if (ltvCacRatio < state.thresholds.ltv_cac_min && ltvCacRatio > 0) {
    alerts.push({
      id: generateEventId(),
      metric: 'LTV:CAC',
      severity: 'critical',
      message: `LTV:CAC ratio (${ltvCacRatio.toFixed(1)}) below healthy threshold (${state.thresholds.ltv_cac_min})`,
      value: ltvCacRatio,
      threshold: state.thresholds.ltv_cac_min,
      timestamp: Date.now(),
    });
  }

  if (trust.overall < state.thresholds.trust_score_min) {
    alerts.push({
      id: generateEventId(),
      metric: 'Trust Score',
      severity: 'critical',
      message: `Trust Score (${trust.overall}) below minimum (${state.thresholds.trust_score_min})`,
      value: trust.overall,
      threshold: state.thresholds.trust_score_min,
      timestamp: Date.now(),
    });
  }

  if (funnel.rates.overall < state.thresholds.conversion_rate_min) {
    alerts.push({
      id: generateEventId(),
      metric: 'Conversion Rate',
      severity: 'warning',
      message: `Conversion rate (${(funnel.rates.overall * 100).toFixed(2)}%) below target`,
      value: funnel.rates.overall,
      threshold: state.thresholds.conversion_rate_min,
      timestamp: Date.now(),
    });
  }

  state.alerts = alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export function getExecutiveSummary(): ExecutiveSummary {
  checkThresholds();

  const cac = calculateCAC();
  const ltv = calculateLTV();
  const trust = calculateTrustScore();
  const funnel = calculateFunnel();
  const aiCosts = calculateAICosts();

  const insights: string[] = [];
  if (funnel.ai_assisted_lift > 10) {
    insights.push(`AI assistance boosting conversions by ${funnel.ai_assisted_lift.toFixed(0)}%`);
  }
  if (aiCosts.roi_vs_human > 3) {
    insights.push(`AI delivering ${aiCosts.roi_vs_human.toFixed(1)}x ROI vs human support`);
  }
  if (trust.trend === 'improving') {
    insights.push('Trust metrics trending positive');
  }

  return {
    date: new Date().toISOString().split('T')[0],
    revenue_today: state.revenue.today,
    revenue_mtd: state.revenue.mtd,
    bookings_today: state.bookings.today,
    bookings_mtd: state.bookings.mtd,
    cac,
    ltv,
    ltv_cac_ratio: cac.total > 0 ? ltv.overall / cac.total : 0,
    trust_score: trust,
    funnel,
    ai_costs: aiCosts,
    alerts: state.alerts,
    insights,
  };
}

export function getBoardDashboard() {
  const summary = getExecutiveSummary();
  return {
    headline_metrics: {
      revenue_mtd: `$${summary.revenue_mtd.toLocaleString()}`,
      bookings_mtd: summary.bookings_mtd,
      trust_score: `${summary.trust_score.overall}/100`,
      ltv_cac: `${summary.ltv_cac_ratio.toFixed(1)}x`,
    },
    funnel_health: summary.funnel.rates.overall >= 0.02 ? 'Healthy' : 'Needs Attention',
    ai_roi: `${summary.ai_costs.roi_vs_human.toFixed(1)}x`,
    top_alerts: summary.alerts.slice(0, 3),
    insights: summary.insights,
  };
}

export function resetDailyMetrics(): void {
  state.revenue.today = 0;
  state.bookings.today = 0;
  state.funnel_counts = { visit: 0, search: 0, results: 0, select: 0, payment_start: 0, payment_complete: 0 };
  state.funnel_ai_assisted = { visit: 0, search: 0, results: 0, select: 0, payment_start: 0, payment_complete: 0 };
  state.ai_costs = { conversations: 0, cost: 0, bookings_assisted: 0, users_retained: 0 };
}
