/**
 * Fare Monitoring Script
 *
 * Continuous monitoring of fare consistency between UI and API in production.
 * Detects price drift and anomalies, sends alerts when thresholds are breached.
 *
 * Usage:
 *   npx ts-node scripts/fare-monitor.ts                    # One-time check
 *   npx ts-node scripts/fare-monitor.ts --continuous       # Continuous monitoring
 *   npx ts-node scripts/fare-monitor.ts --routes JFK-LAX   # Specific route
 *
 * Environment Variables:
 *   MONITOR_BASE_URL      - Base URL to monitor (default: https://www.fly2any.com)
 *   MONITOR_INTERVAL      - Check interval in ms (default: 300000 = 5 min)
 *   SLACK_WEBHOOK_URL     - Slack webhook for alerts
 *   PAGERDUTY_KEY         - PagerDuty integration key
 *   SENTRY_DSN            - Sentry DSN for error tracking
 *
 */

import * as https from 'https';
import * as http from 'http';
import {
  calculateExpectedPrice,
  MARKUP_CONFIG,
  COMPARISON_THRESHOLDS,
} from '../tests/e2e/fare-reconciliation/types';

// Configuration
const CONFIG = {
  baseUrl: process.env.MONITOR_BASE_URL || 'https://www.fly2any.com',
  interval: parseInt(process.env.MONITOR_INTERVAL || '300000'), // 5 minutes
  routes: [
    { origin: 'JFK', destination: 'LAX', name: 'JFK-LAX (Domestic)' },
    { origin: 'JFK', destination: 'LHR', name: 'JFK-LHR (Transatlantic)' },
    { origin: 'LAX', destination: 'NRT', name: 'LAX-NRT (Transpacific)' },
    { origin: 'JFK', destination: 'MIA', name: 'JFK-MIA (Short-haul)' },
    { origin: 'ORD', destination: 'DFW', name: 'ORD-DFW (Midwest)' },
  ],
  thresholds: {
    priceDriftPercent: 5,      // Alert if price differs by more than 5%
    priceDriftAmount: 50,       // Alert if price differs by more than $50
    responseTimeMs: 10000,      // Alert if API takes > 10s
    errorRatePercent: 10,       // Alert if error rate > 10%
  },
  alerts: {
    slack: process.env.SLACK_WEBHOOK_URL,
    pagerduty: process.env.PAGERDUTY_KEY,
    email: process.env.ALERT_EMAIL,
  },
};

// Types
interface MonitorResult {
  timestamp: string;
  route: string;
  success: boolean;
  responseTime: number;
  priceCheck?: {
    apiPrice: number;
    expectedPrice: number;
    difference: number;
    percentDiff: number;
    withinThreshold: boolean;
  };
  error?: string;
}

interface AlertPayload {
  severity: 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

// Monitoring state
const state = {
  results: [] as MonitorResult[],
  alerts: [] as AlertPayload[],
  errorCount: 0,
  successCount: 0,
  lastCheck: null as Date | null,
};

/**
 * Get future date string
 */
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Make HTTP request
 */
async function makeRequest(url: string, options: any): Promise<{ data: any; time: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const time = Date.now() - startTime;
        try {
          resolve({ data: JSON.parse(data), time });
        } catch {
          resolve({ data, time });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Check a single route
 */
async function checkRoute(route: { origin: string; destination: string; name: string }): Promise<MonitorResult> {
  const timestamp = new Date().toISOString();
  const departureDate = getFutureDate(30);

  try {
    const url = `${CONFIG.baseUrl}/api/flights/search`;
    const body = JSON.stringify({
      originLocationCode: route.origin,
      destinationLocationCode: route.destination,
      departureDate,
      adults: 1,
      travelClass: 'ECONOMY',
      currencyCode: 'USD',
      maxResults: 5,
    });

    const { data, time } = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fly2Any-FareMonitor/1.0',
      },
      body,
    });

    // Check response time
    if (time > CONFIG.thresholds.responseTimeMs) {
      await sendAlert({
        severity: 'warning',
        title: 'Slow API Response',
        message: `Flight search API took ${time}ms (threshold: ${CONFIG.thresholds.responseTimeMs}ms)`,
        details: { route: route.name, responseTime: time },
        timestamp,
      });
    }

    const flights = data.data || data.flights || [];

    if (flights.length === 0) {
      return {
        timestamp,
        route: route.name,
        success: true,
        responseTime: time,
        error: 'No flights returned',
      };
    }

    // Check first flight price
    const flight = flights[0];
    const apiPrice = parseFloat(flight.price?.total || '0');
    const basePrice = parseFloat(flight.price?.base || flight.price?.total || '0');
    const expected = calculateExpectedPrice(basePrice);

    const difference = apiPrice - expected.customerPrice;
    const percentDiff = expected.customerPrice > 0 ? (difference / expected.customerPrice) * 100 : 0;

    const withinThreshold =
      Math.abs(percentDiff) <= CONFIG.thresholds.priceDriftPercent &&
      Math.abs(difference) <= CONFIG.thresholds.priceDriftAmount;

    if (!withinThreshold) {
      await sendAlert({
        severity: 'error',
        title: 'Price Drift Detected',
        message: `Price mismatch on ${route.name}: API=$${apiPrice.toFixed(2)}, Expected=$${expected.customerPrice.toFixed(2)} (${percentDiff.toFixed(1)}% drift)`,
        details: {
          route: route.name,
          apiPrice,
          expectedPrice: expected.customerPrice,
          basePrice,
          markupExpected: expected.markupAmount,
          difference,
          percentDiff,
        },
        timestamp,
      });
    }

    return {
      timestamp,
      route: route.name,
      success: true,
      responseTime: time,
      priceCheck: {
        apiPrice,
        expectedPrice: expected.customerPrice,
        difference,
        percentDiff,
        withinThreshold,
      },
    };
  } catch (error: any) {
    state.errorCount++;

    await sendAlert({
      severity: 'critical',
      title: 'API Error',
      message: `Flight search failed for ${route.name}: ${error.message}`,
      details: { route: route.name, error: error.message },
      timestamp,
    });

    return {
      timestamp,
      route: route.name,
      success: false,
      responseTime: 0,
      error: error.message,
    };
  }
}

/**
 * Send alert to configured channels
 */
async function sendAlert(alert: AlertPayload): Promise<void> {
  state.alerts.push(alert);

  console.log(`[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`);

  // Send to Slack
  if (CONFIG.alerts.slack) {
    try {
      const color = alert.severity === 'critical' ? '#dc2626' :
                    alert.severity === 'error' ? '#f97316' : '#eab308';

      await makeRequest(CONFIG.alerts.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [{
            color,
            title: alert.title,
            text: alert.message,
            fields: Object.entries(alert.details).map(([title, value]) => ({
              title,
              value: typeof value === 'number' ? value.toFixed(2) : String(value),
              short: true,
            })),
            footer: 'Fly2Any Fare Monitor',
            ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
          }],
        }),
      });
    } catch (e) {
      console.error('Failed to send Slack alert:', e);
    }
  }

  // Send to PagerDuty (critical only)
  if (CONFIG.alerts.pagerduty && alert.severity === 'critical') {
    try {
      await makeRequest('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routing_key: CONFIG.alerts.pagerduty,
          event_action: 'trigger',
          payload: {
            summary: `${alert.title}: ${alert.message}`,
            severity: 'critical',
            source: 'fly2any-fare-monitor',
            custom_details: alert.details,
          },
        }),
      });
    } catch (e) {
      console.error('Failed to send PagerDuty alert:', e);
    }
  }
}

/**
 * Run monitoring check for all routes
 */
async function runMonitoringCycle(): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Fare Monitor - ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const results: MonitorResult[] = [];

  for (const route of CONFIG.routes) {
    const result = await checkRoute(route);
    results.push(result);
    state.results.push(result);

    if (result.success) {
      state.successCount++;
      const status = result.priceCheck?.withinThreshold ? '✅' : '⚠️';
      const priceInfo = result.priceCheck
        ? `API=$${result.priceCheck.apiPrice.toFixed(2)}, Expected=$${result.priceCheck.expectedPrice.toFixed(2)} (${result.priceCheck.percentDiff.toFixed(1)}%)`
        : 'No price data';
      console.log(`${status} ${route.name}: ${priceInfo} [${result.responseTime}ms]`);
    } else {
      console.log(`❌ ${route.name}: ${result.error}`);
    }

    // Small delay between routes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calculate error rate
  const totalChecks = state.successCount + state.errorCount;
  const errorRate = totalChecks > 0 ? (state.errorCount / totalChecks) * 100 : 0;

  if (errorRate > CONFIG.thresholds.errorRatePercent) {
    await sendAlert({
      severity: 'critical',
      title: 'High Error Rate',
      message: `Error rate is ${errorRate.toFixed(1)}% (threshold: ${CONFIG.thresholds.errorRatePercent}%)`,
      details: { errorRate, totalChecks, errorCount: state.errorCount },
      timestamp: new Date().toISOString(),
    });
  }

  // Summary
  const passed = results.filter(r => r.success && r.priceCheck?.withinThreshold).length;
  const warnings = results.filter(r => r.success && !r.priceCheck?.withinThreshold).length;
  const errors = results.filter(r => !r.success).length;

  console.log(`\nSummary: ${passed} passed, ${warnings} warnings, ${errors} errors`);

  state.lastCheck = new Date();
}

/**
 * Start continuous monitoring
 */
async function startContinuousMonitoring(): Promise<void> {
  console.log(`Starting continuous fare monitoring...`);
  console.log(`Interval: ${CONFIG.interval / 1000}s`);
  console.log(`Routes: ${CONFIG.routes.map(r => r.name).join(', ')}`);
  console.log(`Thresholds: ${CONFIG.thresholds.priceDriftPercent}% / $${CONFIG.thresholds.priceDriftAmount}`);

  // Initial check
  await runMonitoringCycle();

  // Schedule recurring checks
  setInterval(async () => {
    await runMonitoringCycle();
  }, CONFIG.interval);
}

/**
 * Generate monitoring report
 */
function generateReport(): string {
  const recentResults = state.results.slice(-50);
  const passCount = recentResults.filter(r => r.priceCheck?.withinThreshold).length;
  const passRate = recentResults.length > 0 ? (passCount / recentResults.length) * 100 : 0;

  return `
Fare Monitoring Report
======================
Generated: ${new Date().toISOString()}
Total Checks: ${state.results.length}
Recent Pass Rate: ${passRate.toFixed(1)}%
Alerts Sent: ${state.alerts.length}

Recent Results:
${recentResults.slice(-10).map(r =>
  `  [${r.timestamp}] ${r.route}: ${r.success ? 'OK' : 'FAIL'} ${r.priceCheck ? `($${r.priceCheck.apiPrice.toFixed(2)})` : ''}`
).join('\n')}
  `;
}

// CLI entry point
(async () => {
  const args = process.argv.slice(2);
  const continuous = args.includes('--continuous');
  const routeArg = args.find(a => a.startsWith('--routes='));

  if (routeArg) {
    const routeCodes = routeArg.replace('--routes=', '').split(',');
    const filteredRoutes = CONFIG.routes.filter(r =>
      routeCodes.some(code => r.name.includes(code) || `${r.origin}-${r.destination}` === code)
    );
    if (filteredRoutes.length > 0) {
      CONFIG.routes.length = 0;
      CONFIG.routes.push(...filteredRoutes);
    }
  }

  if (continuous) {
    await startContinuousMonitoring();
  } else {
    await runMonitoringCycle();
    console.log(generateReport());
    process.exit(state.alerts.filter(a => a.severity === 'critical').length > 0 ? 1 : 0);
  }
})();

export { runMonitoringCycle, checkRoute, sendAlert, generateReport };
