/**
 * Executive Daily Digest — Fly2Any
 * Platform health in under 2 minutes.
 */

import { generateEventId } from './data-schema';
import { getSystemHealth, getDashboardMetrics, getActiveAlerts } from './realtime-observability';
import { getExecutiveSummary } from './kpi-intelligence';
import { getPrioritizedIssues } from './ux-intelligence';
import { getExperimentStats, getLearnings } from './ab-experimentation';
import { getRecommendations } from './ux-fix-agent';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type HealthStatus = '🟢' | '🟡' | '🔴';

export interface DailyDigest {
  digest_id: string;
  date: string;
  generated_at: number;
  health: {
    status: HealthStatus;
    summary: string;
    incidents: string[];
  };
  revenue: {
    bookings_today: number;
    bookings_vs_yesterday: string;
    conversion_rate: number;
    conversion_delta: string;
    revenue_today: number;
    revenue_signal: 'up' | 'down' | 'stable';
  };
  top_issues: Array<{
    title: string;
    severity: number;
    impact: string;
    status: string;
  }>;
  ai_actions: {
    fixes_proposed: number;
    experiments_running: number;
    alerts_triggered: number;
  };
  opportunities: Array<{
    type: 'quick_win' | 'growth' | 'ux';
    title: string;
    expected_impact: string;
  }>;
}

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  total_bookings: number;
  total_revenue: number;
  avg_conversion_rate: number;
  top_improvements: string[];
  key_learnings: string[];
  next_priorities: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  digests: [] as DailyDigest[],
  lastGenerated: 0,
  yesterdayMetrics: { bookings: 0, revenue: 0, conversion: 0 },
};

// ═══════════════════════════════════════════════════════════════════════════
// DIGEST GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate daily executive digest
 */
export function generateDailyDigest(): DailyDigest {
  const health = getSystemHealth();
  const metrics = getDashboardMetrics();
  const kpis = getExecutiveSummary();
  const issues = getPrioritizedIssues(5);
  const alerts = getActiveAlerts();
  const fixes = getRecommendations('proposed', 5);
  const expStats = getExperimentStats();

  // Determine health status
  let healthStatus: HealthStatus = '🟢';
  let healthSummary = 'All systems operational';
  const incidents: string[] = [];

  if (health.status === 'critical') {
    healthStatus = '🔴';
    healthSummary = 'Critical issues detected';
  } else if (health.status === 'degraded') {
    healthStatus = '🟡';
    healthSummary = 'Some systems degraded';
  }

  alerts.slice(0, 3).forEach(a => incidents.push(a.title));

  // Calculate deltas
  const bookingsDelta = state.yesterdayMetrics.bookings > 0
    ? ((kpis.bookings_today - state.yesterdayMetrics.bookings) / state.yesterdayMetrics.bookings * 100).toFixed(1)
    : '0';
  const conversionDelta = state.yesterdayMetrics.conversion > 0
    ? ((kpis.funnel.rates.overall - state.yesterdayMetrics.conversion) / state.yesterdayMetrics.conversion * 100).toFixed(1)
    : '0';

  const revenueSignal: DailyDigest['revenue']['revenue_signal'] =
    kpis.revenue_today > state.yesterdayMetrics.revenue ? 'up' :
    kpis.revenue_today < state.yesterdayMetrics.revenue ? 'down' : 'stable';

  // Generate opportunities
  const opportunities: DailyDigest['opportunities'] = [];

  if (fixes.length > 0) {
    opportunities.push({
      type: 'quick_win',
      title: fixes[0].title,
      expected_impact: fixes[0].expected_result.conversion_uplift,
    });
  }

  if (kpis.funnel.ai_assisted_lift > 5) {
    opportunities.push({
      type: 'growth',
      title: 'Expand AI-assisted flows',
      expected_impact: `${kpis.funnel.ai_assisted_lift.toFixed(0)}% higher conversion`,
    });
  }

  if (issues.length > 0 && issues[0].ease_of_fix === 'easy') {
    opportunities.push({
      type: 'ux',
      title: `Fix: ${issues[0].description.slice(0, 50)}`,
      expected_impact: issues[0].expected_uplift || '2-5% improvement',
    });
  }

  const digest: DailyDigest = {
    digest_id: generateEventId(),
    date: new Date().toISOString().split('T')[0],
    generated_at: Date.now(),
    health: {
      status: healthStatus,
      summary: healthSummary,
      incidents,
    },
    revenue: {
      bookings_today: kpis.bookings_today,
      bookings_vs_yesterday: `${parseFloat(bookingsDelta) >= 0 ? '+' : ''}${bookingsDelta}%`,
      conversion_rate: kpis.funnel.rates.overall * 100,
      conversion_delta: `${parseFloat(conversionDelta) >= 0 ? '+' : ''}${conversionDelta}%`,
      revenue_today: kpis.revenue_today,
      revenue_signal: revenueSignal,
    },
    top_issues: issues.slice(0, 5).map(i => ({
      title: i.description.slice(0, 60),
      severity: Math.round(i.severity_avg),
      impact: `$${i.revenue_impact.toFixed(0)} revenue at risk`,
      status: i.recommended_fix ? 'Fix proposed' : 'Needs review',
    })),
    ai_actions: {
      fixes_proposed: fixes.length,
      experiments_running: expStats.running,
      alerts_triggered: alerts.length,
    },
    opportunities,
  };

  // Store for history
  state.digests.unshift(digest);
  if (state.digests.length > 30) state.digests = state.digests.slice(0, 30);
  state.lastGenerated = Date.now();

  // Save today's metrics for tomorrow's comparison
  state.yesterdayMetrics = {
    bookings: kpis.bookings_today,
    revenue: kpis.revenue_today,
    conversion: kpis.funnel.rates.overall,
  };

  return digest;
}

/**
 * Generate HTML email digest
 */
export function generateEmailDigest(digest: DailyDigest): string {
  const statusColor = { '🟢': '#22c55e', '🟡': '#eab308', '🔴': '#ef4444' }[digest.health.status];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fly2Any Daily Digest - ${digest.date}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 24px; color: white;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Daily Digest</h1>
      <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">${digest.date}</p>
    </div>

    <!-- Health Status -->
    <div style="padding: 20px; border-bottom: 1px solid #f0f0f0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 28px;">${digest.health.status}</span>
        <div>
          <div style="font-weight: 600; color: #1a1a1a;">${digest.health.summary}</div>
          ${digest.health.incidents.length > 0 ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">${digest.health.incidents.join(' • ')}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Revenue Metrics -->
    <div style="padding: 20px; background: #fafafa;">
      <h2 style="margin: 0 0 16px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Revenue & Conversion</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${digest.revenue.bookings_today}</div>
          <div style="font-size: 13px; color: #666;">Bookings <span style="color: ${parseFloat(digest.revenue.bookings_vs_yesterday) >= 0 ? '#22c55e' : '#ef4444'}">${digest.revenue.bookings_vs_yesterday}</span></div>
        </div>
        <div>
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${digest.revenue.conversion_rate.toFixed(2)}%</div>
          <div style="font-size: 13px; color: #666;">Conversion <span style="color: ${parseFloat(digest.revenue.conversion_delta) >= 0 ? '#22c55e' : '#ef4444'}">${digest.revenue.conversion_delta}</span></div>
        </div>
      </div>
    </div>

    <!-- Top Issues -->
    ${digest.top_issues.length > 0 ? `
    <div style="padding: 20px; border-bottom: 1px solid #f0f0f0;">
      <h2 style="margin: 0 0 12px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Top Issues</h2>
      ${digest.top_issues.map(i => `
        <div style="padding: 10px 0; border-bottom: 1px solid #f5f5f5;">
          <div style="font-size: 14px; color: #1a1a1a;">${i.title}</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px;">Severity ${i.severity}/5 • ${i.impact}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- AI Actions -->
    <div style="padding: 20px; background: #f0f7ff;">
      <h2 style="margin: 0 0 12px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">AI Actions</h2>
      <div style="font-size: 14px; color: #1a1a1a;">
        ${digest.ai_actions.fixes_proposed} fixes proposed •
        ${digest.ai_actions.experiments_running} experiments running •
        ${digest.ai_actions.alerts_triggered} alerts
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 20px; background: #fafafa; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #888;">Fly2Any AI Intelligence • Generated automatically</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate plain text summary
 */
export function generateTextSummary(digest: DailyDigest): string {
  return `
PLATFORM STATUS: ${digest.health.status} ${digest.health.summary}
${digest.health.incidents.length > 0 ? `Incidents: ${digest.health.incidents.join(', ')}` : ''}

REVENUE & CONVERSION
• Bookings: ${digest.revenue.bookings_today} (${digest.revenue.bookings_vs_yesterday} vs yesterday)
• Conversion: ${digest.revenue.conversion_rate.toFixed(2)}% (${digest.revenue.conversion_delta})
• Revenue trend: ${digest.revenue.revenue_signal}

TOP ISSUES (${digest.top_issues.length})
${digest.top_issues.map((i, idx) => `${idx + 1}. ${i.title} (Severity ${i.severity}/5)`).join('\n')}

AI ACTIONS
• ${digest.ai_actions.fixes_proposed} fixes proposed
• ${digest.ai_actions.experiments_running} experiments running

OPPORTUNITIES
${digest.opportunities.map(o => `• [${o.type.toUpperCase()}] ${o.title} → ${o.expected_impact}`).join('\n')}
`.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRIEVAL
// ═══════════════════════════════════════════════════════════════════════════

export function getLatestDigest(): DailyDigest | null {
  return state.digests[0] || null;
}

export function getDigestHistory(days = 7): DailyDigest[] {
  return state.digests.slice(0, days);
}

export function shouldGenerateDigest(): boolean {
  const lastDate = state.digests[0]?.date;
  const today = new Date().toISOString().split('T')[0];
  return lastDate !== today;
}
