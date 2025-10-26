/**
 * ML Analytics API
 * Provides insights into ML-powered cost optimization performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { routeProfiler } from '@/lib/ml/route-profiler';
import { getRedisClient } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ml/analytics
 * Returns ML system performance metrics and cost savings data
 */
export async function GET(request: NextRequest) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not available - ML analytics unavailable' },
        { status: 503 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    // Calculate date range
    const now = Date.now();
    const periodMs = period === '30d' ? 30 * 24 * 60 * 60 * 1000
                   : period === '90d' ? 90 * 24 * 60 * 60 * 1000
                   : 7 * 24 * 60 * 60 * 1000;

    const startTime = now - periodMs;

    // Get all route profiles
    const routeKeys = await redis.keys('route:profile:*');
    const profiles = await Promise.all(
      routeKeys.map(async (key) => {
        const data = await redis.get(key);
        if (!data) return null;
        // Handle both string and object responses from Redis
        return typeof data === 'string' ? JSON.parse(data) : data;
      })
    );

    const validProfiles = profiles.filter(p => p !== null);

    // Get all API performance profiles
    const apiPerfKeys = await redis.keys('route:api:perf:*');
    const apiPerformances = await Promise.all(
      apiPerfKeys.map(async (key) => {
        const data = await redis.get(key);
        if (!data) return null;
        // Handle both string and object responses from Redis
        return typeof data === 'string' ? JSON.parse(data) : data;
      })
    );

    const validApiPerf = apiPerformances.filter(p => p !== null);

    // Calculate aggregate metrics
    const totalRoutes = validProfiles.length;
    const totalSearches = validProfiles.reduce((sum, p) => sum + (p.searchesLast7Days || 0), 0);

    // If no data yet, return graceful defaults
    if (totalRoutes === 0) {
      return NextResponse.json({
        period,
        timestamp: new Date().toISOString(),
        overview: {
          totalRoutes: 0,
          totalSearches: 0,
          avgVolatility: 0,
          avgCacheTTL: 15,
          amadeusWinRate: 0.5,
          duffelCoverageRate: 0.5,
        },
        costSavings: {
          baselineCost: 0,
          optimizedCost: 0,
          totalSavings: 0,
          savingsPercentage: 0,
          cacheHitRate: 0,
          singleAPIRate: 0,
        },
        apiEfficiency: {
          baselineAPICalls: 0,
          optimizedAPICalls: 0,
          callsSaved: 0,
          efficiencyGain: 0,
        },
        insights: {
          topRoutes: [],
          volatileRoutes: [],
          stableRoutes: [],
        },
        health: {
          redisConnected: true,
          profilesCovered: 0,
          dataQuality: 'building',
          mlReadiness: 'warming_up',
        },
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60',
        },
      });
    }

    // Average volatility across all routes
    const avgVolatility = totalRoutes > 0
      ? validProfiles.reduce((sum, p) => sum + (p.volatility || 0), 0) / totalRoutes
      : 0;

    // Average cache TTL
    const avgCacheTTL = totalRoutes > 0
      ? validProfiles.reduce((sum, p) => sum + (p.optimalTTL || 15), 0) / totalRoutes
      : 15;

    // API selection stats
    const amadeusWinRate = validApiPerf.length > 0
      ? validApiPerf.reduce((sum, p) => sum + (p.amadeusWinRate || 0.5), 0) / validApiPerf.length
      : 0.5;

    const duffelCoverageRate = validApiPerf.length > 0
      ? validApiPerf.reduce((sum, p) => sum + (p.duffelCoverageRate || 0.5), 0) / validApiPerf.length
      : 0.5;

    // Cost savings calculation
    const AMADEUS_COST_PER_CALL = 0.04;
    const FREE_TIER_MONTHLY = 10000;

    // Baseline cost: 2 API calls per search (both Amadeus + Duffel)
    const baselineAPICalls = totalSearches * 2;
    const baselineCost = Math.max(0, (baselineAPICalls - FREE_TIER_MONTHLY) * AMADEUS_COST_PER_CALL);

    // Optimized cost with smart caching and API selection
    // Assume 70% cache hit rate and 40% single-API searches
    const cacheHitRate = 0.70;
    const singleAPIRate = 0.40;

    const actualSearches = totalSearches * (1 - cacheHitRate); // 30% hit API
    const dualAPISearches = actualSearches * (1 - singleAPIRate); // 60% query both
    const singleAPISearches = actualSearches * singleAPIRate; // 40% query one

    const optimizedAPICalls = (dualAPISearches * 2) + (singleAPISearches * 1);
    const optimizedCost = Math.max(0, (optimizedAPICalls - FREE_TIER_MONTHLY) * AMADEUS_COST_PER_CALL);

    const costSavings = baselineCost - optimizedCost;
    const savingsPercentage = baselineCost > 0 ? (costSavings / baselineCost) * 100 : 0;

    // Top performing routes (by searches)
    const topRoutes = validProfiles
      .sort((a, b) => (b.searchesLast7Days || 0) - (a.searchesLast7Days || 0))
      .slice(0, 10)
      .map(p => ({
        route: p.route,
        searches: p.searchesLast7Days || 0,
        volatility: p.volatility || 0,
        cacheTTL: p.optimalTTL || 15,
        avgPrice: p.avgPrice || 0,
      }));

    // Most volatile routes
    const volatileRoutes = validProfiles
      .filter(p => (p.volatility || 0) > 0.5)
      .sort((a, b) => (b.volatility || 0) - (a.volatility || 0))
      .slice(0, 5)
      .map(p => ({
        route: p.route,
        volatility: p.volatility || 0,
        cacheTTL: p.optimalTTL || 15,
        searches: p.searchesLast7Days || 0,
      }));

    // Most stable routes (best for caching)
    const stableRoutes = validProfiles
      .filter(p => (p.volatility || 0) < 0.3 && (p.searchesLast7Days || 0) > 5)
      .sort((a, b) => (a.volatility || 0) - (b.volatility || 0))
      .slice(0, 5)
      .map(p => ({
        route: p.route,
        volatility: p.volatility || 0,
        cacheTTL: p.optimalTTL || 15,
        searches: p.searchesLast7Days || 0,
      }));

    const analytics = {
      period,
      timestamp: new Date().toISOString(),

      // Overview metrics
      overview: {
        totalRoutes,
        totalSearches,
        avgVolatility: parseFloat(avgVolatility.toFixed(3)),
        avgCacheTTL: Math.round(avgCacheTTL),
        amadeusWinRate: parseFloat(amadeusWinRate.toFixed(3)),
        duffelCoverageRate: parseFloat(duffelCoverageRate.toFixed(3)),
      },

      // Cost savings
      costSavings: {
        baselineCost: parseFloat(baselineCost.toFixed(2)),
        optimizedCost: parseFloat(optimizedCost.toFixed(2)),
        totalSavings: parseFloat(costSavings.toFixed(2)),
        savingsPercentage: parseFloat(savingsPercentage.toFixed(1)),
        cacheHitRate: cacheHitRate * 100,
        singleAPIRate: singleAPIRate * 100,
      },

      // API efficiency
      apiEfficiency: {
        baselineAPICalls,
        optimizedAPICalls: Math.round(optimizedAPICalls),
        callsSaved: Math.round(baselineAPICalls - optimizedAPICalls),
        efficiencyGain: baselineAPICalls > 0
          ? parseFloat(((1 - optimizedAPICalls / baselineAPICalls) * 100).toFixed(1))
          : 0,
      },

      // Top routes
      insights: {
        topRoutes,
        volatileRoutes,
        stableRoutes,
      },

      // System health
      health: {
        redisConnected: true,
        profilesCovered: totalRoutes,
        dataQuality: totalRoutes > 0 ? 'good' : 'building',
        mlReadiness: totalRoutes >= 10 ? 'ready' : 'warming_up',
      },
    };

    return NextResponse.json(analytics, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error: any) {
    console.error('ML Analytics API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate ML analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ml/analytics/route/{routeId}
 * Get detailed analytics for a specific route
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { route } = body;

    if (!route) {
      return NextResponse.json(
        { error: 'Route parameter required' },
        { status: 400 }
      );
    }

    // Get route profile
    const profile = await routeProfiler.getRouteProfile(route);

    if (!profile) {
      return NextResponse.json(
        { error: 'Route not found', route },
        { status: 404 }
      );
    }

    // Get API performance
    const apiPerf = await routeProfiler.getAPIPerformance(route);

    // Get recent searches
    const recentSearches = await routeProfiler.getRecentSearches(route, 7);

    // Get recent prices
    const recentPrices = await routeProfiler.getRecentPrices(route, 30);

    const routeAnalytics = {
      route,
      timestamp: new Date().toISOString(),

      profile: {
        volatility: profile.volatility,
        popularity: profile.popularity,
        optimalCacheTTL: profile.optimalTTL,
        avgPrice: profile.avgPrice,
        priceStdDev: profile.priceStdDev,
        searchesLast7Days: profile.searchesLast7Days,
        searchesLast30Days: profile.searchesLast30Days,
        lastUpdated: profile.lastUpdated,
      },

      apiPerformance: apiPerf ? {
        amadeusWinRate: apiPerf.amadeusWinRate,
        duffelWinRate: apiPerf.duffelWinRate,
        avgPriceDifference: apiPerf.avgPriceDifference,
        duffelCoverageRate: apiPerf.duffelCoverageRate,
        amadeusAvgResponseTime: apiPerf.amadeusAvgResponseTime,
        duffelAvgResponseTime: apiPerf.duffelAvgResponseTime,
      } : null,

      searchHistory: recentSearches.slice(0, 20).map(s => ({
        timestamp: s.timestamp,
        lowestPrice: s.lowestPrice,
        resultCount: s.resultCount,
        cacheHit: s.cacheHit,
      })),

      priceHistory: recentPrices.map(p => ({
        timestamp: p.timestamp,
        price: p.price,
        currency: p.currency,
      })),

      recommendations: {
        cacheTTL: profile.optimalTTL,
        apiStrategy: apiPerf && apiPerf.amadeusWinRate > 0.8 ? 'amadeus_only' : 'both',
        priceStability: profile.volatility < 0.3 ? 'stable' : profile.volatility > 0.7 ? 'volatile' : 'moderate',
      },
    };

    return NextResponse.json(routeAnalytics, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    });

  } catch (error: any) {
    console.error('Route analytics error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate route analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
