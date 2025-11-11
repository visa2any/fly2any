#!/usr/bin/env node
/**
 * Uptime Monitor Script
 *
 * Monitors application availability and sends alerts when endpoints are down.
 * Can be run as a standalone script or cron job.
 *
 * Usage:
 *   npm run monitor:uptime
 *   node scripts/uptime-monitor.ts
 *
 * Environment variables:
 *   - MONITOR_URL: Base URL to monitor (default: https://fly2any.com)
 *   - MONITOR_INTERVAL: Check interval in minutes (default: 5)
 *   - ALERT_EMAIL: Email address for alerts
 *   - SLACK_WEBHOOK_URL: Slack webhook for notifications
 */

interface EndpointConfig {
  url: string;
  name: string;
  method?: 'GET' | 'HEAD' | 'POST';
  timeout?: number;
  expectedStatus?: number[];
  critical?: boolean;
}

interface CheckResult {
  endpoint: EndpointConfig;
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  timestamp: number;
}

interface MonitorStats {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  avgResponseTime: number;
  uptime: string;
}

class UptimeMonitor {
  private baseUrl: string;
  private endpoints: EndpointConfig[];
  private checkHistory: Map<string, CheckResult[]> = new Map();
  private maxHistorySize = 100;
  private stats: Map<string, MonitorStats> = new Map();

  constructor(baseUrl: string = 'https://fly2any.com') {
    this.baseUrl = baseUrl;
    this.endpoints = this.initializeEndpoints();
  }

  /**
   * Initialize endpoints to monitor
   */
  private initializeEndpoints(): EndpointConfig[] {
    return [
      {
        url: `${this.baseUrl}/`,
        name: 'Homepage',
        method: 'GET',
        timeout: 10000,
        expectedStatus: [200],
        critical: true,
      },
      {
        url: `${this.baseUrl}/api/health`,
        name: 'Health Check',
        method: 'GET',
        timeout: 5000,
        expectedStatus: [200, 207],
        critical: true,
      },
      {
        url: `${this.baseUrl}/flights`,
        name: 'Flights Page',
        method: 'GET',
        timeout: 10000,
        expectedStatus: [200],
        critical: true,
      },
      {
        url: `${this.baseUrl}/hotels`,
        name: 'Hotels Page',
        method: 'GET',
        timeout: 10000,
        expectedStatus: [200],
        critical: false,
      },
      {
        url: `${this.baseUrl}/api/flights/airports`,
        name: 'Airports API',
        method: 'GET',
        timeout: 5000,
        expectedStatus: [200],
        critical: false,
      },
      {
        url: `${this.baseUrl}/api/environment`,
        name: 'Environment API',
        method: 'GET',
        timeout: 3000,
        expectedStatus: [200],
        critical: false,
      },
    ];
  }

  /**
   * Check a single endpoint
   */
  async checkEndpoint(endpoint: EndpointConfig): Promise<CheckResult> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        endpoint.timeout || 10000
      );

      const response = await fetch(endpoint.url, {
        method: endpoint.method || 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Fly2Any-UptimeMonitor/1.0',
        },
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const expectedStatuses = endpoint.expectedStatus || [200];
      const success = expectedStatuses.includes(response.status);

      const result: CheckResult = {
        endpoint,
        success,
        statusCode: response.status,
        responseTime,
        timestamp: Date.now(),
      };

      if (!success) {
        result.error = `Unexpected status code: ${response.status}`;
      }

      this.storeResult(endpoint.name, result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const result: CheckResult = {
        endpoint,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };

      this.storeResult(endpoint.name, result);
      return result;
    }
  }

  /**
   * Store check result in history
   */
  private storeResult(endpointName: string, result: CheckResult): void {
    if (!this.checkHistory.has(endpointName)) {
      this.checkHistory.set(endpointName, []);
    }

    const history = this.checkHistory.get(endpointName)!;
    history.push(result);

    // Keep only recent checks
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    // Update stats
    this.updateStats(endpointName);
  }

  /**
   * Update statistics for an endpoint
   */
  private updateStats(endpointName: string): void {
    const history = this.checkHistory.get(endpointName) || [];

    if (history.length === 0) return;

    const totalChecks = history.length;
    const successfulChecks = history.filter(r => r.success).length;
    const failedChecks = totalChecks - successfulChecks;

    const responseTimes = history
      .filter(r => r.responseTime !== undefined)
      .map(r => r.responseTime!);

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

    const uptime = ((successfulChecks / totalChecks) * 100).toFixed(2);

    this.stats.set(endpointName, {
      totalChecks,
      successfulChecks,
      failedChecks,
      avgResponseTime,
      uptime: `${uptime}%`,
    });
  }

  /**
   * Check all endpoints
   */
  async checkAll(): Promise<CheckResult[]> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Uptime check: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    const results = await Promise.all(
      this.endpoints.map(endpoint => this.checkEndpoint(endpoint))
    );

    // Log results
    for (const result of results) {
      this.logResult(result);
    }

    // Check if any critical endpoints are down
    const criticalFailures = results.filter(
      r => !r.success && r.endpoint.critical
    );

    if (criticalFailures.length > 0) {
      await this.sendAlert('CRITICAL', criticalFailures);
    }

    // Check if any endpoints are slow
    const slowEndpoints = results.filter(
      r => r.success && r.responseTime && r.responseTime > 5000
    );

    if (slowEndpoints.length > 0) {
      await this.sendAlert('WARNING', slowEndpoints);
    }

    return results;
  }

  /**
   * Log check result
   */
  private logResult(result: CheckResult): void {
    const emoji = result.success ? '✅' : '❌';
    const name = result.endpoint.name.padEnd(20);
    const status = result.statusCode?.toString() || 'ERR';
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';

    if (result.success) {
      console.log(`${emoji} ${name} [${status}] ${time}`);
    } else {
      console.log(`${emoji} ${name} [${status}] ${time}`);
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Send alert for failures
   */
  async sendAlert(
    level: 'WARNING' | 'CRITICAL',
    results: CheckResult[]
  ): Promise<void> {
    const emoji = level === 'CRITICAL' ? '🚨' : '⚠️';
    const message = `${emoji} ${level}: Endpoint Health Issue`;

    console.log(`\n${message}`);

    const details = results.map(r => ({
      endpoint: r.endpoint.name,
      url: r.endpoint.url,
      error: r.error,
      statusCode: r.statusCode,
      responseTime: r.responseTime,
    }));

    console.log('Failed endpoints:', JSON.stringify(details, null, 2));

    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(level, details);
    }

    // Send to email
    if (process.env.ALERT_EMAIL) {
      console.log(`Would send email alert to: ${process.env.ALERT_EMAIL}`);
    }
  }

  /**
   * Send Slack notification
   */
  async sendSlackAlert(
    level: 'WARNING' | 'CRITICAL',
    details: any[]
  ): Promise<void> {
    try {
      const color = level === 'CRITICAL' ? '#ff0000' : '#ffaa00';
      const emoji = level === 'CRITICAL' ? '🚨' : '⚠️';

      await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} ${level}: Uptime Monitor Alert`,
          attachments: [
            {
              color,
              title: `${level}: Endpoint Health Issue`,
              text: details
                .map(
                  d =>
                    `*${d.endpoint}*\n` +
                    `URL: ${d.url}\n` +
                    `Error: ${d.error || 'N/A'}\n` +
                    `Status: ${d.statusCode || 'N/A'}\n`
                )
                .join('\n'),
              footer: 'Fly2Any Uptime Monitor',
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      });

      console.log('✅ Slack alert sent');
    } catch (error) {
      console.error('❌ Failed to send Slack alert:', error);
    }
  }

  /**
   * Print statistics
   */
  printStats(): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 STATISTICS');
    console.log(`${'='.repeat(60)}\n`);

    for (const [name, stats] of this.stats.entries()) {
      console.log(`${name}:`);
      console.log(`  Total checks: ${stats.totalChecks}`);
      console.log(`  Successful: ${stats.successfulChecks}`);
      console.log(`  Failed: ${stats.failedChecks}`);
      console.log(`  Uptime: ${stats.uptime}`);
      console.log(`  Avg response time: ${Math.round(stats.avgResponseTime)}ms`);
      console.log('');
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMinutes: number = 5): void {
    console.log(`🚀 Starting uptime monitoring (interval: ${intervalMinutes} minutes)`);

    // Initial check
    this.checkAll();

    // Set up interval
    setInterval(
      () => {
        this.checkAll();
        this.printStats();
      },
      intervalMinutes * 60 * 1000
    );
  }
}

/**
 * Main execution
 */
async function main() {
  const baseUrl = process.env.MONITOR_URL || 'https://fly2any.com';
  const interval = parseInt(process.env.MONITOR_INTERVAL || '5', 10);
  const continuous = process.argv.includes('--continuous');

  const monitor = new UptimeMonitor(baseUrl);

  if (continuous) {
    // Run continuously
    monitor.startMonitoring(interval);
  } else {
    // Single run
    await monitor.checkAll();
    monitor.printStats();
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { UptimeMonitor };
