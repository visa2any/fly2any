/**
 * Content Performance Tracking - Fly2Any Growth OS
 * Track, analyze, and optimize content across all channels
 */

export interface ContentMetric {
  contentId: string
  contentType: 'blog' | 'deal' | 'guide' | 'social' | 'email' | 'landing'
  channel: string
  title: string
  url?: string
  publishedAt: Date
  metrics: PerformanceMetrics
  engagement: EngagementMetrics
  conversion: ConversionMetrics
  seo: SEOMetrics
  lastUpdated: Date
}

export interface PerformanceMetrics {
  impressions: number
  views: number
  uniqueViews: number
  avgTimeOnPage: number // seconds
  bounceRate: number // percentage
  scrollDepth: number // average percentage scrolled
  exitRate: number // percentage
}

export interface EngagementMetrics {
  likes: number
  shares: number
  comments: number
  saves: number
  clicks: number
  ctr: number // click-through rate
  engagementRate: number // (interactions / impressions) * 100
}

export interface ConversionMetrics {
  searches: number // searches initiated from content
  bookingStarts: number
  bookings: number
  revenue: number
  conversionRate: number
  revenuePerView: number
  alertsCreated: number
  signups: number
}

export interface SEOMetrics {
  organicTraffic: number
  organicImpressions: number
  avgPosition: number
  topKeywords: Array<{ keyword: string; position: number; clicks: number }>
  backlinks: number
  domainReferrals: number
}

export interface ContentReport {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  summary: ReportSummary
  topPerformers: ContentMetric[]
  lowPerformers: ContentMetric[]
  trends: ContentTrend[]
  recommendations: ContentRecommendation[]
}

export interface ReportSummary {
  totalContent: number
  totalViews: number
  totalEngagement: number
  totalConversions: number
  totalRevenue: number
  avgEngagementRate: number
  avgConversionRate: number
  bestChannel: string
  bestContentType: string
}

export interface ContentTrend {
  metric: string
  direction: 'up' | 'down' | 'stable'
  changePercent: number
  period: string
}

export interface ContentRecommendation {
  type: 'create' | 'update' | 'promote' | 'retire'
  priority: 'high' | 'medium' | 'low'
  contentId?: string
  description: string
  expectedImpact: string
}

export interface ContentScore {
  overall: number // 0-100
  performance: number
  engagement: number
  conversion: number
  seo: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

// Scoring weights
const SCORE_WEIGHTS = {
  performance: 0.20,
  engagement: 0.30,
  conversion: 0.35,
  seo: 0.15,
}

// Benchmarks for scoring
const BENCHMARKS = {
  avgTimeOnPage: 180, // 3 minutes
  bounceRate: 50, // 50%
  engagementRate: 3, // 3%
  conversionRate: 2, // 2%
  ctr: 5, // 5%
}

export class ContentPerformanceTracker {
  private contentMetrics: Map<string, ContentMetric> = new Map()
  private eventQueue: Array<{ contentId: string; event: string; data: any }> = []

  /**
   * Track content view
   */
  trackView(contentId: string, data: {
    source?: string
    device?: string
    isUnique?: boolean
  } = {}): void {
    const metric = this.getOrCreateMetric(contentId)
    metric.metrics.views++
    if (data.isUnique) metric.metrics.uniqueViews++
    metric.metrics.impressions++
    metric.lastUpdated = new Date()

    this.queueEvent(contentId, 'view', data)
  }

  /**
   * Track engagement event
   */
  trackEngagement(contentId: string, event: 'like' | 'share' | 'comment' | 'save' | 'click'): void {
    const metric = this.getOrCreateMetric(contentId)

    switch (event) {
      case 'like': metric.engagement.likes++; break
      case 'share': metric.engagement.shares++; break
      case 'comment': metric.engagement.comments++; break
      case 'save': metric.engagement.saves++; break
      case 'click': metric.engagement.clicks++; break
    }

    this.updateEngagementRate(metric)
    metric.lastUpdated = new Date()

    this.queueEvent(contentId, event, {})
  }

  /**
   * Track conversion event
   */
  trackConversion(
    contentId: string,
    event: 'search' | 'booking_start' | 'booking' | 'alert' | 'signup',
    value?: number
  ): void {
    const metric = this.getOrCreateMetric(contentId)

    switch (event) {
      case 'search': metric.conversion.searches++; break
      case 'booking_start': metric.conversion.bookingStarts++; break
      case 'booking':
        metric.conversion.bookings++
        metric.conversion.revenue += value || 0
        break
      case 'alert': metric.conversion.alertsCreated++; break
      case 'signup': metric.conversion.signups++; break
    }

    this.updateConversionRate(metric)
    metric.lastUpdated = new Date()

    this.queueEvent(contentId, event, { value })
  }

  /**
   * Track time on page
   */
  trackTimeOnPage(contentId: string, seconds: number): void {
    const metric = this.getOrCreateMetric(contentId)
    const views = metric.metrics.views || 1

    // Running average
    metric.metrics.avgTimeOnPage =
      (metric.metrics.avgTimeOnPage * (views - 1) + seconds) / views
    metric.lastUpdated = new Date()
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(contentId: string, depth: number): void {
    const metric = this.getOrCreateMetric(contentId)
    metric.metrics.scrollDepth = Math.max(metric.metrics.scrollDepth, depth)
    metric.lastUpdated = new Date()
  }

  /**
   * Update SEO metrics
   */
  updateSEOMetrics(contentId: string, seo: Partial<SEOMetrics>): void {
    const metric = this.getOrCreateMetric(contentId)
    metric.seo = { ...metric.seo, ...seo }
    metric.lastUpdated = new Date()
  }

  /**
   * Get content performance
   */
  getPerformance(contentId: string): ContentMetric | null {
    return this.contentMetrics.get(contentId) || null
  }

  /**
   * Calculate content score
   */
  calculateScore(contentId: string): ContentScore {
    const metric = this.contentMetrics.get(contentId)
    if (!metric) {
      return { overall: 0, performance: 0, engagement: 0, conversion: 0, seo: 0, grade: 'F' }
    }

    // Performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(metric)

    // Engagement score (0-100)
    const engagementScore = this.calculateEngagementScore(metric)

    // Conversion score (0-100)
    const conversionScore = this.calculateConversionScore(metric)

    // SEO score (0-100)
    const seoScore = this.calculateSEOScore(metric)

    // Weighted overall score
    const overall = Math.round(
      performanceScore * SCORE_WEIGHTS.performance +
      engagementScore * SCORE_WEIGHTS.engagement +
      conversionScore * SCORE_WEIGHTS.conversion +
      seoScore * SCORE_WEIGHTS.seo
    )

    // Assign grade
    const grade = overall >= 90 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : overall >= 40 ? 'D' : 'F'

    return {
      overall,
      performance: performanceScore,
      engagement: engagementScore,
      conversion: conversionScore,
      seo: seoScore,
      grade,
    }
  }

  /**
   * Generate performance report
   */
  async generateReport(period: 'daily' | 'weekly' | 'monthly'): Promise<ContentReport> {
    const endDate = new Date()
    const startDate = this.getStartDate(period, endDate)

    const allContent = Array.from(this.contentMetrics.values())
      .filter(c => c.publishedAt >= startDate)

    // Calculate summary
    const summary = this.calculateSummary(allContent)

    // Find top and low performers
    const scored = allContent.map(c => ({
      content: c,
      score: this.calculateScore(c.contentId),
    })).sort((a, b) => b.score.overall - a.score.overall)

    const topPerformers = scored.slice(0, 5).map(s => s.content)
    const lowPerformers = scored.slice(-5).reverse().map(s => s.content)

    // Calculate trends
    const trends = this.calculateTrends(period)

    // Generate recommendations
    const recommendations = this.generateRecommendations(scored)

    return {
      period,
      startDate,
      endDate,
      summary,
      topPerformers,
      lowPerformers,
      trends,
      recommendations,
    }
  }

  /**
   * Get content by performance tier
   */
  getContentByTier(): {
    top: ContentMetric[]
    good: ContentMetric[]
    average: ContentMetric[]
    poor: ContentMetric[]
  } {
    const all = Array.from(this.contentMetrics.values())
    const scored = all.map(c => ({ content: c, score: this.calculateScore(c.contentId) }))

    return {
      top: scored.filter(s => s.score.grade === 'A').map(s => s.content),
      good: scored.filter(s => s.score.grade === 'B').map(s => s.content),
      average: scored.filter(s => s.score.grade === 'C').map(s => s.content),
      poor: scored.filter(s => s.score.grade === 'D' || s.score.grade === 'F').map(s => s.content),
    }
  }

  /**
   * Get channel performance summary
   */
  getChannelPerformance(): Array<{
    channel: string
    contentCount: number
    totalViews: number
    avgEngagement: number
    totalConversions: number
    totalRevenue: number
  }> {
    const channels = new Map<string, ContentMetric[]>()

    this.contentMetrics.forEach(metric => {
      const list = channels.get(metric.channel) || []
      list.push(metric)
      channels.set(metric.channel, list)
    })

    return Array.from(channels.entries()).map(([channel, content]) => ({
      channel,
      contentCount: content.length,
      totalViews: content.reduce((s, c) => s + c.metrics.views, 0),
      avgEngagement: content.reduce((s, c) => s + c.engagement.engagementRate, 0) / content.length,
      totalConversions: content.reduce((s, c) => s + c.conversion.bookings, 0),
      totalRevenue: content.reduce((s, c) => s + c.conversion.revenue, 0),
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }

  /**
   * Get content type performance summary
   */
  getContentTypePerformance(): Array<{
    type: string
    contentCount: number
    avgScore: number
    avgConversionRate: number
    totalRevenue: number
  }> {
    const types = new Map<string, ContentMetric[]>()

    this.contentMetrics.forEach(metric => {
      const list = types.get(metric.contentType) || []
      list.push(metric)
      types.set(metric.contentType, list)
    })

    return Array.from(types.entries()).map(([type, content]) => {
      const scores = content.map(c => this.calculateScore(c.contentId).overall)
      return {
        type,
        contentCount: content.length,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        avgConversionRate: content.reduce((s, c) => s + c.conversion.conversionRate, 0) / content.length,
        totalRevenue: content.reduce((s, c) => s + c.conversion.revenue, 0),
      }
    }).sort((a, b) => b.avgScore - a.avgScore)
  }

  // Private methods

  private getOrCreateMetric(contentId: string): ContentMetric {
    let metric = this.contentMetrics.get(contentId)
    if (!metric) {
      metric = {
        contentId,
        contentType: 'blog',
        channel: 'website',
        title: contentId,
        publishedAt: new Date(),
        metrics: {
          impressions: 0, views: 0, uniqueViews: 0,
          avgTimeOnPage: 0, bounceRate: 0, scrollDepth: 0, exitRate: 0,
        },
        engagement: {
          likes: 0, shares: 0, comments: 0, saves: 0,
          clicks: 0, ctr: 0, engagementRate: 0,
        },
        conversion: {
          searches: 0, bookingStarts: 0, bookings: 0,
          revenue: 0, conversionRate: 0, revenuePerView: 0,
          alertsCreated: 0, signups: 0,
        },
        seo: {
          organicTraffic: 0, organicImpressions: 0, avgPosition: 0,
          topKeywords: [], backlinks: 0, domainReferrals: 0,
        },
        lastUpdated: new Date(),
      }
      this.contentMetrics.set(contentId, metric)
    }
    return metric
  }

  private updateEngagementRate(metric: ContentMetric): void {
    const totalEngagement = metric.engagement.likes + metric.engagement.shares +
      metric.engagement.comments + metric.engagement.saves
    metric.engagement.engagementRate = metric.metrics.impressions > 0
      ? (totalEngagement / metric.metrics.impressions) * 100
      : 0
    metric.engagement.ctr = metric.metrics.impressions > 0
      ? (metric.engagement.clicks / metric.metrics.impressions) * 100
      : 0
  }

  private updateConversionRate(metric: ContentMetric): void {
    metric.conversion.conversionRate = metric.metrics.views > 0
      ? (metric.conversion.bookings / metric.metrics.views) * 100
      : 0
    metric.conversion.revenuePerView = metric.metrics.views > 0
      ? metric.conversion.revenue / metric.metrics.views
      : 0
  }

  private calculatePerformanceScore(metric: ContentMetric): number {
    const timeScore = Math.min(100, (metric.metrics.avgTimeOnPage / BENCHMARKS.avgTimeOnPage) * 100)
    const bounceScore = Math.max(0, 100 - (metric.metrics.bounceRate / BENCHMARKS.bounceRate) * 50)
    const scrollScore = metric.metrics.scrollDepth
    return Math.round((timeScore + bounceScore + scrollScore) / 3)
  }

  private calculateEngagementScore(metric: ContentMetric): number {
    const engagementScore = Math.min(100, (metric.engagement.engagementRate / BENCHMARKS.engagementRate) * 100)
    const ctrScore = Math.min(100, (metric.engagement.ctr / BENCHMARKS.ctr) * 100)
    return Math.round((engagementScore + ctrScore) / 2)
  }

  private calculateConversionScore(metric: ContentMetric): number {
    return Math.min(100, (metric.conversion.conversionRate / BENCHMARKS.conversionRate) * 100)
  }

  private calculateSEOScore(metric: ContentMetric): number {
    let score = 50 // Base score

    // Position bonus (lower is better)
    if (metric.seo.avgPosition > 0 && metric.seo.avgPosition <= 10) {
      score += 30
    } else if (metric.seo.avgPosition <= 20) {
      score += 15
    }

    // Backlinks bonus
    score += Math.min(20, metric.seo.backlinks * 2)

    return Math.min(100, score)
  }

  private calculateSummary(content: ContentMetric[]): ReportSummary {
    if (content.length === 0) {
      return {
        totalContent: 0, totalViews: 0, totalEngagement: 0,
        totalConversions: 0, totalRevenue: 0, avgEngagementRate: 0,
        avgConversionRate: 0, bestChannel: 'N/A', bestContentType: 'N/A',
      }
    }

    const totalViews = content.reduce((s, c) => s + c.metrics.views, 0)
    const totalEngagement = content.reduce((s, c) =>
      s + c.engagement.likes + c.engagement.shares + c.engagement.comments, 0)
    const totalConversions = content.reduce((s, c) => s + c.conversion.bookings, 0)
    const totalRevenue = content.reduce((s, c) => s + c.conversion.revenue, 0)

    const channelPerf = this.getChannelPerformance()
    const typePerf = this.getContentTypePerformance()

    return {
      totalContent: content.length,
      totalViews,
      totalEngagement,
      totalConversions,
      totalRevenue,
      avgEngagementRate: content.reduce((s, c) => s + c.engagement.engagementRate, 0) / content.length,
      avgConversionRate: content.reduce((s, c) => s + c.conversion.conversionRate, 0) / content.length,
      bestChannel: channelPerf[0]?.channel || 'N/A',
      bestContentType: typePerf[0]?.type || 'N/A',
    }
  }

  private calculateTrends(period: string): ContentTrend[] {
    // Mock trends - in production, compare with previous period
    return [
      { metric: 'Total Views', direction: 'up', changePercent: 15.3, period },
      { metric: 'Engagement Rate', direction: 'up', changePercent: 8.7, period },
      { metric: 'Conversion Rate', direction: 'stable', changePercent: 0.2, period },
      { metric: 'Revenue per View', direction: 'up', changePercent: 12.1, period },
    ]
  }

  private generateRecommendations(
    scored: Array<{ content: ContentMetric; score: ContentScore }>
  ): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = []

    // Recommend updating low performers with high traffic
    scored
      .filter(s => s.score.grade === 'D' || s.score.grade === 'F')
      .filter(s => s.content.metrics.views > 100)
      .forEach(s => {
        recommendations.push({
          type: 'update',
          priority: 'high',
          contentId: s.content.contentId,
          description: `Update "${s.content.title}" - high traffic but low conversion`,
          expectedImpact: 'Potential 20-30% conversion improvement',
        })
      })

    // Recommend promoting top performers
    scored
      .filter(s => s.score.grade === 'A')
      .slice(0, 3)
      .forEach(s => {
        recommendations.push({
          type: 'promote',
          priority: 'medium',
          contentId: s.content.contentId,
          description: `Promote "${s.content.title}" on social channels`,
          expectedImpact: 'Increased reach and conversions',
        })
      })

    // Recommend retiring very poor performers
    scored
      .filter(s => s.score.overall < 20 && s.content.metrics.views < 50)
      .forEach(s => {
        recommendations.push({
          type: 'retire',
          priority: 'low',
          contentId: s.content.contentId,
          description: `Consider removing "${s.content.title}"`,
          expectedImpact: 'Better overall content quality',
        })
      })

    return recommendations.slice(0, 10)
  }

  private getStartDate(period: 'daily' | 'weekly' | 'monthly', endDate: Date): Date {
    const start = new Date(endDate)
    switch (period) {
      case 'daily': start.setDate(start.getDate() - 1); break
      case 'weekly': start.setDate(start.getDate() - 7); break
      case 'monthly': start.setMonth(start.getMonth() - 1); break
    }
    return start
  }

  private queueEvent(contentId: string, event: string, data: any): void {
    this.eventQueue.push({ contentId, event, data })
    // In production: batch send to analytics
  }
}

export const contentPerformanceTracker = new ContentPerformanceTracker()
