/**
 * Real-time Alerting System - Fly2Any Growth OS
 *
 * Monitor and alert on important business events
 */

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success'
export type AlertCategory = 'revenue' | 'traffic' | 'system' | 'seo' | 'conversion' | 'content' | 'security'

export interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  category: AlertCategory
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  metadata?: Record<string, any>
  actionUrl?: string
}

export interface AlertRule {
  id: string
  name: string
  description: string
  category: AlertCategory
  enabled: boolean
  condition: AlertCondition
  severity: AlertSeverity
  cooldownMinutes: number
  channels: AlertChannel[]
  lastTriggered?: Date
}

export interface AlertCondition {
  type: 'threshold' | 'change' | 'anomaly' | 'absence'
  metric: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: number
  windowMinutes?: number
  changePercent?: number
}

export type AlertChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'push' | 'dashboard'

// Default alert rules
export const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id'>[] = [
  {
    name: 'Revenue Spike',
    description: 'Alert when hourly revenue exceeds $10,000',
    category: 'revenue',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'hourly_revenue',
      operator: '>',
      value: 10000,
      windowMinutes: 60
    },
    severity: 'success',
    cooldownMinutes: 60,
    channels: ['dashboard', 'slack']
  },
  {
    name: 'Revenue Drop',
    description: 'Alert when revenue drops 50% compared to previous period',
    category: 'revenue',
    enabled: true,
    condition: {
      type: 'change',
      metric: 'hourly_revenue',
      operator: '<',
      value: 0,
      changePercent: -50,
      windowMinutes: 60
    },
    severity: 'critical',
    cooldownMinutes: 30,
    channels: ['dashboard', 'email', 'slack']
  },
  {
    name: 'Traffic Surge',
    description: 'Alert when traffic increases 100% vs normal',
    category: 'traffic',
    enabled: true,
    condition: {
      type: 'change',
      metric: 'requests_per_minute',
      operator: '>',
      value: 0,
      changePercent: 100,
      windowMinutes: 15
    },
    severity: 'warning',
    cooldownMinutes: 30,
    channels: ['dashboard']
  },
  {
    name: 'Conversion Rate Drop',
    description: 'Alert when conversion rate drops below 1%',
    category: 'conversion',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'conversion_rate',
      operator: '<',
      value: 1,
      windowMinutes: 1440 // 24 hours
    },
    severity: 'warning',
    cooldownMinutes: 240,
    channels: ['dashboard', 'email']
  },
  {
    name: 'Cart Abandonment Spike',
    description: 'Alert when cart abandonment exceeds 80%',
    category: 'conversion',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'cart_abandonment_rate',
      operator: '>',
      value: 80,
      windowMinutes: 60
    },
    severity: 'warning',
    cooldownMinutes: 60,
    channels: ['dashboard']
  },
  {
    name: 'API Error Rate High',
    description: 'Alert when API error rate exceeds 5%',
    category: 'system',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'api_error_rate',
      operator: '>',
      value: 5,
      windowMinutes: 15
    },
    severity: 'critical',
    cooldownMinutes: 15,
    channels: ['dashboard', 'slack', 'email']
  },
  {
    name: 'Search Index Drop',
    description: 'Alert when indexed pages drop significantly',
    category: 'seo',
    enabled: true,
    condition: {
      type: 'change',
      metric: 'indexed_pages',
      operator: '<',
      value: 0,
      changePercent: -20,
      windowMinutes: 1440
    },
    severity: 'critical',
    cooldownMinutes: 720,
    channels: ['dashboard', 'email']
  },
  {
    name: 'Core Web Vitals Degradation',
    description: 'Alert when LCP exceeds 4 seconds',
    category: 'seo',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'lcp_seconds',
      operator: '>',
      value: 4,
      windowMinutes: 60
    },
    severity: 'warning',
    cooldownMinutes: 120,
    channels: ['dashboard']
  },
  {
    name: 'Price Alert Trigger',
    description: 'Alert when a price alert threshold is met',
    category: 'content',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'price_alert_triggered',
      operator: '==',
      value: 1
    },
    severity: 'info',
    cooldownMinutes: 0,
    channels: ['email', 'push']
  },
  {
    name: 'Security: Suspicious Activity',
    description: 'Alert on potential security threats',
    category: 'security',
    enabled: true,
    condition: {
      type: 'threshold',
      metric: 'suspicious_requests',
      operator: '>',
      value: 100,
      windowMinutes: 5
    },
    severity: 'critical',
    cooldownMinutes: 5,
    channels: ['dashboard', 'email', 'slack']
  }
]

// In-memory alert store (replace with database in production)
const alerts: Alert[] = []
const alertRules: Map<string, AlertRule> = new Map()
const lastTriggered: Map<string, Date> = new Map()

/**
 * Initialize alert rules
 */
export function initializeAlertRules(): void {
  DEFAULT_ALERT_RULES.forEach((rule, index) => {
    const id = `rule_${index + 1}`
    alertRules.set(id, { ...rule, id })
  })
}

/**
 * Create a new alert
 */
export function createAlert(
  title: string,
  message: string,
  severity: AlertSeverity,
  category: AlertCategory,
  metadata?: Record<string, any>,
  actionUrl?: string
): Alert {
  const alert: Alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    message,
    severity,
    category,
    timestamp: new Date(),
    acknowledged: false,
    metadata,
    actionUrl
  }

  alerts.unshift(alert) // Add to beginning

  // Keep only last 1000 alerts
  if (alerts.length > 1000) {
    alerts.pop()
  }

  return alert
}

/**
 * Get all alerts with optional filtering
 */
export function getAlerts(options?: {
  severity?: AlertSeverity
  category?: AlertCategory
  acknowledged?: boolean
  limit?: number
  since?: Date
}): Alert[] {
  let filtered = [...alerts]

  if (options?.severity) {
    filtered = filtered.filter(a => a.severity === options.severity)
  }
  if (options?.category) {
    filtered = filtered.filter(a => a.category === options.category)
  }
  if (options?.acknowledged !== undefined) {
    filtered = filtered.filter(a => a.acknowledged === options.acknowledged)
  }
  if (options?.since) {
    filtered = filtered.filter(a => a.timestamp >= options.since)
  }
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
  const alert = alerts.find(a => a.id === alertId)
  if (alert) {
    alert.acknowledged = true
    alert.acknowledgedBy = acknowledgedBy
    alert.acknowledgedAt = new Date()
    return true
  }
  return false
}

/**
 * Check if a rule should trigger (respects cooldown)
 */
export function shouldTriggerRule(ruleId: string): boolean {
  const rule = alertRules.get(ruleId)
  if (!rule || !rule.enabled) return false

  const last = lastTriggered.get(ruleId)
  if (!last) return true

  const cooldownMs = rule.cooldownMinutes * 60 * 1000
  return Date.now() - last.getTime() > cooldownMs
}

/**
 * Trigger an alert from a rule
 */
export function triggerRuleAlert(ruleId: string, data?: Record<string, any>): Alert | null {
  const rule = alertRules.get(ruleId)
  if (!rule || !shouldTriggerRule(ruleId)) return null

  lastTriggered.set(ruleId, new Date())

  return createAlert(
    rule.name,
    rule.description,
    rule.severity,
    rule.category,
    { ruleId, ...data },
    undefined
  )
}

/**
 * Get alert statistics
 */
export function getAlertStats(): {
  total: number
  unacknowledged: number
  bySeverity: Record<AlertSeverity, number>
  byCategory: Record<AlertCategory, number>
  last24Hours: number
} {
  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const stats = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    bySeverity: {
      critical: 0,
      warning: 0,
      info: 0,
      success: 0
    } as Record<AlertSeverity, number>,
    byCategory: {
      revenue: 0,
      traffic: 0,
      system: 0,
      seo: 0,
      conversion: 0,
      content: 0,
      security: 0
    } as Record<AlertCategory, number>,
    last24Hours: alerts.filter(a => a.timestamp >= last24Hours).length
  }

  alerts.forEach(alert => {
    stats.bySeverity[alert.severity]++
    stats.byCategory[alert.category]++
  })

  return stats
}

/**
 * Get all alert rules
 */
export function getAlertRules(): AlertRule[] {
  return Array.from(alertRules.values())
}

/**
 * Update an alert rule
 */
export function updateAlertRule(ruleId: string, updates: Partial<AlertRule>): AlertRule | null {
  const rule = alertRules.get(ruleId)
  if (!rule) return null

  const updated = { ...rule, ...updates, id: ruleId }
  alertRules.set(ruleId, updated)
  return updated
}

/**
 * Send alert to specified channels
 */
export async function sendAlertToChannels(alert: Alert, channels: AlertChannel[]): Promise<void> {
  for (const channel of channels) {
    switch (channel) {
      case 'email':
        // Integrate with email service
        console.log(`[Alert Email] ${alert.severity.toUpperCase()}: ${alert.title}`)
        break
      case 'slack':
        // Integrate with Slack webhook
        console.log(`[Alert Slack] ${alert.severity.toUpperCase()}: ${alert.title}`)
        break
      case 'webhook':
        // Send to configured webhook
        console.log(`[Alert Webhook] ${alert.severity.toUpperCase()}: ${alert.title}`)
        break
      case 'sms':
        // Send SMS via Twilio etc
        console.log(`[Alert SMS] ${alert.severity.toUpperCase()}: ${alert.title}`)
        break
      case 'push':
        // Send push notification
        console.log(`[Alert Push] ${alert.severity.toUpperCase()}: ${alert.title}`)
        break
      case 'dashboard':
        // Already stored, will show in dashboard
        break
    }
  }
}

// Initialize on module load
initializeAlertRules()
