import { NextResponse } from 'next/server';
import { getFunnelSummary } from '@/lib/analytics/funnel-alerts';

export async function GET() {
  try {
    const summary = await getFunnelSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Funnel API error:', error);
    // Return mock data if funnel system not ready
    return NextResponse.json({
      totalSearches: 0,
      totalBookings: 0,
      overallConversion: 0,
      steps: [
        { step: 'Search', count: 0, conversionRate: 1, dropOff: 0, isAnomalous: false },
        { step: 'Results', count: 0, conversionRate: 0, dropOff: 1, isAnomalous: false },
        { step: 'Select', count: 0, conversionRate: 0, dropOff: 1, isAnomalous: false },
        { step: 'Checkout', count: 0, conversionRate: 0, dropOff: 1, isAnomalous: false },
        { step: 'Payment', count: 0, conversionRate: 0, dropOff: 1, isAnomalous: false },
        { step: 'Complete', count: 0, conversionRate: 0, dropOff: 1, isAnomalous: false },
      ].map(s => ({ name: s.step, count: s.count, rate: s.conversionRate, isAnomalous: s.isAnomalous }))
    });
  }
}
