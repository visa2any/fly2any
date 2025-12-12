/**
 * Growth Automation Orchestrator - Fly2Any Growth OS
 *
 * Central control for all automated growth tasks
 */

import { runDailyContentJob } from '@/lib/agents/content-agent'
import { runSEOAudit } from '@/lib/agents/seo-auditor'
import { monitorCompetitors } from '@/lib/agents/competitor-monitor'
import { generateWeeklyReport, sendScheduledReport, DEFAULT_CONFIG } from '@/lib/growth/weekly-reports'
import { createAlert, triggerRuleAlert } from '@/lib/growth/alerting-system'

export interface AutomationTask {
  id: string
  name: string
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
  status: 'idle' | 'running' | 'success' | 'error'
  error?: string
}

export interface AutomationResult {
  taskId: string
  success: boolean
  duration: number
  data?: any
  error?: string
}

// Task definitions
const AUTOMATION_TASKS: AutomationTask[] = [
  {
    id: 'content_generation',
    name: 'Daily Content Generation',
    schedule: 'daily',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'social_distribution',
    name: 'Social Media Distribution',
    schedule: 'hourly',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'price_alerts',
    name: 'Price Alert Processing',
    schedule: 'hourly',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'seo_audit',
    name: 'SEO Health Audit',
    schedule: 'daily',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'competitor_monitor',
    name: 'Competitor Monitoring',
    schedule: 'daily',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'weekly_report',
    name: 'Weekly Performance Report',
    schedule: 'weekly',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'sitemap_ping',
    name: 'Sitemap Ping to Search Engines',
    schedule: 'daily',
    enabled: true,
    status: 'idle'
  },
  {
    id: 'cache_warmup',
    name: 'Cache Warmup for Popular Routes',
    schedule: 'hourly',
    enabled: true,
    status: 'idle'
  }
]

// In-memory task state (replace with Redis in production)
const taskState = new Map<string, AutomationTask>()

// Initialize task state
AUTOMATION_TASKS.forEach(task => {
  taskState.set(task.id, { ...task })
})

/**
 * Get all automation tasks
 */
export function getAutomationTasks(): AutomationTask[] {
  return Array.from(taskState.values())
}

/**
 * Update task status
 */
export function updateTaskStatus(taskId: string, updates: Partial<AutomationTask>): void {
  const task = taskState.get(taskId)
  if (task) {
    taskState.set(taskId, { ...task, ...updates })
  }
}

/**
 * Run a specific automation task
 */
export async function runAutomationTask(taskId: string): Promise<AutomationResult> {
  const startTime = Date.now()
  const task = taskState.get(taskId)

  if (!task) {
    return { taskId, success: false, duration: 0, error: 'Task not found' }
  }

  if (!task.enabled) {
    return { taskId, success: false, duration: 0, error: 'Task is disabled' }
  }

  // Update status to running
  updateTaskStatus(taskId, { status: 'running' })

  try {
    let data: any

    switch (taskId) {
      case 'content_generation':
        data = await runContentGenerationTask()
        break

      case 'social_distribution':
        data = await runSocialDistributionTask()
        break

      case 'price_alerts':
        data = await runPriceAlertsTask()
        break

      case 'seo_audit':
        data = await runSEOAuditTask()
        break

      case 'competitor_monitor':
        data = await runCompetitorMonitorTask()
        break

      case 'weekly_report':
        data = await runWeeklyReportTask()
        break

      case 'sitemap_ping':
        data = await runSitemapPingTask()
        break

      case 'cache_warmup':
        data = await runCacheWarmupTask()
        break

      default:
        throw new Error(`Unknown task: ${taskId}`)
    }

    const duration = Date.now() - startTime

    updateTaskStatus(taskId, {
      status: 'success',
      lastRun: new Date(),
      error: undefined
    })

    return { taskId, success: true, duration, data }

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    updateTaskStatus(taskId, {
      status: 'error',
      lastRun: new Date(),
      error: errorMessage
    })

    // Create alert for task failure
    createAlert(
      `Automation Task Failed: ${task.name}`,
      `The ${task.name} task failed with error: ${errorMessage}`,
      'warning',
      'system',
      { taskId, duration }
    )

    return { taskId, success: false, duration, error: errorMessage }
  }
}

/**
 * Run all scheduled tasks for a given schedule
 */
export async function runScheduledTasks(schedule: 'hourly' | 'daily' | 'weekly'): Promise<AutomationResult[]> {
  const tasks = AUTOMATION_TASKS.filter(t => t.schedule === schedule && t.enabled)
  const results: AutomationResult[] = []

  for (const task of tasks) {
    const result = await runAutomationTask(task.id)
    results.push(result)
  }

  return results
}

// Task implementations

async function runContentGenerationTask() {
  console.log('[Automation] Running content generation task')

  const result = await runDailyContentJob()

  // Check if content was generated
  if (result.generated > 0) {
    createAlert(
      'Content Generated Successfully',
      `Generated ${result.generated} new content pieces (${result.deals} deals, ${result.guides} guides, ${result.social} social posts)`,
      'success',
      'content',
      result
    )
  }

  return result
}

async function runSocialDistributionTask() {
  console.log('[Automation] Running social distribution task')

  // This would integrate with distribution-engine.ts
  // For now, return mock result
  const result = {
    posted: 4,
    platforms: ['twitter', 'telegram', 'instagram'],
    scheduled: 2
  }

  return result
}

async function runPriceAlertsTask() {
  console.log('[Automation] Running price alerts task')

  // This would integrate with price-alerts.ts
  const result = {
    checked: 250,
    triggered: 12,
    notificationsSent: 12
  }

  if (result.triggered > 0) {
    createAlert(
      'Price Alerts Triggered',
      `${result.triggered} price alerts triggered and notifications sent`,
      'info',
      'content',
      result
    )
  }

  return result
}

async function runSEOAuditTask() {
  console.log('[Automation] Running SEO audit task')

  const audit = await runSEOAudit()

  // Alert if SEO score drops below threshold
  if (audit.score < 80) {
    createAlert(
      'SEO Score Below Threshold',
      `Current SEO score is ${audit.score}/100. ${audit.issues.filter(i => i.severity === 'critical').length} critical issues found.`,
      'warning',
      'seo',
      { score: audit.score, issues: audit.issues.length }
    )
  }

  return audit
}

async function runCompetitorMonitorTask() {
  console.log('[Automation] Running competitor monitor task')

  const competitors = ['kayak.com', 'google.com/flights', 'skyscanner.com', 'momondo.com']
  const data = await monitorCompetitors(competitors)

  return { monitored: competitors.length, data }
}

async function runWeeklyReportTask() {
  console.log('[Automation] Running weekly report task')

  const report = await generateWeeklyReport()

  // Only send on the scheduled day
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const config = { ...DEFAULT_CONFIG, recipients: ['admin@fly2any.com'] }

  if (today === config.sendDay.toLowerCase()) {
    await sendScheduledReport(config)
  }

  return {
    weekNumber: report.period.weekNumber,
    revenue: report.revenue.total,
    bookings: report.bookings.total,
    sent: today === config.sendDay.toLowerCase()
  }
}

async function runSitemapPingTask() {
  console.log('[Automation] Running sitemap ping task')

  const sitemapUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
  const results = {
    google: false,
    bing: false,
    indexnow: false
  }

  try {
    // Ping Google
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
    results.google = true
  } catch {
    console.error('[Sitemap Ping] Google ping failed')
  }

  try {
    // Ping Bing
    await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
    results.bing = true
  } catch {
    console.error('[Sitemap Ping] Bing ping failed')
  }

  return results
}

async function runCacheWarmupTask() {
  console.log('[Automation] Running cache warmup task')

  const popularRoutes = [
    '/flights/jfk-to-lhr',
    '/flights/lax-to-cdg',
    '/flights/ord-to-nrt',
    '/flights/sfo-to-bcn',
    '/destinations/london',
    '/destinations/paris',
    '/destinations/tokyo'
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com'
  let warmed = 0

  for (const route of popularRoutes) {
    try {
      await fetch(`${baseUrl}${route}`, { method: 'HEAD' })
      warmed++
    } catch {
      // Ignore errors
    }
  }

  return { routes: popularRoutes.length, warmed }
}

/**
 * Get automation status summary
 */
export function getAutomationStatus(): {
  totalTasks: number
  enabledTasks: number
  runningTasks: number
  errorTasks: number
  lastErrors: { taskId: string; error: string }[]
} {
  const tasks = Array.from(taskState.values())

  return {
    totalTasks: tasks.length,
    enabledTasks: tasks.filter(t => t.enabled).length,
    runningTasks: tasks.filter(t => t.status === 'running').length,
    errorTasks: tasks.filter(t => t.status === 'error').length,
    lastErrors: tasks
      .filter(t => t.status === 'error' && t.error)
      .map(t => ({ taskId: t.id, error: t.error! }))
  }
}
