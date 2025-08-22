/**
 * SEO Analytics API Endpoint
 * Provides real-time SEO metrics and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import CoreWebVitalsOptimizer from '@/lib/seo/core-web-vitals';
import AdvancedSchemaGenerator from '@/lib/seo/advanced-schema';
import InternationalSEOManager from '@/lib/seo/international-seo';
import SEOAutomationEngine from '@/lib/seo/seo-automation';
import LocalSEOOptimizer from '@/lib/seo/local-seo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const location = searchParams.get('location');
    const language = searchParams.get('language') || 'pt-BR';

    switch (type) {
      case 'overview':
        return NextResponse.json(await getSEOOverview());
      
      case 'performance':
        return NextResponse.json(await getPerformanceMetrics());
      
      case 'rankings':
        return NextResponse.json(await getRankingData());
      
      case 'recommendations':
        return NextResponse.json(await getRecommendations());
      
      case 'competitors':
        return NextResponse.json(await getCompetitorAnalysis());
      
      case 'content-opportunities':
        return NextResponse.json(await getContentOpportunities());
      
      case 'local':
        return NextResponse.json(await getLocalSEOData(location || undefined));
      
      case 'international':
        return NextResponse.json(await getInternationalSEOData(language));
      
      case 'report':
        return NextResponse.json(await generateComprehensiveReport());
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SEO Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, ...payload } = data;

    switch (action) {
      case 'track-web-vitals':
        return NextResponse.json(await trackWebVitals(payload));
      
      case 'update-rankings':
        return NextResponse.json(await updateRankings(payload));
      
      case 'generate-content':
        return NextResponse.json(await generateOptimizedContent(payload));
      
      case 'submit-recommendation':
        return NextResponse.json(await submitRecommendation(payload));
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SEO Analytics POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getSEOOverview() {
  const automationEngine = SEOAutomationEngine.getInstance();
  const metrics = automationEngine.getHistoricalMetrics();
  const latestMetrics = metrics[metrics.length - 1];
  
  return {
    summary: {
      organicTraffic: latestMetrics?.organicTraffic || 0,
      totalKeywords: automationEngine.getCurrentRankings().size,
      averagePosition: calculateAveragePosition(automationEngine.getCurrentRankings()),
      seoScore: calculateOverallSEOScore(latestMetrics),
      lastUpdated: new Date().toISOString()
    },
    trends: {
      trafficTrend: calculateTrafficTrend(metrics),
      rankingTrend: calculateRankingTrend(automationEngine.getCurrentRankings()),
      performanceTrend: calculatePerformanceTrend(metrics)
    },
    alerts: getActiveAlerts(automationEngine.getRecommendations('high'))
  };
}

async function getPerformanceMetrics() {
  const webVitalsOptimizer = CoreWebVitalsOptimizer.getInstance();
  const performanceScore = webVitalsOptimizer.getPerformanceScore();
  
  return {
    coreWebVitals: performanceScore.details.metrics || {},
    performanceScore: performanceScore.score,
    recommendations: performanceScore.details.recommendations || [],
    benchmarks: {
      fcp: { good: '<1.8s', needsImprovement: '1.8s-3s', poor: '>3s' },
      lcp: { good: '<2.5s', needsImprovement: '2.5s-4s', poor: '>4s' },
      fid: { good: '<100ms', needsImprovement: '100ms-300ms', poor: '>300ms' },
      cls: { good: '<0.1', needsImprovement: '0.1-0.25', poor: '>0.25' }
    }
  };
}

async function getRankingData() {
  const automationEngine = SEOAutomationEngine.getInstance();
  const rankings = automationEngine.getCurrentRankings();
  
  const processedRankings: Array<{
    keyword: string;
    position: number;
    url: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    volume: number;
    difficulty: number;
    opportunity: number;
  }> = [];
  
  rankings.forEach((rankingHistory, keyword) => {
    const latest = rankingHistory[rankingHistory.length - 1];
    const previous = rankingHistory[rankingHistory.length - 2];
    
    processedRankings.push({
      keyword,
      position: latest.position,
      url: latest.url,
      trend: latest.trend,
      change: (previous?.position || 0) - latest.position,
      volume: latest.searchVolume || 0,
      difficulty: latest.difficulty || 0,
      opportunity: calculateOpportunityScore(latest)
    });
  });
  
  return {
    keywords: processedRankings.sort((a, b) => a.position - b.position),
    summary: {
      total: processedRankings.length,
      top10: processedRankings.filter(r => r.position <= 10).length,
      top3: processedRankings.filter(r => r.position <= 3).length,
      improved: processedRankings.filter(r => r.trend === 'up').length,
      declined: processedRankings.filter(r => r.trend === 'down').length
    }
  };
}

async function getRecommendations() {
  const automationEngine = SEOAutomationEngine.getInstance();
  const recommendations = automationEngine.getRecommendations();
  
  return {
    high: recommendations.filter(r => r.priority === 'high' && r.status === 'pending'),
    medium: recommendations.filter(r => r.priority === 'medium' && r.status === 'pending'),
    low: recommendations.filter(r => r.priority === 'low' && r.status === 'pending'),
    completed: recommendations.filter(r => r.status === 'completed'),
    inProgress: recommendations.filter(r => r.status === 'in-progress')
  };
}

async function getCompetitorAnalysis() {
  const automationEngine = SEOAutomationEngine.getInstance();
  const competitors = automationEngine.getCompetitorAnalysis();
  
  const competitorArray = Array.from(competitors.values()).map(competitor => ({
    domain: competitor.domain,
    averagePosition: competitor.averagePosition,
    estimatedTraffic: competitor.estimatedTraffic,
    backlinks: competitor.backlinks,
    domainAuthority: competitor.domainAuthority,
    overlapKeywords: competitor.overlapKeywords.length,
    contentGaps: competitor.contentGaps,
    lastAnalyzed: competitor.lastAnalyzed
  }));
  
  return {
    competitors: competitorArray,
    insights: {
      averageDA: competitorArray.reduce((sum, c) => sum + c.domainAuthority, 0) / competitorArray.length,
      averageBacklinks: competitorArray.reduce((sum, c) => sum + c.backlinks, 0) / competitorArray.length,
      topOpportunities: extractTopOpportunities(competitors),
      contentGaps: extractContentGaps(competitors)
    }
  };
}

async function getContentOpportunities() {
  const automationEngine = SEOAutomationEngine.getInstance();
  const opportunities = automationEngine.getContentOpportunities();
  
  return {
    opportunities: opportunities.slice(0, 20), // Top 20 opportunities
    summary: {
      total: opportunities.length,
      highPriority: opportunities.filter(o => o.priority >= 8).length,
      totalEstimatedTraffic: opportunities.reduce((sum, o) => sum + o.estimatedTraffic, 0),
      averageDifficulty: opportunities.reduce((sum, o) => sum + o.difficulty, 0) / opportunities.length
    }
  };
}

async function getLocalSEOData(location?: string) {
  const localSEO = LocalSEOOptimizer.getInstance();
  
  if (location) {
    const communityData = localSEO.getCommunityData(location);
    const landingPageContent = localSEO.generateLocalLandingPageContent(location);
    const localKeywords = localSEO.getLocalKeywords(location);
    
    return {
      community: communityData,
      landingPage: landingPageContent,
      keywords: localKeywords,
      schema: localSEO.generateLocalServiceSchema(location)
    };
  }
  
  const performance = await localSEO.monitorLocalSearchPerformance();
  const businessProfile = localSEO.getBusinessProfile();
  const communities = Array.from(localSEO.getTargetCommunities().values());
  
  return {
    business: businessProfile,
    communities,
    performance,
    citations: localSEO.generateCitationOpportunities(),
    gmb: localSEO.generateGoogleMyBusinessData()
  };
}

async function getInternationalSEOData(language: string) {
  const internationalSEO = InternationalSEOManager.getInstance();
  
  const languageConfig = internationalSEO.getLanguageConfig(language);
  const supportedLanguages = internationalSEO.getSupportedLanguages();
  
  return {
    currentLanguage: languageConfig,
    supportedLanguages,
    hreflangUrls: internationalSEO.generateHreflangTags('/'),
    localizedKeywords: internationalSEO.getLocalizedKeywords(language),
    currency: internationalSEO.getCurrency(language),
    dateFormat: internationalSEO.getDateFormat(language),
    seasonalOptimization: internationalSEO.getSeasonalOptimization(
      languageConfig?.region || 'US',
      new Date()
    )
  };
}

async function generateComprehensiveReport() {
  const automationEngine = SEOAutomationEngine.getInstance();
  return await automationEngine.generateSEOReport();
}

async function trackWebVitals(data: any) {
  // Store web vitals data for analysis
  console.log('📊 Web Vitals tracked:', data);
  
  // In production, save to database
  // await saveWebVitalsData(data);
  
  return { success: true, message: 'Web vitals data recorded' };
}

async function updateRankings(data: any) {
  // Update keyword rankings
  console.log('📈 Rankings updated:', data);
  
  return { success: true, message: 'Rankings updated' };
}

async function generateOptimizedContent(data: any) {
  // Generate optimized content using AI
  const { type, language, keywords, route } = data;
  
  // Implementation would use AIContentGenerator
  console.log('🎯 Content generation requested:', { type, language, keywords });
  
  return {
    success: true,
    message: 'Content generated successfully',
    content: {
      title: 'Generated optimized title',
      description: 'Generated meta description',
      content: 'Generated content body...'
    }
  };
}

async function submitRecommendation(data: any) {
  // Submit or update recommendation status
  console.log('✅ Recommendation submitted:', data);
  
  return { success: true, message: 'Recommendation updated' };
}

// Helper functions

function calculateAveragePosition(rankings: Map<string, any[]>) {
  const allRankings = Array.from(rankings.values()).flat();
  if (allRankings.length === 0) return 0;
  
  const sum = allRankings.reduce((sum, ranking) => sum + ranking.position, 0);
  return Math.round(sum / allRankings.length);
}

function calculateOverallSEOScore(metrics: any) {
  if (!metrics) return 0;
  
  const performanceScore = metrics.pageSpeed ? Math.max(0, 100 - metrics.pageSpeed * 10) : 50;
  const trafficScore = Math.min(100, metrics.organicTraffic / 1000);
  const technicalScore = metrics.crawlErrors ? Math.max(0, 100 - metrics.crawlErrors * 5) : 90;
  
  return Math.round((performanceScore + trafficScore + technicalScore) / 3);
}

function calculateTrafficTrend(metrics: any[]) {
  if (metrics.length < 2) return 'stable';
  
  const recent = metrics.slice(-7); // Last 7 data points
  const growth = (recent[recent.length - 1]?.organicTraffic - recent[0]?.organicTraffic) / recent[0]?.organicTraffic;
  
  if (growth > 0.1) return 'up';
  if (growth < -0.1) return 'down';
  return 'stable';
}

function calculateRankingTrend(rankings: Map<string, any[]>) {
  const trends = { up: 0, down: 0, stable: 0 };
  
  rankings.forEach(history => {
    const latest = history[history.length - 1];
    if (latest) {
      if (latest.trend in trends) {
        trends[latest.trend as keyof typeof trends]++;
      }
    }
  });
  
  return trends;
}

function calculatePerformanceTrend(metrics: any[]) {
  if (metrics.length < 2) return 'stable';
  
  const recent = metrics.slice(-5);
  const avgRecent = recent.reduce((sum, m) => sum + m.pageSpeed, 0) / recent.length;
  const older = metrics.slice(-10, -5);
  const avgOlder = older.reduce((sum, m) => sum + m.pageSpeed, 0) / older.length;
  
  if (avgRecent < avgOlder - 0.2) return 'improving';
  if (avgRecent > avgOlder + 0.2) return 'declining';
  return 'stable';
}

function getActiveAlerts(highPriorityRecs: any[]) {
  return highPriorityRecs.map(rec => ({
    type: rec.type,
    title: rec.title,
    priority: rec.priority,
    impact: rec.impact,
    deadline: rec.deadline
  })).slice(0, 5); // Top 5 alerts
}

function extractTopOpportunities(competitors: Map<string, any>) {
  const opportunities: Array<{
    type: string;
    priority: number;
    impact: number;
    difficulty: number;
    description: string;
    keywords?: string[];
    estimatedTraffic?: number;
    timeframe?: string;
  }> = [];
  
  competitors.forEach(competitor => {
    competitor.contentGaps.forEach((gap: string) => {
      opportunities.push({
        type: 'content',
        priority: 7,
        impact: 8,
        difficulty: 5,
        description: `Create content for "${gap}" keyword`,
        keywords: [gap],
        estimatedTraffic: 100,
        timeframe: '4-6 weeks'
      });
    });
  });
  
  return opportunities.slice(0, 10);
}

function extractContentGaps(competitors: Map<string, any>) {
  const allGaps = new Set();
  
  competitors.forEach(competitor => {
    competitor.contentGaps.forEach((gap: string) => allGaps.add(gap));
  });
  
  return Array.from(allGaps);
}

function calculateOpportunityScore(ranking: any): number {
  const positionScore = Math.max(0, 100 - ranking.position * 5);
  const volumeScore = Math.min(100, (ranking.searchVolume || 0) / 100);
  const difficultyScore = Math.max(0, 100 - (ranking.difficulty || 50));
  
  return Math.round((positionScore + volumeScore + difficultyScore) / 3);
}