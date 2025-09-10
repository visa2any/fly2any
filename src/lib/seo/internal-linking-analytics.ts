/**
 * INTERNAL LINKING ANALYTICS & PERFORMANCE TRACKING
 * Comprehensive system for monitoring internal link performance
 * Tracks SEO impact and user engagement metrics
 */

export interface LinkPerformanceData {
  linkId: string;
  fromUrl: string;
  toUrl: string;
  anchorText: string;
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  bounceRate: number;
  timeOnTarget: number; // Average time spent on target page
  rankingImpact: number; // SEO ranking improvement
  dateCreated: Date;
  lastTracked: Date;
}

export interface LinkingStrategyMetrics {
  strategyId: string;
  strategyName: string;
  totalLinks: number;
  averageCTR: number;
  totalClicks: number;
  seoImpact: 'positive' | 'neutral' | 'negative';
  userEngagement: 'high' | 'medium' | 'low';
  recommendations: string[];
  lastAnalyzed: Date;
}

export interface SEOImpactReport {
  pageUrl: string;
  beforeLinking: {
    organicTraffic: number;
    averageRanking: number;
    topKeywords: string[];
  };
  afterLinking: {
    organicTraffic: number;
    averageRanking: number;
    topKeywords: string[];
    trafficGrowth: number;
    rankingImprovement: number;
  };
  linkingChanges: {
    linksAdded: number;
    linksRemoved: number;
    anchorTextOptimized: number;
    clusterImplemented: boolean;
  };
  timeframe: {
    startDate: Date;
    endDate: Date;
    daysTracked: number;
  };
}

export class InternalLinkingAnalytics {
  
  private static performanceData: Map<string, LinkPerformanceData> = new Map();
  private static strategyMetrics: Map<string, LinkingStrategyMetrics> = new Map();
  
  /**
   * LINK PERFORMANCE TRACKING
   */
  
  static trackLinkClick(
    linkId: string,
    fromUrl: string,
    toUrl: string,
    anchorText: string,
    userSessionData?: any
  ): void {
    const existing = this.performanceData.get(linkId);
    
    if (existing) {
      existing.clicks += 1;
      existing.ctr = existing.clicks / existing.impressions;
      existing.lastTracked = new Date();
    } else {
      this.performanceData.set(linkId, {
        linkId,
        fromUrl,
        toUrl,
        anchorText,
        clicks: 1,
        impressions: 1,
        ctr: 1.0,
        conversionRate: 0,
        bounceRate: 0,
        timeOnTarget: 0,
        rankingImpact: 0,
        dateCreated: new Date(),
        lastTracked: new Date()
      });
    }
    
    // Track in analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'internal_link_click', {
        'link_url': toUrl,
        'from_page': fromUrl,
        'anchor_text': anchorText,
        'custom_parameter': linkId
      });
    }
  }

  static trackLinkImpression(linkId: string): void {
    const existing = this.performanceData.get(linkId);
    
    if (existing) {
      existing.impressions += 1;
      existing.ctr = existing.clicks / existing.impressions;
    }
  }

  static updateUserEngagementMetrics(
    linkId: string, 
    timeOnTarget: number, 
    bounced: boolean,
    converted: boolean
  ): void {
    const link = this.performanceData.get(linkId);
    
    if (link) {
      // Update time on target (rolling average)
      link.timeOnTarget = (link.timeOnTarget + timeOnTarget) / 2;
      
      // Update bounce rate
      const totalSessions = link.clicks;
      const currentBounces = link.bounceRate * totalSessions;
      link.bounceRate = bounced ? 
        (currentBounces + 1) / totalSessions : 
        currentBounces / totalSessions;
      
      // Update conversion rate
      if (converted) {
        const currentConversions = link.conversionRate * totalSessions;
        link.conversionRate = (currentConversions + 1) / totalSessions;
      }
    }
  }

  /**
   * PERFORMANCE ANALYSIS
   */
  
  static analyzeLinkPerformance(timeframe: number = 30): LinkPerformanceData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);
    
    const recentLinks = Array.from(this.performanceData.values()).filter(
      link => link.lastTracked >= cutoffDate
    );
    
    // Sort by performance score (combination of CTR and engagement)
    return recentLinks.sort((a, b) => {
      const scoreA = this.calculatePerformanceScore(a);
      const scoreB = this.calculatePerformanceScore(b);
      return scoreB - scoreA;
    });
  }

  private static calculatePerformanceScore(link: LinkPerformanceData): number {
    // Weighted performance score
    const ctrWeight = 0.4;
    const conversionWeight = 0.3;
    const engagementWeight = 0.2;
    const seoWeight = 0.1;
    
    const ctrScore = Math.min(link.ctr * 100, 100); // Cap at 100%
    const conversionScore = link.conversionRate * 100;
    const engagementScore = Math.max(0, 100 - link.bounceRate * 100);
    const seoScore = Math.max(0, link.rankingImpact * 10);
    
    return (ctrWeight * ctrScore) + 
           (conversionWeight * conversionScore) + 
           (engagementWeight * engagementScore) + 
           (seoWeight * seoScore);
  }

  static getTopPerformingLinks(limit: number = 10): LinkPerformanceData[] {
    return this.analyzeLinkPerformance().slice(0, limit);
  }

  static getUnderperformingLinks(threshold: number = 20): LinkPerformanceData[] {
    return this.analyzeLinkPerformance().filter(
      link => this.calculatePerformanceScore(link) < threshold
    );
  }

  /**
   * SEO IMPACT MEASUREMENT
   */
  
  static generateSEOImpactReport(
    pageUrl: string,
    beforeData: any,
    afterData: any,
    timeframe: { startDate: Date; endDate: Date }
  ): SEOImpactReport {
    
    const trafficGrowth = ((afterData.organicTraffic - beforeData.organicTraffic) / 
                          beforeData.organicTraffic) * 100;
    
    const rankingImprovement = beforeData.averageRanking - afterData.averageRanking;
    
    return {
      pageUrl,
      beforeLinking: beforeData,
      afterLinking: {
        ...afterData,
        trafficGrowth,
        rankingImprovement
      },
      linkingChanges: {
        linksAdded: this.countLinksAddedInTimeframe(pageUrl, timeframe),
        linksRemoved: this.countLinksRemovedInTimeframe(pageUrl, timeframe),
        anchorTextOptimized: this.countAnchorOptimizationsInTimeframe(pageUrl, timeframe),
        clusterImplemented: this.wasClusterImplemented(pageUrl, timeframe)
      },
      timeframe: {
        ...timeframe,
        daysTracked: Math.ceil((timeframe.endDate.getTime() - timeframe.startDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };
  }

  private static countLinksAddedInTimeframe(pageUrl: string, timeframe: any): number {
    return Array.from(this.performanceData.values()).filter(
      link => link.fromUrl === pageUrl && 
              link.dateCreated >= timeframe.startDate && 
              link.dateCreated <= timeframe.endDate
    ).length;
  }

  private static countLinksRemovedInTimeframe(pageUrl: string, timeframe: any): number {
    // This would need to be tracked separately in a real implementation
    return 0;
  }

  private static countAnchorOptimizationsInTimeframe(pageUrl: string, timeframe: any): number {
    // This would need to track anchor text changes
    return 0;
  }

  private static wasClusterImplemented(pageUrl: string, timeframe: any): boolean {
    // Check if page was added to a topic cluster during timeframe
    return false;
  }

  /**
   * AUTOMATED OPTIMIZATION RECOMMENDATIONS
   */
  
  static generateOptimizationRecommendations(pageUrl: string): string[] {
    const recommendations: string[] = [];
    const pageLinks = Array.from(this.performanceData.values()).filter(
      link => link.fromUrl === pageUrl
    );
    
    if (pageLinks.length === 0) {
      recommendations.push('Add internal links to improve SEO and user navigation');
      return recommendations;
    }
    
    // Analyze overall performance
    const averagePerformance = pageLinks.reduce((sum, link) => 
      sum + this.calculatePerformanceScore(link), 0
    ) / pageLinks.length;
    
    if (averagePerformance < 30) {
      recommendations.push('Consider revising anchor text for better click-through rates');
      recommendations.push('Review link placement - move important links higher on page');
    }
    
    // Check for low CTR links
    const lowCTRLinks = pageLinks.filter(link => link.ctr < 0.02);
    if (lowCTRLinks.length > 0) {
      recommendations.push(`${lowCTRLinks.length} links have very low CTR - optimize anchor text`);
    }
    
    // Check for high bounce rate
    const highBounceLinks = pageLinks.filter(link => link.bounceRate > 0.8);
    if (highBounceLinks.length > 0) {
      recommendations.push(`${highBounceLinks.length} links have high bounce rates - review target page relevance`);
    }
    
    // Check link diversity
    const uniqueTargets = new Set(pageLinks.map(link => link.toUrl));
    if (uniqueTargets.size < pageLinks.length * 0.7) {
      recommendations.push('Increase link diversity - avoid linking to same pages repeatedly');
    }
    
    // Check for missing important links
    const hasServiceLinks = pageLinks.some(link => 
      link.toUrl.includes('voos') || 
      link.toUrl.includes('hoteis') || 
      link.toUrl.includes('flights')
    );
    
    if (!hasServiceLinks) {
      recommendations.push('Add links to main service pages to improve conversion');
    }
    
    return recommendations;
  }

  /**
   * REPORTING AND DASHBOARD DATA
   */
  
  static generateDashboardData() {
    const allLinks = Array.from(this.performanceData.values());
    const totalClicks = allLinks.reduce((sum, link) => sum + link.clicks, 0);
    const totalImpressions = allLinks.reduce((sum, link) => sum + link.impressions, 0);
    
    return {
      overview: {
        totalLinks: allLinks.length,
        totalClicks,
        totalImpressions,
        averageCTR: totalClicks / totalImpressions || 0,
        activeLinks: allLinks.filter(link => link.lastTracked > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
      },
      topPerformers: this.getTopPerformingLinks(5),
      underperformers: this.getUnderperformingLinks().slice(0, 5),
      recentActivity: allLinks
        .filter(link => link.lastTracked > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .sort((a, b) => b.lastTracked.getTime() - a.lastTracked.getTime())
        .slice(0, 10)
    };
  }

  static generateWeeklyReport(): {
    summary: any;
    trends: any;
    recommendations: string[];
  } {
    const weekData = this.analyzeLinkPerformance(7);
    const monthData = this.analyzeLinkPerformance(30);
    
    const weeklyClicks = weekData.reduce((sum, link) => sum + link.clicks, 0);
    const monthlyClicks = monthData.reduce((sum, link) => sum + link.clicks, 0);
    const weeklyAverage = monthlyClicks / 4.33; // Approximate weeks in month
    
    const summary = {
      totalClicks: weeklyClicks,
      changeFromAverage: ((weeklyClicks - weeklyAverage) / weeklyAverage * 100).toFixed(1),
      topPerformingPage: this.getTopPerformingPage(weekData),
      newLinksAdded: this.getNewLinksThisWeek().length,
      avgCTRImprovement: this.calculateCTRTrend(7)
    };
    
    const trends = {
      clickTrend: this.getClickTrend(7),
      ctrTrend: this.getCTRTrend(7),
      conversionTrend: this.getConversionTrend(7)
    };
    
    const recommendations = this.generateWeeklyRecommendations(weekData);
    
    return { summary, trends, recommendations };
  }

  private static getTopPerformingPage(links: LinkPerformanceData[]): string {
    const pagePerformance = new Map<string, number>();
    
    links.forEach(link => {
      const current = pagePerformance.get(link.fromUrl) || 0;
      pagePerformance.set(link.fromUrl, current + this.calculatePerformanceScore(link));
    });
    
    return Array.from(pagePerformance.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  }

  private static getNewLinksThisWeek(): LinkPerformanceData[] {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return Array.from(this.performanceData.values()).filter(
      link => link.dateCreated >= weekAgo
    );
  }

  private static calculateCTRTrend(days: number): number {
    const recentLinks = this.analyzeLinkPerformance(days);
    const olderLinks = this.analyzeLinkPerformance(days * 2);
    
    const recentCTR = recentLinks.reduce((sum, link) => sum + link.ctr, 0) / recentLinks.length;
    const olderCTR = olderLinks.reduce((sum, link) => sum + link.ctr, 0) / olderLinks.length;
    
    return ((recentCTR - olderCTR) / olderCTR * 100) || 0;
  }

  private static getClickTrend(days: number): number[] {
    // Returns daily click counts for the past N days
    const trends: number[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayClicks = Array.from(this.performanceData.values())
        .filter(link => {
          const linkDate = new Date(link.lastTracked);
          return linkDate.toDateString() === date.toDateString();
        })
        .reduce((sum, link) => sum + link.clicks, 0);
      
      trends.push(dayClicks);
    }
    
    return trends;
  }

  private static getCTRTrend(days: number): number[] {
    const trends: number[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLinks = Array.from(this.performanceData.values())
        .filter(link => {
          const linkDate = new Date(link.lastTracked);
          return linkDate.toDateString() === date.toDateString();
        });
      
      const avgCTR = dayLinks.length > 0 ? 
        dayLinks.reduce((sum, link) => sum + link.ctr, 0) / dayLinks.length : 0;
      
      trends.push(avgCTR * 100); // Convert to percentage
    }
    
    return trends;
  }

  private static getConversionTrend(days: number): number[] {
    const trends: number[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLinks = Array.from(this.performanceData.values())
        .filter(link => {
          const linkDate = new Date(link.lastTracked);
          return linkDate.toDateString() === date.toDateString();
        });
      
      const avgConversion = dayLinks.length > 0 ? 
        dayLinks.reduce((sum, link) => sum + link.conversionRate, 0) / dayLinks.length : 0;
      
      trends.push(avgConversion * 100); // Convert to percentage
    }
    
    return trends;
  }

  private static generateWeeklyRecommendations(weekData: LinkPerformanceData[]): string[] {
    const recommendations: string[] = [];
    
    // Check for declining performance
    const avgPerformance = weekData.reduce((sum, link) => 
      sum + this.calculatePerformanceScore(link), 0
    ) / weekData.length;
    
    if (avgPerformance < 40) {
      recommendations.push('Overall link performance is below average - review anchor text and placement');
    }
    
    // Check for opportunities
    if (weekData.length < 20) {
      recommendations.push('Consider adding more internal links to improve SEO and navigation');
    }
    
    const lowCTRCount = weekData.filter(link => link.ctr < 0.01).length;
    if (lowCTRCount > 5) {
      recommendations.push(`${lowCTRCount} links have very low CTR - optimize for better visibility`);
    }
    
    return recommendations;
  }

  /**
   * EXPORT AND IMPORT
   */
  
  static exportAnalyticsData(): string {
    const data = {
      performanceData: Array.from(this.performanceData.entries()),
      strategyMetrics: Array.from(this.strategyMetrics.entries()),
      exportDate: new Date()
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importAnalyticsData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.performanceData) {
        this.performanceData = new Map(data.performanceData);
      }
      
      if (data.strategyMetrics) {
        this.strategyMetrics = new Map(data.strategyMetrics);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import analytics data:', error);
      return false;
    }
  }
}

export default InternalLinkingAnalytics;