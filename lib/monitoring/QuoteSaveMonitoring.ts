/**
 * Quote Save Monitoring & Alerting System
 * Production-grade monitoring for hardened quote save endpoints
 */

import { getQuoteMetrics } from '@/lib/logging/quote-observability';

// ========================================
// MONITORING METRICS
// ========================================

export interface MonitoringMetrics {
  // Performance Metrics
  successRate: number;
  failureRate: number;
  p95Latency: number;
  p99Latency: number;
  averageLatency: number;

  // Error Metrics by Code
  errorByCode: Record<string, number>;
  criticalErrorRate: number;
  highSeverityErrorRate: number;

  // Concurrency Metrics
  conflictRate: number;
  rollbackRate: number;
  transactionTimeoutRate: number;

  // Observability Metrics
  correlationIdCoverage: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
}

/**
 * Collect monitoring metrics from QuoteOperationTracker
 */
export async function collectMonitoringMetrics(
  timeWindowMs: number = 300000 // 5 minutes
): Promise<MonitoringMetrics> {
  const metrics = await getQuoteMetrics(timeWindowMs);

  const totalOperations = metrics.totalOperations;
  const successfulOperations = metrics.successfulOperations;
  const failedOperations = metrics.failedOperations;

  const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 100;
  const failureRate = totalOperations > 0 ? (failedOperations / totalOperations) * 100 : 0;

  // Calculate error rates by severity
  let criticalErrors = 0;
  let highSeverityErrors = 0;

  Object.entries(metrics.errorByCode).forEach(([code, count]) => {
    const severity = getErrorSeverity(code);
    if (severity === 'CRITICAL') criticalErrors += count;
    if (severity === 'HIGH') highSeverityErrors += count;
  });

  const criticalErrorRate = totalOperations > 0 ? (criticalErrors / totalOperations) * 100 : 0;
  const highSeverityErrorRate = totalOperations > 0 ? (highSeverityErrors / totalOperations) * 100 : 0;

  return {
    successRate,
    failureRate,
    p95Latency: metrics.p95Duration,
    p99Latency: metrics.p99Duration,
    averageLatency: metrics.averageDuration,
    errorByCode: metrics.errorByCode,
    criticalErrorRate,
    highSeverityErrorRate,
    conflictRate: calculateErrorRate(metrics.errorByCode, 'QUOTE_CONFLICT_VERSION', totalOperations),
    rollbackRate: calculateErrorRate(metrics.errorByCode, 'DATABASE_TRANSACTION_ABORTED', totalOperations),
    transactionTimeoutRate: calculateErrorRate(metrics.errorByCode, 'DATABASE_TIMEOUT', totalOperations),
    correlationIdCoverage: 100, // All operations have correlation IDs by design
    totalOperations,
    successfulOperations,
    failedOperations,
  };
}

function calculateErrorRate(
  errorByCode: Record<string, number>,
  errorCode: string,
  totalOperations: number
): number {
  const errorCount = errorByCode[errorCode] || 0;
  return totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;
}

function getErrorSeverity(errorCode: string): 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL' {
  const criticalCodes = [
    'QUOTE_ALREADY_SENT',
    'QUOTE_PERSISTENCE_FAILED',
    'DATABASE_TRANSACTION_ABORTED',
    'ITEMS_INCONSISTENT',
    'INTERNAL_ERROR',
  ];

  const highCodes = [
    'QUOTE_VALIDATION_FAILED',
    'QUOTE_STATE_INVALID',
    'QUOTE_CONFLICT_VERSION',
    'DATABASE_TIMEOUT',
    'AUTHENTICATION_FAILED',
    'AUTHORIZATION_FAILED',
    'CLIENT_NOT_FOUND',
    'AGENT_NOT_FOUND',
    'PRICING_VALIDATION_FAILED',
    'CURRENCY_INVALID',
    'QUOTA_EXCEEDED',
    'RATE_LIMIT_EXCEEDED',
  ];

  if (criticalCodes.includes(errorCode)) return 'CRITICAL';
  if (highCodes.includes(errorCode)) return 'HIGH';
  return 'WARN';
}

// ========================================
// ALERTING RULES
// ========================================

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  condition: (metrics: MonitoringMetrics) => boolean;
  message: (metrics: MonitoringMetrics) => string;
  channels: AlertChannel[];
}

export type AlertChannel = 'TELEGRAM' | 'WEBHOOK' | 'SLACK' | 'EMAIL';

export const ALERT_RULES: AlertRule[] = [
  // ========================================
  // CRITICAL ALERTS (Immediate Action Required)
  // ========================================

  {
    id: 'CRITICAL-001',
    name: 'Critical Error Rate Exceeded',
    description: 'Any CRITICAL error rate exceeds 1% in 5-minute window',
    severity: 'CRITICAL',
    condition: (metrics) => metrics.criticalErrorRate > 1,
    message: (metrics) => 
      `🚨 CRITICAL: Critical error rate is ${metrics.criticalErrorRate.toFixed(2)}% (threshold: 1%)` +
      `\nTotal operations: ${metrics.totalOperations}` +
      `\nCritical errors: ${Math.round(metrics.totalOperations * metrics.criticalErrorRate / 100)}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'CRITICAL-002',
    name: 'Quote Persistence Failed',
    description: 'QUOTE_PERSISTENCE_FAILED occurred',
    severity: 'CRITICAL',
    condition: (metrics) => metrics.errorByCode['QUOTE_PERSISTENCE_FAILED'] > 0,
    message: (metrics) => 
      `🚨 CRITICAL: Quote persistence failed` +
      `\nOccurrences: ${metrics.errorByCode['QUOTE_PERSISTENCE_FAILED']}` +
      `\nTotal operations: ${metrics.totalOperations}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'CRITICAL-003',
    name: 'Database Timeout',
    description: 'DATABASE_TIMEOUT occurred',
    severity: 'CRITICAL',
    condition: (metrics) => metrics.errorByCode['DATABASE_TIMEOUT'] > 0,
    message: (metrics) => 
      `🚨 CRITICAL: Database timeout occurred` +
      `\nOccurrences: ${metrics.errorByCode['DATABASE_TIMEOUT']}` +
      `\nTotal operations: ${metrics.totalOperations}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'CRITICAL-004',
    name: 'Transaction Abort',
    description: 'DATABASE_TRANSACTION_ABORTED occurred',
    severity: 'CRITICAL',
    condition: (metrics) => metrics.errorByCode['DATABASE_TRANSACTION_ABORTED'] > 0,
    message: (metrics) => 
      `🚨 CRITICAL: Database transaction aborted` +
      `\nOccurrences: ${metrics.errorByCode['DATABASE_TRANSACTION_ABORTED']}` +
      `\nTotal operations: ${metrics.totalOperations}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  // ========================================
  // HIGH ALERTS (Investigation Required)
  // ========================================

  {
    id: 'HIGH-001',
    name: 'Rollback Rate Exceeded',
    description: 'Transaction rollback rate exceeds 2% in 5-minute window',
    severity: 'HIGH',
    condition: (metrics) => metrics.rollbackRate > 2,
    message: (metrics) => 
      `⚠️ HIGH: Transaction rollback rate is ${metrics.rollbackRate.toFixed(2)}% (threshold: 2%)` +
      `\nTotal operations: ${metrics.totalOperations}` +
      `\nRollbacks: ${Math.round(metrics.totalOperations * metrics.rollbackRate / 100)}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'HIGH-002',
    name: 'PATCH Success Rate Low',
    description: 'PATCH success rate falls below 95% in 5-minute window',
    severity: 'HIGH',
    condition: (metrics) => metrics.successRate < 95,
    message: (metrics) => 
      `⚠️ HIGH: Quote save success rate is ${metrics.successRate.toFixed(2)}% (threshold: 95%)` +
      `\nTotal operations: ${metrics.totalOperations}` +
      `\nSuccessful: ${metrics.successfulOperations}` +
      `\nFailed: ${metrics.failedOperations}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'HIGH-003',
    name: 'P95 Latency High',
    description: 'P95 latency exceeds 500ms in 5-minute window',
    severity: 'HIGH',
    condition: (metrics) => metrics.p95Latency > 500,
    message: (metrics) => 
      `⚠️ HIGH: P95 latency is ${metrics.p95Latency}ms (threshold: 500ms)` +
      `\nP99 latency: ${metrics.p99Latency}ms` +
      `\nAverage latency: ${metrics.averageLatency}ms`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'HIGH-004',
    name: 'P99 Latency High',
    description: 'P99 latency exceeds 1000ms in 5-minute window',
    severity: 'HIGH',
    condition: (metrics) => metrics.p99Latency > 1000,
    message: (metrics) => 
      `⚠️ HIGH: P99 latency is ${metrics.p99Latency}ms (threshold: 1000ms)` +
      `\nP95 latency: ${metrics.p95Latency}ms` +
      `\nAverage latency: ${metrics.averageLatency}ms`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  {
    id: 'HIGH-005',
    name: 'Conflict Rate High',
    description: 'Quote conflict rate exceeds 0.1% in 5-minute window',
    severity: 'HIGH',
    condition: (metrics) => metrics.conflictRate > 0.1,
    message: (metrics) => 
      `⚠️ HIGH: Quote conflict rate is ${metrics.conflictRate.toFixed(3)}% (threshold: 0.1%)` +
      `\nTotal operations: ${metrics.totalOperations}` +
      `\nConflicts: ${Math.round(metrics.totalOperations * metrics.conflictRate / 100)}`,
    channels: ['TELEGRAM', 'WEBHOOK'],
  },

  // ========================================
  // MEDIUM ALERTS (Monitoring Required)
  // ========================================

  {
    id: 'MEDIUM-001',
    name: 'Validation Failure Rate Elevated',
    description: 'Validation failure rate exceeds 0.5% in 5-minute window',
    severity: 'MEDIUM',
    condition: (metrics) => {
      const validationErrors = 
        (metrics.errorByCode['QUOTE_VALIDATION_FAILED'] || 0) +
        (metrics.errorByCode['PRICING_VALIDATION_FAILED'] || 0) +
        (metrics.errorByCode['CURRENCY_INVALID'] || 0);
      const rate = metrics.totalOperations > 0 ? (validationErrors / metrics.totalOperations) * 100 : 0;
      return rate > 0.5;
    },
    message: (metrics) => {
      const validationErrors = 
        (metrics.errorByCode['QUOTE_VALIDATION_FAILED'] || 0) +
        (metrics.errorByCode['PRICING_VALIDATION_FAILED'] || 0) +
        (metrics.errorByCode['CURRENCY_INVALID'] || 0);
      const rate = metrics.totalOperations > 0 ? (validationErrors / metrics.totalOperations) * 100 : 0;
      return `ℹ️ MEDIUM: Validation failure rate is ${rate.toFixed(2)}% (threshold: 0.5%)` +
        `\nValidation errors: ${validationErrors}` +
        `\nTotal operations: ${metrics.totalOperations}`;
    },
    channels: ['WEBHOOK'],
  }
];

// ========================================
// ALERT SENDER
// ========================================

export interface AlertPayload {
  ruleId: string;
  ruleName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  metrics: MonitoringMetrics;
  timestamp: number;
  environment: string;
  correlationId?: string;
}

/**
 * Send alert to configured channels (fire-and-forget)
 */
export async function sendAlert(payload: AlertPayload): Promise<void> {
  const alertPromises = ALERT_RULES
    .find(rule => rule.id === payload.ruleId)
    ?.channels.map(channel => sendToChannel(channel, payload)) || [];

  // Fire-and-forget: don't wait for alert delivery
  alertPromises.forEach(promise => {
    promise.catch(error => {
      // Log alert delivery failure (don't throw)
      console.error(`Alert delivery failed for ${payload.ruleId}:`, error);
    });
  });
}

/**
 * Send alert to specific channel
 */
async function sendToChannel(
  channel: AlertChannel,
  payload: AlertPayload
): Promise<void> {
  switch (channel) {
    case 'TELEGRAM':
      await sendToTelegram(payload);
      break;
    case 'WEBHOOK':
      await sendToWebhook(payload);
      break;
    case 'SLACK':
      await sendToSlack(payload);
      break;
    case 'EMAIL':
      await sendToEmail(payload);
      break;
  }
}

/**
 * Send alert to Telegram
 */
async function sendToTelegram(payload: AlertPayload): Promise<void> {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotToken || !telegramChatId) {
    console.warn('Telegram credentials not configured');
    return;
  }

  const message = formatAlertMessage(payload);

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const body = {
    chat_id: telegramChatId,
    text: message,
    parse_mode: 'Markdown',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }
}

/**
 * Send alert to webhook
 */
async function sendToWebhook(payload: AlertPayload): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Webhook URL not configured');
    return;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.status}`);
  }
}

/**
 * Send alert to Slack (placeholder)
 */
async function sendToSlack(payload: AlertPayload): Promise<void> {
  // TODO: Implement Slack integration
  console.log('Slack alert:', payload);
}

/**
 * Send alert to email (placeholder)
 */
async function sendToEmail(payload: AlertPayload): Promise<void> {
  // TODO: Implement email integration
  console.log('Email alert:', payload);
}

/**
 * Format alert message for readability
 */
function formatAlertMessage(payload: AlertPayload): string {
  const environment = process.env.NODE_ENV || 'unknown';
  const emoji = payload.severity === 'CRITICAL' ? '🚨' : payload.severity === 'HIGH' ? '⚠️' : 'ℹ️';

  return `
${emoji} *${payload.ruleName}* (${environment})

${payload.message}

*Metrics:*
• Success Rate: ${payload.metrics.successRate.toFixed(2)}%
• Failure Rate: ${payload.metrics.failureRate.toFixed(2)}%
• P95 Latency: ${payload.metrics.p95Latency}ms
• P99 Latency: ${payload.metrics.p99Latency}ms
• Critical Errors: ${payload.metrics.criticalErrorRate.toFixed(2)}%
• Conflict Rate: ${payload.metrics.conflictRate.toFixed(3)}%
• Rollback Rate: ${payload.metrics.rollbackRate.toFixed(2)}%

*Timestamp:* ${new Date(payload.timestamp).toISOString()}
${payload.correlationId ? `*Correlation ID:* \`${payload.correlationId}\`` : ''}
`.trim();
}

// ========================================
// MONITORING LOOP
// ========================================

let monitoringInterval: NodeJS.Timeout | null = null;

/**
 * Start monitoring loop (runs every 5 minutes)
 */
export function startMonitoring(): void {
  if (monitoringInterval) {
    console.warn('Monitoring already started');
    return;
  }

  console.log('Starting quote save monitoring...');
  
  monitoringInterval = setInterval(async () => {
    try {
      const metrics = await collectMonitoringMetrics();
      await evaluateAlertRules(metrics);
    } catch (error) {
      console.error('Monitoring loop error:', error);
    }
  }, 300000); // 5 minutes

  console.log('Quote save monitoring started (interval: 5 minutes)');
}

/**
 * Stop monitoring loop
 */
export function stopMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('Quote save monitoring stopped');
  }
}

/**
 * Evaluate all alert rules against current metrics
 */
async function evaluateAlertRules(metrics: MonitoringMetrics): Promise<void> {
  const triggeredRules = ALERT_RULES.filter(rule => rule.condition(metrics));

  for (const rule of triggeredRules) {
    const payload: AlertPayload = {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: rule.message(metrics),
      metrics,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'unknown',
    };

    await sendAlert(payload);
  }
}