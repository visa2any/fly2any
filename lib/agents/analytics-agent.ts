/**
 * Analytics Agent - Automated Insights Generation
 * Fly2Any Growth OS
 *
 * Analyzes data patterns and generates actionable insights
 */

export interface AnalyticsInsight {
  id: string
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly' | 'recommendation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  metric: string
  currentValue: number
  previousValue: number
  changePercent: number
  action?: string
  createdAt: Date
}

export interface MetricSnapshot {
  name: string
  value: number
  previousValue: number
  target?: number
  timestamp: Date
}

export interface AnalyticsReport {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  insights: AnalyticsInsight[]
  metrics: MetricSnapshot[]
  recommendations: string[]
  score: number // 0-100 overall health score
}

export interface TrafficAnalysis {
  totalSessions: number
  uniqueUsers: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{ path: string; views: number; conversions: number }>
  topSources: Array<{ source: string; sessions: number; conversionRate: number }>
  topSearchQueries: Array<{ query: string; impressions: number; clicks: number; ctr: number }>
}

export interface ConversionAnalysis {
  totalConversions: number
  conversionRate: number
  revenue: number
  avgOrderValue: number
  topConvertingRoutes: Array<{ route: string; conversions: number; revenue: number }>
  funnelDropoff: Array<{ step: string; visitors: number; dropoffRate: number }>
}

// Thresholds for anomaly detection
const THRESHOLDS = {
  trafficDrop: -20, // Alert if traffic drops >20%
  conversionDrop: -15, // Alert if conversion drops >15%
  bounceRateHigh: 70, // Alert if bounce rate >70%
  revenueSpike: 50, // Opportunity if revenue spikes >50%
  searchRankDrop: -10, // Alert if avg rank drops >10 positions
}

export class AnalyticsAgent {
  /**
   * Run full analytics analysis
   */
  async analyze(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AnalyticsReport> {
    console.log(`[Analytics Agent] Starting ${period} analysis`)

    const endDate = new Date()
    const startDate = this.getStartDate(period, endDate)

    // Collect metrics (in production, fetch from analytics APIs)
    const metrics = await this.collectMetrics(startDate, endDate)
    const insights = await this.generateInsights(metrics)
    const recommendations = this.generateRecommendations(insights)
    const score = this.calculateHealthScore(metrics, insights)

    const report: AnalyticsReport = {
      period,
      startDate,
      endDate,
      insights,
      metrics,
      recommendations,
      score,
    }

    console.log(`[Analytics Agent] Generated ${insights.length} insights, score: ${score}`)
    return report
  }

  /**
   * Analyze traffic patterns
   */
  async analyzeTraffic(): Promise<TrafficAnalysis> {
    // Mock data - in production, fetch from Google Analytics API
    return {
      totalSessions: 15420,
      uniqueUsers: 12350,
      bounceRate: 42.5,
      avgSessionDuration: 245, // seconds
      topPages: [
        { path: '/', views: 8500, conversions: 340 },
        { path: '/flights/jfk-lhr', views: 2100, conversions: 84 },
        { path: '/flights/lax-cdg', views: 1800, conversions: 72 },
        { path: '/deals', views: 1500, conversions: 120 },
        { path: '/price-alerts', views: 1200, conversions: 180 },
      ],
      topSources: [
        { source: 'google', sessions: 7800, conversionRate: 4.2 },
        { source: 'direct', sessions: 3200, conversionRate: 5.8 },
        { source: 'twitter', sessions: 1500, conversionRate: 2.1 },
        { source: 'email', sessions: 1200, conversionRate: 8.5 },
        { source: 'referral', sessions: 800, conversionRate: 6.2 },
      ],
      topSearchQueries: [
        { query: 'cheap flights to paris', impressions: 12500, clicks: 875, ctr: 7.0 },
        { query: 'fly2any', impressions: 8900, clicks: 6230, ctr: 70.0 },
        { query: 'best flight deals', impressions: 6200, clicks: 310, ctr: 5.0 },
        { query: 'flight price tracker', impressions: 4500, clicks: 270, ctr: 6.0 },
        { query: 'nyc to london flights', impressions: 3800, clicks: 266, ctr: 7.0 },
      ],
    }
  }

  /**
   * Analyze conversion funnel
   */
  async analyzeConversions(): Promise<ConversionAnalysis> {
    return {
      totalConversions: 847,
      conversionRate: 3.8,
      revenue: 127050,
      avgOrderValue: 150,
      topConvertingRoutes: [
        { route: 'JFK-LHR', conversions: 84, revenue: 12600 },
        { route: 'LAX-NRT', conversions: 72, revenue: 14400 },
        { route: 'SFO-CDG', conversions: 65, revenue: 11700 },
        { route: 'ORD-FCO', conversions: 58, revenue: 8700 },
        { route: 'MIA-CUN', conversions: 52, revenue: 5200 },
      ],
      funnelDropoff: [
        { step: 'Search', visitors: 15420, dropoffRate: 0 },
        { step: 'Results View', visitors: 12800, dropoffRate: 17 },
        { step: 'Flight Select', visitors: 4500, dropoffRate: 65 },
        { step: 'Checkout Start', visitors: 1800, dropoffRate: 60 },
        { step: 'Payment', visitors: 1100, dropoffRate: 39 },
        { step: 'Confirmation', visitors: 847, dropoffRate: 23 },
      ],
    }
  }

  /**
   * Detect anomalies in metrics
   */
  detectAnomalies(current: MetricSnapshot[], previous: MetricSnapshot[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = []

    for (const metric of current) {
      const prev = previous.find(p => p.name === metric.name)
      if (!prev) continue

      const changePercent = ((metric.value - prev.value) / prev.value) * 100

      // Check for significant changes
      if (metric.name === 'sessions' && changePercent < THRESHOLDS.trafficDrop) {
        insights.push(this.createInsight(
          'warning',
          'high',
          'Traffic Drop Detected',
          `Sessions dropped ${Math.abs(changePercent).toFixed(1)}% compared to previous period`,
          metric.name,
          metric.value,
          prev.value,
          changePercent,
          'Investigate traffic sources and check for technical issues'
        ))
      }

      if (metric.name === 'conversionRate' && changePercent < THRESHOLDS.conversionDrop) {
        insights.push(this.createInsight(
          'warning',
          'critical',
          'Conversion Rate Decline',
          `Conversion rate dropped from ${prev.value}% to ${metric.value}%`,
          metric.name,
          metric.value,
          prev.value,
          changePercent,
          'Review checkout flow, pricing, and user experience'
        ))
      }

      if (metric.name === 'bounceRate' && metric.value > THRESHOLDS.bounceRateHigh) {
        insights.push(this.createInsight(
          'warning',
          'medium',
          'High Bounce Rate',
          `Bounce rate is ${metric.value}%, above healthy threshold`,
          metric.name,
          metric.value,
          prev.value,
          changePercent,
          'Improve landing page relevance and load speed'
        ))
      }

      if (metric.name === 'revenue' && changePercent > THRESHOLDS.revenueSpike) {
        insights.push(this.createInsight(
          'opportunity',
          'high',
          'Revenue Growth Opportunity',
          `Revenue increased ${changePercent.toFixed(1)}% - identify winning strategies`,
          metric.name,
          metric.value,
          prev.value,
          changePercent,
          'Analyze which campaigns or routes drove this growth'
        ))
      }
    }

    return insights
  }

  /**
   * Identify growth opportunities
   */
  async identifyOpportunities(): Promise<AnalyticsInsight[]> {
    const opportunities: AnalyticsInsight[] = []
    const conversions = await this.analyzeConversions()

    // High-converting routes not being promoted
    const topRoute = conversions.topConvertingRoutes[0]
    opportunities.push(this.createInsight(
      'opportunity',
      'high',
      'High-Converting Route',
      `${topRoute.route} has strong conversions (${topRoute.conversions}). Consider increasing promotion.`,
      'route_conversions',
      topRoute.conversions,
      0,
      0,
      `Create dedicated landing page and targeted ads for ${topRoute.route}`
    ))

    // Funnel optimization
    const biggestDropoff = conversions.funnelDropoff.reduce((max, step) =>
      step.dropoffRate > max.dropoffRate ? step : max
    )
    if (biggestDropoff.dropoffRate > 40) {
      opportunities.push(this.createInsight(
        'recommendation',
        'high',
        'Funnel Optimization Required',
        `${biggestDropoff.step} has ${biggestDropoff.dropoffRate}% dropoff rate`,
        'funnel_dropoff',
        biggestDropoff.dropoffRate,
        0,
        0,
        `Optimize ${biggestDropoff.step} step with clearer CTAs and reduced friction`
      ))
    }

    return opportunities
  }

  /**
   * Generate SEO insights
   */
  async analyzeSEO(): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = []
    const traffic = await this.analyzeTraffic()

    // Low CTR queries
    const lowCTRQueries = traffic.topSearchQueries.filter(q => q.ctr < 3)
    if (lowCTRQueries.length > 0) {
      insights.push(this.createInsight(
        'recommendation',
        'medium',
        'Low CTR Search Queries',
        `${lowCTRQueries.length} queries have CTR below 3%. Improve meta descriptions.`,
        'seo_ctr',
        lowCTRQueries[0]?.ctr || 0,
        5,
        -40,
        'Rewrite meta titles and descriptions for these queries'
      ))
    }

    // High impression, low click queries
    const highImpressionLowClick = traffic.topSearchQueries.filter(
      q => q.impressions > 5000 && q.ctr < 5
    )
    if (highImpressionLowClick.length > 0) {
      insights.push(this.createInsight(
        'opportunity',
        'high',
        'High Visibility Optimization',
        `${highImpressionLowClick.length} queries have high impressions but low clicks`,
        'seo_opportunity',
        highImpressionLowClick[0]?.impressions || 0,
        0,
        0,
        'Optimize title tags and meta descriptions for better CTR'
      ))
    }

    return insights
  }

  /**
   * Collect all metrics
   */
  private async collectMetrics(startDate: Date, endDate: Date): Promise<MetricSnapshot[]> {
    const traffic = await this.analyzeTraffic()
    const conversions = await this.analyzeConversions()

    return [
      { name: 'sessions', value: traffic.totalSessions, previousValue: 14200, timestamp: endDate },
      { name: 'uniqueUsers', value: traffic.uniqueUsers, previousValue: 11500, timestamp: endDate },
      { name: 'bounceRate', value: traffic.bounceRate, previousValue: 44.2, timestamp: endDate },
      { name: 'avgSessionDuration', value: traffic.avgSessionDuration, previousValue: 230, timestamp: endDate },
      { name: 'conversions', value: conversions.totalConversions, previousValue: 780, timestamp: endDate },
      { name: 'conversionRate', value: conversions.conversionRate, previousValue: 3.5, timestamp: endDate },
      { name: 'revenue', value: conversions.revenue, previousValue: 117000, timestamp: endDate },
      { name: 'avgOrderValue', value: conversions.avgOrderValue, previousValue: 145, timestamp: endDate },
    ]
  }

  /**
   * Generate insights from metrics
   */
  private async generateInsights(metrics: MetricSnapshot[]): Promise<AnalyticsInsight[]> {
    const previousMetrics = metrics.map(m => ({
      ...m,
      value: m.previousValue,
    }))

    const anomalies = this.detectAnomalies(metrics, previousMetrics)
    const opportunities = await this.identifyOpportunities()
    const seoInsights = await this.analyzeSEO()

    return [...anomalies, ...opportunities, ...seoInsights]
  }

  /**
   * Generate recommendations from insights
   */
  private generateRecommendations(insights: AnalyticsInsight[]): string[] {
    const recs: string[] = []

    const criticalInsights = insights.filter(i => i.severity === 'critical')
    const highInsights = insights.filter(i => i.severity === 'high')

    // Prioritize critical actions
    criticalInsights.forEach(i => {
      if (i.action) recs.push(`[URGENT] ${i.action}`)
    })

    // Then high priority
    highInsights.forEach(i => {
      if (i.action) recs.push(i.action)
    })

    // Add standard recommendations based on patterns
    const avgConversionRate = insights.find(i => i.metric === 'conversionRate')?.currentValue || 0
    if (avgConversionRate < 3) {
      recs.push('Consider A/B testing checkout flow to improve conversion rate')
    }

    const bounceRate = insights.find(i => i.metric === 'bounceRate')?.currentValue || 0
    if (bounceRate > 50) {
      recs.push('Improve page load speed and mobile experience to reduce bounce rate')
    }

    return recs.slice(0, 10) // Top 10 recommendations
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(metrics: MetricSnapshot[], insights: AnalyticsInsight[]): number {
    let score = 100

    // Deduct points for issues
    insights.forEach(insight => {
      switch (insight.severity) {
        case 'critical':
          score -= 20
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    })

    // Add points for positive trends
    const positiveMetrics = metrics.filter(m => m.value > m.previousValue)
    score += positiveMetrics.length * 2

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Create insight helper
   */
  private createInsight(
    type: AnalyticsInsight['type'],
    severity: AnalyticsInsight['severity'],
    title: string,
    description: string,
    metric: string,
    currentValue: number,
    previousValue: number,
    changePercent: number,
    action?: string
  ): AnalyticsInsight {
    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      severity,
      title,
      description,
      metric,
      currentValue,
      previousValue,
      changePercent,
      action,
      createdAt: new Date(),
    }
  }

  /**
   * Get start date based on period
   */
  private getStartDate(period: 'daily' | 'weekly' | 'monthly', endDate: Date): Date {
    const start = new Date(endDate)
    switch (period) {
      case 'daily':
        start.setDate(start.getDate() - 1)
        break
      case 'weekly':
        start.setDate(start.getDate() - 7)
        break
      case 'monthly':
        start.setMonth(start.getMonth() - 1)
        break
    }
    return start
  }
}

export const analyticsAgent = new AnalyticsAgent()
