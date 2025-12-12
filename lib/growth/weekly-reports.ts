/**
 * Automated Weekly Reports - Fly2Any Growth OS
 *
 * Generate and send weekly performance reports
 */

export interface WeeklyReportData {
  period: {
    start: Date
    end: Date
    weekNumber: number
    year: number
  }
  revenue: {
    total: number
    change: number
    avgOrderValue: number
    topRoutes: Array<{ route: string; revenue: number }>
  }
  bookings: {
    total: number
    change: number
    confirmed: number
    cancelled: number
    conversionRate: number
  }
  traffic: {
    visitors: number
    change: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    topPages: Array<{ page: string; views: number }>
  }
  seo: {
    indexedPages: number
    change: number
    organicTraffic: number
    topKeywords: Array<{ keyword: string; position: number; change: number }>
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
    }
  }
  marketing: {
    emailsSent: number
    emailOpenRate: number
    emailClickRate: number
    priceAlertsTriggered: number
    referralsGenerated: number
    socialEngagement: number
  }
  content: {
    postsPublished: number
    totalViews: number
    topContent: Array<{ title: string; views: number; conversions: number }>
  }
  highlights: string[]
  recommendations: string[]
}

export interface ReportConfig {
  recipients: string[]
  enabled: boolean
  sendDay: 'sunday' | 'monday'
  sendTime: string // HH:MM format
  includeCharts: boolean
  compareToLastWeek: boolean
  customSections?: string[]
}

const DEFAULT_CONFIG: ReportConfig = {
  recipients: [],
  enabled: true,
  sendDay: 'monday',
  sendTime: '09:00',
  includeCharts: true,
  compareToLastWeek: true
}

/**
 * Generate weekly report data
 */
export async function generateWeeklyReport(): Promise<WeeklyReportData> {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() - 7) // Start of last week
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  // In production, fetch real data from database/analytics
  const report: WeeklyReportData = {
    period: {
      start: weekStart,
      end: weekEnd,
      weekNumber: getWeekNumber(weekStart),
      year: weekStart.getFullYear()
    },
    revenue: {
      total: 125800,
      change: 12.5,
      avgOrderValue: 485,
      topRoutes: [
        { route: 'JFK → LHR', revenue: 28500 },
        { route: 'LAX → CDG', revenue: 22300 },
        { route: 'ORD → NRT', revenue: 18900 },
        { route: 'SFO → BCN', revenue: 15600 },
        { route: 'MIA → FCO', revenue: 12400 }
      ]
    },
    bookings: {
      total: 259,
      change: 8.3,
      confirmed: 245,
      cancelled: 14,
      conversionRate: 2.1
    },
    traffic: {
      visitors: 45200,
      change: 15.2,
      pageViews: 128500,
      bounceRate: 42,
      avgSessionDuration: 185,
      topPages: [
        { page: '/flights', views: 32000 },
        { page: '/flights/jfk-to-london', views: 8500 },
        { page: '/destinations/tokyo', views: 6200 },
        { page: '/deals', views: 5800 },
        { page: '/blog/cheap-flights-2025', views: 4200 }
      ]
    },
    seo: {
      indexedPages: 15420,
      change: 3.2,
      organicTraffic: 28500,
      topKeywords: [
        { keyword: 'cheap flights', position: 12, change: 3 },
        { keyword: 'flight deals', position: 18, change: -2 },
        { keyword: 'flights to london', position: 8, change: 5 },
        { keyword: 'tokyo flights', position: 15, change: 1 },
        { keyword: 'airline tickets', position: 25, change: 0 }
      ],
      coreWebVitals: {
        lcp: 2.1,
        fid: 45,
        cls: 0.08
      }
    },
    marketing: {
      emailsSent: 12500,
      emailOpenRate: 24.5,
      emailClickRate: 3.8,
      priceAlertsTriggered: 892,
      referralsGenerated: 45,
      socialEngagement: 2850
    },
    content: {
      postsPublished: 18,
      totalViews: 15200,
      topContent: [
        { title: 'Ultimate Guide to Cheap Flights 2025', views: 4200, conversions: 85 },
        { title: 'Tokyo Travel Guide', views: 3100, conversions: 42 },
        { title: 'JFK to London from $299', views: 2800, conversions: 125 }
      ]
    },
    highlights: [
      'Revenue up 12.5% week-over-week',
      'Traffic increased 15.2% with 45,200 visitors',
      'Conversion rate improved to 2.1%',
      'SEO: 15,420 pages indexed (+3.2%)',
      '892 price alerts triggered, generating 125 bookings'
    ],
    recommendations: [
      'Increase content production for high-converting routes (JFK-LHR)',
      'A/B test checkout flow to improve conversion from 2.1% to 2.5%',
      'Focus SEO efforts on "cheap flights" keyword (currently #12)',
      'Launch retargeting campaign for cart abandoners',
      'Optimize mobile experience - 55% of traffic is mobile'
    ]
  }

  return report
}

/**
 * Format report as HTML email
 */
export function formatReportAsHTML(report: WeeklyReportData): string {
  const formatCurrency = (n: number) => `$${n.toLocaleString()}`
  const formatPercent = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`
  const formatNumber = (n: number) => n.toLocaleString()

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fly2Any Weekly Report - Week ${report.period.weekNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
    .metrics { display: flex; flex-wrap: wrap; gap: 15px; }
    .metric { flex: 1; min-width: 150px; background: #f9fafb; border-radius: 8px; padding: 15px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .metric-label { font-size: 14px; color: #6b7280; }
    .metric-change { font-size: 14px; margin-top: 5px; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .list { padding: 0; margin: 0; list-style: none; }
    .list li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
    .list li:last-child { border-bottom: none; }
    .highlight { background: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 15px; margin: 10px 0; border-radius: 0 8px 8px 0; }
    .recommendation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 15px; margin: 10px 0; border-radius: 0 8px 8px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ Fly2Any Weekly Report</h1>
      <p>Week ${report.period.weekNumber}, ${report.period.year} | ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}</p>
    </div>

    <div class="content">
      <!-- Revenue Section -->
      <div class="section">
        <h2>💰 Revenue</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">${formatCurrency(report.revenue.total)}</div>
            <div class="metric-label">Total Revenue</div>
            <div class="metric-change ${report.revenue.change >= 0 ? 'positive' : 'negative'}">${formatPercent(report.revenue.change)} vs last week</div>
          </div>
          <div class="metric">
            <div class="metric-value">${formatCurrency(report.revenue.avgOrderValue)}</div>
            <div class="metric-label">Avg Order Value</div>
          </div>
        </div>
        <h3 style="font-size: 14px; color: #6b7280; margin: 20px 0 10px;">Top Routes</h3>
        <ul class="list">
          ${report.revenue.topRoutes.map(r => `<li><span>${r.route}</span><span style="font-weight: bold;">${formatCurrency(r.revenue)}</span></li>`).join('')}
        </ul>
      </div>

      <!-- Bookings Section -->
      <div class="section">
        <h2>📅 Bookings</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">${formatNumber(report.bookings.total)}</div>
            <div class="metric-label">Total Bookings</div>
            <div class="metric-change ${report.bookings.change >= 0 ? 'positive' : 'negative'}">${formatPercent(report.bookings.change)} vs last week</div>
          </div>
          <div class="metric">
            <div class="metric-value">${report.bookings.conversionRate}%</div>
            <div class="metric-label">Conversion Rate</div>
          </div>
          <div class="metric">
            <div class="metric-value">${formatNumber(report.bookings.confirmed)}</div>
            <div class="metric-label">Confirmed</div>
          </div>
        </div>
      </div>

      <!-- Traffic Section -->
      <div class="section">
        <h2>📊 Traffic</h2>
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">${formatNumber(report.traffic.visitors)}</div>
            <div class="metric-label">Visitors</div>
            <div class="metric-change ${report.traffic.change >= 0 ? 'positive' : 'negative'}">${formatPercent(report.traffic.change)} vs last week</div>
          </div>
          <div class="metric">
            <div class="metric-value">${formatNumber(report.traffic.pageViews)}</div>
            <div class="metric-label">Page Views</div>
          </div>
          <div class="metric">
            <div class="metric-value">${report.traffic.bounceRate}%</div>
            <div class="metric-label">Bounce Rate</div>
          </div>
        </div>
      </div>

      <!-- Highlights -->
      <div class="section">
        <h2>✨ Highlights</h2>
        ${report.highlights.map(h => `<div class="highlight">✓ ${h}</div>`).join('')}
      </div>

      <!-- Recommendations -->
      <div class="section">
        <h2>💡 Recommendations</h2>
        ${report.recommendations.map(r => `<div class="recommendation">→ ${r}</div>`).join('')}
      </div>
    </div>

    <div class="footer">
      <p>Fly2Any Growth OS | Automated Weekly Report</p>
      <p style="font-size: 12px; color: #9ca3af;">Generated ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Format report as plain text
 */
export function formatReportAsText(report: WeeklyReportData): string {
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    `           FLY2ANY WEEKLY REPORT - WEEK ${report.period.weekNumber}`,
    `    ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}`,
    '═══════════════════════════════════════════════════════════════',
    '',
    '💰 REVENUE',
    `   Total: $${report.revenue.total.toLocaleString()} (${report.revenue.change >= 0 ? '+' : ''}${report.revenue.change}%)`,
    `   Avg Order Value: $${report.revenue.avgOrderValue}`,
    '',
    '📅 BOOKINGS',
    `   Total: ${report.bookings.total} (${report.bookings.change >= 0 ? '+' : ''}${report.bookings.change}%)`,
    `   Conversion Rate: ${report.bookings.conversionRate}%`,
    '',
    '📊 TRAFFIC',
    `   Visitors: ${report.traffic.visitors.toLocaleString()} (${report.traffic.change >= 0 ? '+' : ''}${report.traffic.change}%)`,
    `   Page Views: ${report.traffic.pageViews.toLocaleString()}`,
    '',
    '✨ HIGHLIGHTS',
    ...report.highlights.map(h => `   • ${h}`),
    '',
    '💡 RECOMMENDATIONS',
    ...report.recommendations.map(r => `   • ${r}`),
    '',
    '───────────────────────────────────────────────────────────────',
    '           Generated by Fly2Any Growth OS',
    '═══════════════════════════════════════════════════════════════'
  ]

  return lines.join('\n')
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Schedule weekly report (call from cron job)
 */
export async function sendScheduledReport(config: ReportConfig): Promise<boolean> {
  if (!config.enabled || config.recipients.length === 0) {
    return false
  }

  try {
    const report = await generateWeeklyReport()
    const htmlContent = formatReportAsHTML(report)

    // In production, send via email service (Resend, SendGrid, etc.)
    console.log(`[Weekly Report] Sending to ${config.recipients.length} recipients`)
    console.log(`[Weekly Report] Week ${report.period.weekNumber}: $${report.revenue.total} revenue, ${report.bookings.total} bookings`)

    return true
  } catch (error) {
    console.error('[Weekly Report] Failed to send:', error)
    return false
  }
}

export { DEFAULT_CONFIG }
