/**
 * Voice Search Analytics and Performance Tracking System
 * Comprehensive monitoring of Portuguese voice search performance
 * Real-time analytics, user behavior tracking, and optimization insights
 */

export interface VoiceSearchEvent {
  id: string;
  timestamp: Date;
  query: string;
  language: string;
  region: string;
  confidence: number;
  responseTime: number;
  success: boolean;
  userId?: string;
  sessionId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  voiceAssistant: 'google' | 'siri' | 'alexa' | 'browser' | 'unknown';
  location?: GeolocationData;
  intent: string;
  category: string;
}

export interface GeolocationData {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  accuracy?: number;
}

export interface VoiceSearchMetrics {
  totalQueries: number;
  successRate: number;
  averageConfidence: number;
  averageResponseTime: number;
  languageDistribution: Record<string, number>;
  regionDistribution: Record<string, number>;
  intentDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  assistantDistribution: Record<string, number>;
  timeOfDayDistribution: Record<string, number>;
  popularQueries: QueryPopularity[];
  conversionRate: number;
}

export interface QueryPopularity {
  query: string;
  count: number;
  averageConfidence: number;
  successRate: number;
  category: string;
  intent: string;
}

export interface VoiceSearchInsight {
  type: 'opportunity' | 'issue' | 'trend' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  recommendation: string;
  data: any;
  createdAt: Date;
}

export interface PerformanceReport {
  period: DateRange;
  metrics: VoiceSearchMetrics;
  insights: VoiceSearchInsight[];
  regionalPerformance: RegionalPerformance[];
  queryOptimization: QueryOptimization[];
  competitiveAnalysis: CompetitiveVoiceData;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface RegionalPerformance {
  region: string;
  city: string;
  queryVolume: number;
  successRate: number;
  averageConfidence: number;
  topQueries: string[];
  growthRate: number;
}

export interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  improvementReason: string;
  expectedImpact: number;
  currentPerformance: number;
  targetPerformance: number;
}

export interface CompetitiveVoiceData {
  marketShare: Record<string, number>;
  voiceKeywordRankings: VoiceKeywordRanking[];
  featureSnippetCaptures: number;
  averageResponseQuality: number;
}

export interface VoiceKeywordRanking {
  keyword: string;
  position: number;
  featured: boolean;
  confidence: number;
  language: string;
}

export class VoiceSearchAnalytics {
  private events: VoiceSearchEvent[] = [];
  private insights: VoiceSearchInsight[] = [];
  private isTracking: boolean = false;
  private currentSessionId: string = this.generateSessionId();
  
  // Configuration
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  private readonly RESPONSE_TIME_THRESHOLD = 3000; // 3 seconds
  private readonly MIN_QUERY_LENGTH = 3;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize analytics tracking
   */
  private initialize(): void {
    this.isTracking = true;
    this.setupAutoInsights();
    console.log('🎤 Voice Search Analytics initialized');
  }

  /**
   * Track a voice search event
   */
  public trackVoiceSearch(
    query: string,
    language: string = 'pt-BR',
    region: string = 'general',
    confidence: number = 0,
    responseTime: number = 0,
    success: boolean = true,
    additionalData?: Partial<VoiceSearchEvent>
  ): void {
    if (!this.isTracking || query.length < this.MIN_QUERY_LENGTH) return;

    const event: VoiceSearchEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      query: query.trim(),
      language,
      region,
      confidence,
      responseTime,
      success,
      sessionId: this.currentSessionId,
      deviceType: this.detectDeviceType(),
      voiceAssistant: this.detectVoiceAssistant(),
      location: this.getCurrentLocation(),
      intent: this.classifyIntent(query),
      category: this.classifyCategory(query),
      ...additionalData
    };

    this.events.push(event);
    this.analyzeRealTime(event);
    this.persistEvent(event);
  }

  /**
   * Track voice search performance
   */
  public trackVoicePerformance(
    query: string,
    startTime: number,
    endTime: number,
    confidence: number,
    success: boolean
  ): void {
    const responseTime = endTime - startTime;
    
    this.trackVoiceSearch(
      query,
      'pt-BR',
      'general',
      confidence,
      responseTime,
      success
    );

    // Track additional performance metrics
    if (responseTime > this.RESPONSE_TIME_THRESHOLD) {
      this.generateInsight({
        type: 'performance',
        title: 'Slow Voice Response Detected',
        description: `Query "${query}" took ${responseTime}ms to respond`,
        impact: 'medium',
        actionRequired: true,
        recommendation: 'Optimize voice processing pipeline for faster responses',
        data: { query, responseTime, threshold: this.RESPONSE_TIME_THRESHOLD }
      });
    }

    if (confidence < this.CONFIDENCE_THRESHOLD) {
      this.generateInsight({
        type: 'issue',
        title: 'Low Confidence Voice Recognition',
        description: `Query "${query}" had low confidence score: ${confidence}`,
        impact: 'medium',
        actionRequired: true,
        recommendation: 'Improve audio processing or add query variations',
        data: { query, confidence, threshold: this.CONFIDENCE_THRESHOLD }
      });
    }
  }

  /**
   * Get comprehensive voice search metrics
   */
  public getMetrics(dateRange?: DateRange): VoiceSearchMetrics {
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    if (filteredEvents.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalQueries = filteredEvents.length;
    const successfulQueries = filteredEvents.filter(e => e.success).length;
    const successRate = (successfulQueries / totalQueries) * 100;
    
    const confidenceValues = filteredEvents
      .filter(e => e.confidence > 0)
      .map(e => e.confidence);
    const averageConfidence = confidenceValues.length > 0 
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length 
      : 0;

    const responseTimeValues = filteredEvents
      .filter(e => e.responseTime > 0)
      .map(e => e.responseTime);
    const averageResponseTime = responseTimeValues.length > 0
      ? responseTimeValues.reduce((a, b) => a + b, 0) / responseTimeValues.length
      : 0;

    return {
      totalQueries,
      successRate,
      averageConfidence,
      averageResponseTime,
      languageDistribution: this.calculateDistribution(filteredEvents, 'language'),
      regionDistribution: this.calculateDistribution(filteredEvents, 'region'),
      intentDistribution: this.calculateDistribution(filteredEvents, 'intent'),
      deviceDistribution: this.calculateDistribution(filteredEvents, 'deviceType'),
      assistantDistribution: this.calculateDistribution(filteredEvents, 'voiceAssistant'),
      timeOfDayDistribution: this.calculateTimeDistribution(filteredEvents),
      popularQueries: this.getPopularQueries(filteredEvents),
      conversionRate: this.calculateConversionRate(filteredEvents)
    };
  }

  /**
   * Generate performance report
   */
  public generateReport(dateRange: DateRange): PerformanceReport {
    const metrics = this.getMetrics(dateRange);
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    return {
      period: dateRange,
      metrics,
      insights: this.getRecentInsights(dateRange),
      regionalPerformance: this.analyzeRegionalPerformance(filteredEvents),
      queryOptimization: this.generateQueryOptimizations(filteredEvents),
      competitiveAnalysis: this.analyzeCompetitiveVoiceData(filteredEvents)
    };
  }

  /**
   * Get voice search insights
   */
  public getInsights(type?: string, limit: number = 10): VoiceSearchInsight[] {
    let filteredInsights = this.insights;
    
    if (type) {
      filteredInsights = this.insights.filter(insight => insight.type === type);
    }
    
    return filteredInsights
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Track user interaction with voice results
   */
  public trackVoiceInteraction(
    originalQuery: string,
    interactionType: 'click' | 'speak' | 'follow-up' | 'abandon',
    targetContent?: string
  ): void {
    const event: Partial<VoiceSearchEvent> = {
      query: `[INTERACTION] ${interactionType}: ${originalQuery}`,
      category: 'interaction',
      intent: interactionType,
      success: interactionType !== 'abandon'
    };

    this.trackVoiceSearch(
      event.query!,
      'pt-BR',
      'general',
      1.0,
      0,
      event.success,
      event
    );
  }

  /**
   * Analyze voice search trends
   */
  public analyzeTrends(
    period: 'day' | 'week' | 'month' = 'week'
  ): { trend: 'up' | 'down' | 'stable', growth: number, insights: string[] } {
    const now = new Date();
    const periodMs = this.getPeriodMs(period);
    
    const currentPeriodStart = new Date(now.getTime() - periodMs);
    const previousPeriodStart = new Date(now.getTime() - (periodMs * 2));
    
    const currentEvents = this.events.filter(e => 
      e.timestamp >= currentPeriodStart && e.timestamp <= now
    );
    
    const previousEvents = this.events.filter(e => 
      e.timestamp >= previousPeriodStart && e.timestamp < currentPeriodStart
    );

    const currentCount = currentEvents.length;
    const previousCount = previousEvents.length;
    
    const growth = previousCount > 0 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : 0;

    const trend: 'up' | 'down' | 'stable' = 
      growth > 5 ? 'up' : 
      growth < -5 ? 'down' : 
      'stable';

    const insights = this.generateTrendInsights(currentEvents, previousEvents, growth);

    return { trend, growth, insights };
  }

  /**
   * Get real-time voice search data
   */
  public getRealTimeData(): {
    activeQueries: number;
    recentQueries: string[];
    currentSuccessRate: number;
    averageConfidence: number;
    topRegions: string[];
  } {
    const recentEvents = this.events.filter(e => 
      e.timestamp.getTime() > Date.now() - (5 * 60 * 1000) // Last 5 minutes
    );

    const recentQueries = recentEvents
      .map(e => e.query)
      .slice(-10);

    const successfulRecent = recentEvents.filter(e => e.success).length;
    const currentSuccessRate = recentEvents.length > 0 
      ? (successfulRecent / recentEvents.length) * 100 
      : 0;

    const confidenceValues = recentEvents
      .filter(e => e.confidence > 0)
      .map(e => e.confidence);
    const averageConfidence = confidenceValues.length > 0
      ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      : 0;

    const regionCounts = this.calculateDistribution(recentEvents, 'region');
    const topRegions = Object.entries(regionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([region]) => region);

    return {
      activeQueries: recentEvents.length,
      recentQueries,
      currentSuccessRate,
      averageConfidence,
      topRegions
    };
  }

  /**
   * Export analytics data
   */
  public exportData(format: 'json' | 'csv' = 'json', dateRange?: DateRange): string {
    const filteredEvents = this.filterEventsByDateRange(dateRange);
    
    if (format === 'csv') {
      return this.convertToCSV(filteredEvents);
    }
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalEvents: filteredEvents.length,
      dateRange,
      events: filteredEvents,
      metrics: this.getMetrics(dateRange),
      insights: this.getInsights()
    }, null, 2);
  }

  // Private helper methods

  private generateEventId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet') || userAgent.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  private detectVoiceAssistant(): 'google' | 'siri' | 'alexa' | 'browser' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) return 'google';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'siri';
    if (userAgent.includes('alexa')) return 'alexa';
    
    return 'browser';
  }

  private getCurrentLocation(): GeolocationData | undefined {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return undefined;
    }

    // Note: This would require async handling in a real implementation
    // For now, return undefined and implement async location tracking separately
    return undefined;
  }

  private classifyIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('quanto custa') || lowerQuery.includes('preço')) {
      return 'price-inquiry';
    }
    if (lowerQuery.includes('como fazer') || lowerQuery.includes('como comprar')) {
      return 'how-to';
    }
    if (lowerQuery.includes('onde') || lowerQuery.includes('localização')) {
      return 'location';
    }
    if (lowerQuery.includes('quando') || lowerQuery.includes('horário')) {
      return 'schedule';
    }
    if (lowerQuery.includes('melhor') || lowerQuery.includes('recomenda')) {
      return 'recommendation';
    }
    
    return 'informational';
  }

  private classifyCategory(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('passagem') || lowerQuery.includes('voo')) {
      return 'flights';
    }
    if (lowerQuery.includes('hotel') || lowerQuery.includes('hospedagem')) {
      return 'accommodation';
    }
    if (lowerQuery.includes('restaurante') || lowerQuery.includes('comida')) {
      return 'dining';
    }
    if (lowerQuery.includes('documento') || lowerQuery.includes('visto')) {
      return 'documents';
    }
    if (lowerQuery.includes('dinheiro') || lowerQuery.includes('remessa')) {
      return 'finance';
    }
    
    return 'general';
  }

  private analyzeRealTime(event: VoiceSearchEvent): void {
    // Real-time analysis for immediate insights
    if (!event.success) {
      this.generateInsight({
        type: 'issue',
        title: 'Voice Search Failure',
        description: `Failed query: "${event.query}" with ${event.confidence} confidence`,
        impact: 'medium',
        actionRequired: true,
        recommendation: 'Review query processing logic and add error handling',
        data: event
      });
    }

    // Detect trending queries
    const recentSimilarQueries = this.events.filter(e => 
      e.query.toLowerCase().includes(event.query.toLowerCase().split(' ')[0]) &&
      e.timestamp.getTime() > Date.now() - (60 * 60 * 1000) // Last hour
    );

    if (recentSimilarQueries.length >= 5) {
      this.generateInsight({
        type: 'trend',
        title: 'Trending Voice Query Detected',
        description: `Query type "${event.query}" is trending with ${recentSimilarQueries.length} similar searches`,
        impact: 'high',
        actionRequired: false,
        recommendation: 'Consider creating dedicated content for this trending topic',
        data: { mainQuery: event.query, similarQueries: recentSimilarQueries.length }
      });
    }
  }

  private persistEvent(event: VoiceSearchEvent): void {
    // In a real implementation, this would persist to database
    // For now, we just keep in memory with size limits
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000); // Keep last 5000 events
    }
  }

  private filterEventsByDateRange(dateRange?: DateRange): VoiceSearchEvent[] {
    if (!dateRange) return this.events;
    
    return this.events.filter(event => 
      event.timestamp >= dateRange.startDate && event.timestamp <= dateRange.endDate
    );
  }

  private calculateDistribution(events: VoiceSearchEvent[], field: keyof VoiceSearchEvent): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    events.forEach(event => {
      const value = String(event[field]);
      distribution[value] = (distribution[value] || 0) + 1;
    });
    
    return distribution;
  }

  private calculateTimeDistribution(events: VoiceSearchEvent[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      const timeSlot = `${hour}:00`;
      distribution[timeSlot] = (distribution[timeSlot] || 0) + 1;
    });
    
    return distribution;
  }

  private getPopularQueries(events: VoiceSearchEvent[]): QueryPopularity[] {
    const queryStats: Record<string, {
      count: number;
      confidenceSum: number;
      successCount: number;
      category: string;
      intent: string;
    }> = {};

    events.forEach(event => {
      if (!queryStats[event.query]) {
        queryStats[event.query] = {
          count: 0,
          confidenceSum: 0,
          successCount: 0,
          category: event.category,
          intent: event.intent
        };
      }
      
      const stats = queryStats[event.query];
      stats.count++;
      stats.confidenceSum += event.confidence;
      if (event.success) stats.successCount++;
    });

    return Object.entries(queryStats)
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageConfidence: stats.confidenceSum / stats.count,
        successRate: (stats.successCount / stats.count) * 100,
        category: stats.category,
        intent: stats.intent
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private calculateConversionRate(events: VoiceSearchEvent[]): number {
    const voiceSearches = events.filter(e => e.category !== 'interaction').length;
    const conversions = events.filter(e => 
      e.category === 'interaction' && 
      (e.intent === 'click' || e.intent === 'follow-up')
    ).length;
    
    return voiceSearches > 0 ? (conversions / voiceSearches) * 100 : 0;
  }

  private getEmptyMetrics(): VoiceSearchMetrics {
    return {
      totalQueries: 0,
      successRate: 0,
      averageConfidence: 0,
      averageResponseTime: 0,
      languageDistribution: {},
      regionDistribution: {},
      intentDistribution: {},
      deviceDistribution: {},
      assistantDistribution: {},
      timeOfDayDistribution: {},
      popularQueries: [],
      conversionRate: 0
    };
  }

  private generateInsight(insightData: Omit<VoiceSearchInsight, 'createdAt'>): void {
    const insight: VoiceSearchInsight = {
      ...insightData,
      createdAt: new Date()
    };
    
    this.insights.push(insight);
    
    // Keep only recent insights to prevent memory bloat
    if (this.insights.length > 1000) {
      this.insights = this.insights.slice(-500);
    }
  }

  private setupAutoInsights(): void {
    // Run insight generation every 5 minutes
    setInterval(() => {
      this.generatePeriodicInsights();
    }, 5 * 60 * 1000);
  }

  private generatePeriodicInsights(): void {
    const recentEvents = this.events.filter(e => 
      e.timestamp.getTime() > Date.now() - (60 * 60 * 1000) // Last hour
    );

    if (recentEvents.length < 10) return; // Need minimum data

    // Analyze patterns
    const metrics = this.getMetrics({
      startDate: new Date(Date.now() - (60 * 60 * 1000)),
      endDate: new Date()
    });

    // Generate insights based on current performance
    if (metrics.successRate < 80) {
      this.generateInsight({
        type: 'performance',
        title: 'Voice Search Success Rate Below Target',
        description: `Current success rate: ${metrics.successRate.toFixed(1)}% (Target: 80%+)`,
        impact: 'high',
        actionRequired: true,
        recommendation: 'Review failed queries and improve recognition accuracy',
        data: { successRate: metrics.successRate, target: 80 }
      });
    }

    if (metrics.averageConfidence < 0.7) {
      this.generateInsight({
        type: 'issue',
        title: 'Low Average Voice Confidence',
        description: `Average confidence: ${(metrics.averageConfidence * 100).toFixed(1)}%`,
        impact: 'medium',
        actionRequired: true,
        recommendation: 'Improve audio processing and add more training data',
        data: { confidence: metrics.averageConfidence, threshold: 0.7 }
      });
    }
  }

  private getRecentInsights(dateRange: DateRange): VoiceSearchInsight[] {
    return this.insights.filter(insight => 
      insight.createdAt >= dateRange.startDate && insight.createdAt <= dateRange.endDate
    );
  }

  private analyzeRegionalPerformance(events: VoiceSearchEvent[]): RegionalPerformance[] {
    const regionStats: Record<string, {
      queryVolume: number;
      successCount: number;
      confidenceSum: number;
      queries: string[];
    }> = {};

    events.forEach(event => {
      const region = event.region || 'unknown';
      if (!regionStats[region]) {
        regionStats[region] = {
          queryVolume: 0,
          successCount: 0,
          confidenceSum: 0,
          queries: []
        };
      }

      const stats = regionStats[region];
      stats.queryVolume++;
      if (event.success) stats.successCount++;
      stats.confidenceSum += event.confidence;
      stats.queries.push(event.query);
    });

    return Object.entries(regionStats).map(([region, stats]) => ({
      region,
      city: region, // Simplified - in real implementation, extract city from location data
      queryVolume: stats.queryVolume,
      successRate: (stats.successCount / stats.queryVolume) * 100,
      averageConfidence: stats.confidenceSum / stats.queryVolume,
      topQueries: [...new Set(stats.queries)].slice(0, 5),
      growthRate: 0 // Would calculate based on historical data
    }));
  }

  private generateQueryOptimizations(events: VoiceSearchEvent[]): QueryOptimization[] {
    const failedQueries = events.filter(e => !e.success || e.confidence < 0.6);
    
    return failedQueries
      .slice(0, 10)
      .map(event => ({
        originalQuery: event.query,
        optimizedQuery: this.optimizeQuery(event.query),
        improvementReason: 'Improved clarity and common voice search patterns',
        expectedImpact: 25,
        currentPerformance: event.confidence * 100,
        targetPerformance: 85
      }));
  }

  private optimizeQuery(query: string): string {
    // Basic query optimization - in real implementation, use ML/NLP
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private analyzeCompetitiveVoiceData(events: VoiceSearchEvent[]): CompetitiveVoiceData {
    // Mock competitive analysis - in real implementation, integrate with SEO tools
    return {
      marketShare: {
        'fly2any': 25,
        'competitor1': 30,
        'competitor2': 20,
        'others': 25
      },
      voiceKeywordRankings: [
        {
          keyword: 'passagens brasil',
          position: 3,
          featured: false,
          confidence: 0.85,
          language: 'pt-BR'
        },
        {
          keyword: 'voos para brasil',
          position: 1,
          featured: true,
          confidence: 0.92,
          language: 'pt-BR'
        }
      ],
      featureSnippetCaptures: 15,
      averageResponseQuality: 8.2
    };
  }

  private getPeriodMs(period: 'day' | 'week' | 'month'): number {
    switch (period) {
      case 'day': return 24 * 60 * 60 * 1000;
      case 'week': return 7 * 24 * 60 * 60 * 1000;
      case 'month': return 30 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private generateTrendInsights(
    currentEvents: VoiceSearchEvent[], 
    previousEvents: VoiceSearchEvent[], 
    growth: number
  ): string[] {
    const insights: string[] = [];

    if (growth > 10) {
      insights.push(`Voice search volume increased by ${growth.toFixed(1)}%`);
    }

    const currentIntents = this.calculateDistribution(currentEvents, 'intent');
    const previousIntents = this.calculateDistribution(previousEvents, 'intent');
    
    Object.entries(currentIntents).forEach(([intent, count]) => {
      const previousCount = previousIntents[intent] || 0;
      const intentGrowth = previousCount > 0 ? ((count - previousCount) / previousCount) * 100 : 100;
      
      if (intentGrowth > 25) {
        insights.push(`${intent} queries increased by ${intentGrowth.toFixed(1)}%`);
      }
    });

    return insights;
  }

  private convertToCSV(events: VoiceSearchEvent[]): string {
    if (events.length === 0) return '';

    const headers = [
      'timestamp', 'query', 'language', 'region', 'confidence', 
      'responseTime', 'success', 'deviceType', 'voiceAssistant', 
      'intent', 'category'
    ];

    const csvData = events.map(event => [
      event.timestamp.toISOString(),
      `"${event.query}"`,
      event.language,
      event.region,
      event.confidence.toString(),
      event.responseTime.toString(),
      event.success.toString(),
      event.deviceType,
      event.voiceAssistant,
      event.intent,
      event.category
    ]);

    return [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  }
}

export default VoiceSearchAnalytics;