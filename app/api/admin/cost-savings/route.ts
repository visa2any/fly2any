/**
 * Cost Savings Analytics API
 *
 * Returns comprehensive cost savings data from the cache analytics system.
 * Powers the admin cost savings dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCacheStatistics,
  calculateCostSavings,
  getHistoricalStatistics,
  generateCacheReport,
  getTopPerformingEndpoints,
  getWorstPerformingEndpoints,
  getCacheEffectivenessScore,
} from '@/lib/cache/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cost-savings
 * Returns cost savings analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get('days') || '7');
    const detailed = searchParams.get('detailed') === 'true';

    // Get current statistics
    const currentStats = getCacheStatistics();
    const costSavings = calculateCostSavings(currentStats);
    const effectivenessScore = getCacheEffectivenessScore(currentStats);

    // Get historical data
    const historical = await getHistoricalStatistics(daysBack);

    // Calculate projections
    const dailyAvgRequests = historical.daily.reduce((sum, d) => sum + d.total, 0) / Math.max(historical.daily.length, 1);
    const dailyAvgHitRate = historical.daily.reduce((sum, d) => sum + d.hitRate, 0) / Math.max(historical.daily.length, 1);

    // Cost constants
    const AMADEUS_COST_PER_CALL = 0.04;
    const DUFFEL_COST_PER_CALL = 0.02;
    const AVG_COST_PER_CALL = (AMADEUS_COST_PER_CALL + DUFFEL_COST_PER_CALL) / 2;

    // Monthly projections based on current trends
    const projectedMonthlyRequests = dailyAvgRequests * 30;
    const projectedMonthlySavings = projectedMonthlyRequests * (dailyAvgHitRate / 100) * AVG_COST_PER_CALL;
    const projectedMonthlyCost = projectedMonthlyRequests * (1 - dailyAvgHitRate / 100) * AVG_COST_PER_CALL;

    // Build response
    const response: any = {
      summary: {
        totalRequests: currentStats.totalRequests,
        cacheHits: currentStats.hits,
        cacheMisses: currentStats.misses,
        hitRate: parseFloat(currentStats.hitRate.toFixed(2)),
        errors: currentStats.errors,
        effectivenessScore,
        lastReset: currentStats.lastReset,
      },
      costSavings: {
        ...costSavings,
        costPerApiCall: AVG_COST_PER_CALL,
        amadeusRate: AMADEUS_COST_PER_CALL,
        duffelRate: DUFFEL_COST_PER_CALL,
      },
      projections: {
        dailyAvgRequests: Math.round(dailyAvgRequests),
        dailyAvgHitRate: parseFloat(dailyAvgHitRate.toFixed(2)),
        monthlyProjectedRequests: Math.round(projectedMonthlyRequests),
        monthlyProjectedSavings: parseFloat(projectedMonthlySavings.toFixed(2)),
        monthlyProjectedCost: parseFloat(projectedMonthlyCost.toFixed(2)),
        annualProjectedSavings: parseFloat((projectedMonthlySavings * 12).toFixed(2)),
      },
      historical: {
        days: daysBack,
        data: historical.daily,
      },
      timestamp: new Date().toISOString(),
    };

    // Add detailed data if requested
    if (detailed) {
      const report = await generateCacheReport();
      response.endpoints = {
        top: getTopPerformingEndpoints(5),
        worst: getWorstPerformingEndpoints(5),
      };
      response.recommendations = report.recommendations;
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60', // 1 minute cache
      },
    });
  } catch (error: any) {
    console.error('Cost savings API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve cost savings data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
