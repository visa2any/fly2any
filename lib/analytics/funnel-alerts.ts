/**
 * Funnel Drop-off Alert System
 * Monitors conversion funnel and triggers alerts on anomalies
 */

import { getPrismaClient } from '@/lib/prisma';

interface FunnelStep {
  name: string;
  eventType: string;
  expectedConversionRate: number; // Expected % conversion to next step
  alertThreshold: number; // Alert if drops below this %
}

const FUNNEL_STEPS: FunnelStep[] = [
  { name: 'Search', eventType: 'flight_search', expectedConversionRate: 0.6, alertThreshold: 0.4 },
  { name: 'Results View', eventType: 'results_view', expectedConversionRate: 0.3, alertThreshold: 0.15 },
  { name: 'Flight Selected', eventType: 'flight_selected', expectedConversionRate: 0.5, alertThreshold: 0.3 },
  { name: 'Begin Checkout', eventType: 'begin_checkout', expectedConversionRate: 0.7, alertThreshold: 0.5 },
  { name: 'Payment', eventType: 'payment_started', expectedConversionRate: 0.8, alertThreshold: 0.6 },
  { name: 'Complete', eventType: 'booking_complete', expectedConversionRate: 1.0, alertThreshold: 0.9 },
];

interface FunnelMetrics {
  step: string;
  count: number;
  conversionRate: number;
  dropOff: number;
  isAnomalous: boolean;
}

/**
 * Calculate funnel metrics for a time window
 */
export async function calculateFunnelMetrics(
  windowMinutes: number = 60
): Promise<FunnelMetrics[]> {
  const prisma = getPrismaClient();
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const metrics: FunnelMetrics[] = [];
  let prevCount = 0;

  for (let i = 0; i < FUNNEL_STEPS.length; i++) {
    const step = FUNNEL_STEPS[i];

    // Count events for this step
    const count = await prisma.analyticsEvent.count({
      where: {
        eventType: step.eventType,
        createdAt: { gte: since },
      },
    }).catch(() => 0);

    const conversionRate = prevCount > 0 ? count / prevCount : (i === 0 ? 1 : 0);
    const dropOff = prevCount > 0 ? 1 - conversionRate : 0;
    const isAnomalous = conversionRate < step.alertThreshold && prevCount > 10;

    metrics.push({
      step: step.name,
      count,
      conversionRate,
      dropOff,
      isAnomalous,
    });

    prevCount = count || prevCount;
  }

  return metrics;
}

/**
 * Check for funnel anomalies and send alerts
 */
export async function checkFunnelAlerts(): Promise<{
  hasAnomalies: boolean;
  anomalies: FunnelMetrics[];
}> {
  const metrics = await calculateFunnelMetrics(60);
  const anomalies = metrics.filter(m => m.isAnomalous);

  if (anomalies.length > 0) {
    // Send Telegram alert
    await sendFunnelAlert(anomalies);
  }

  return { hasAnomalies: anomalies.length > 0, anomalies };
}

/**
 * Send funnel drop-off alert via Telegram
 */
async function sendFunnelAlert(anomalies: FunnelMetrics[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIds = process.env.TELEGRAM_ADMIN_CHAT_IDS?.trim().split(',').filter(Boolean) || [];

  if (!token || chatIds.length === 0) return;

  const message = `
⚠️ <b>FUNNEL ALERT</b>

${anomalies.map(a => `
<b>${a.step}</b>
• Conversion: ${(a.conversionRate * 100).toFixed(1)}%
• Drop-off: ${(a.dropOff * 100).toFixed(1)}%
• Count: ${a.count}
`).join('')}

<i>Last 60 minutes</i>
`.trim();

  for (const chatId of chatIds) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
  }
}

/**
 * Get real-time funnel summary
 */
export async function getFunnelSummary(): Promise<{
  totalSearches: number;
  totalBookings: number;
  overallConversion: number;
  steps: FunnelMetrics[];
}> {
  const metrics = await calculateFunnelMetrics(1440); // 24 hours

  const searches = metrics.find(m => m.step === 'Search')?.count || 0;
  const bookings = metrics.find(m => m.step === 'Complete')?.count || 0;

  return {
    totalSearches: searches,
    totalBookings: bookings,
    overallConversion: searches > 0 ? bookings / searches : 0,
    steps: metrics,
  };
}
