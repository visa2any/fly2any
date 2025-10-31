import { NextRequest, NextResponse } from 'next/server';
import { abTestManager } from '@/lib/ab-testing/test-manager';

/**
 * GET /api/analytics/ab-tests
 * ===========================
 * Returns A/B test performance metrics
 * Calculates conversion rates and statistical significance
 */

interface VariantMetrics {
  variant: string;
  exposures: number;
  views: number;
  clicks: number;
  startedBooking: number;
  reachedPayment: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  revenuePerUser: number;
  clickThroughRate: number;
  bookingStartRate: number;
  paymentReachRate: number;
}

interface TestResults {
  testId: string;
  testName: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate?: string;
  variants: VariantMetrics[];
  winner?: string;
  lift?: number;
  confidence?: number;
}

export async function GET(request: NextRequest) {
  try {
    const activeTests = abTestManager.getActiveTests();

    // TODO: Fetch real data from database
    // For now, return mock data for demonstration

    const results: TestResults[] = activeTests.map(test => {
      // Mock metrics for demonstration
      const controlMetrics: VariantMetrics = {
        variant: 'control',
        exposures: 1000,
        views: 1000,
        clicks: 250,
        startedBooking: 80,
        reachedPayment: 50,
        conversions: 25,
        conversionRate: 2.5,
        revenue: 11250,
        revenuePerUser: 11.25,
        clickThroughRate: 25.0,
        bookingStartRate: 8.0,
        paymentReachRate: 5.0,
      };

      const variantMetrics: VariantMetrics = {
        variant: 'variant_a',
        exposures: 4000,
        views: 4000,
        clicks: 1100,
        startedBooking: 380,
        reachedPayment: 250,
        conversions: 140,
        conversionRate: 3.5,
        revenue: 67200,
        revenuePerUser: 16.80,
        clickThroughRate: 27.5,
        bookingStartRate: 9.5,
        paymentReachRate: 6.25,
      };

      // Calculate lift and confidence
      const lift = ((variantMetrics.conversionRate - controlMetrics.conversionRate) / controlMetrics.conversionRate) * 100;
      const confidence = calculateStatisticalConfidence(controlMetrics, variantMetrics);

      return {
        testId: test.id,
        testName: test.name,
        status: 'active' as const,
        startDate: test.startDate.toISOString(),
        endDate: test.endDate?.toISOString(),
        variants: [controlMetrics, variantMetrics],
        winner: confidence > 95 && lift > 0 ? 'variant_a' : undefined,
        lift: parseFloat(lift.toFixed(1)),
        confidence: parseFloat(confidence.toFixed(1)),
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: results,
      summary: {
        totalTests: results.length,
        activeTests: results.filter(t => t.status === 'active').length,
        winnersFound: results.filter(t => t.winner).length,
      },
    });

  } catch (error) {
    console.error('A/B test analytics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch A/B test results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate statistical confidence using z-test for proportions
 * Returns confidence level (0-100)
 */
function calculateStatisticalConfidence(control: VariantMetrics, variant: VariantMetrics): number {
  const p1 = control.conversionRate / 100;
  const p2 = variant.conversionRate / 100;
  const n1 = control.exposures;
  const n2 = variant.exposures;

  // Pooled proportion
  const pPool = (p1 * n1 + p2 * n2) / (n1 + n2);

  // Standard error
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

  // Z-score
  const z = Math.abs((p2 - p1) / se);

  // Convert z-score to confidence level (simplified)
  // z = 1.96 corresponds to 95% confidence
  // z = 2.58 corresponds to 99% confidence
  const confidence = Math.min(99.9, (1 - Math.exp(-z * z / 2)) * 100);

  return confidence;
}
