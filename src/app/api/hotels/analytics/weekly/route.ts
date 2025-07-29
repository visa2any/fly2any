/**
 * Hotel Analytics Weekly API Endpoint
 * GET /api/hotels/analytics/weekly
 * 
 * Returns weekly analytics based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Generate mock weekly analytics data
function generateWeeklyAnalytics() {
  const now = new Date();
  const weeks = [];
  
  // Generate data for last 12 weeks
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const baseBookings = 150 + Math.floor(Math.random() * 100);
    const baseRevenue = baseBookings * (300 + Math.random() * 200);
    
    weeks.push({
      weekNumber: 52 - i,
      year: weekStart.getFullYear(),
      periodStart: weekStart.toISOString().split('T')[0],
      periodEnd: weekEnd.toISOString().split('T')[0],
      metrics: {
        totalBookings: baseBookings,
        totalRevenue: Math.round(baseRevenue),
        averageBookingValue: Math.round(baseRevenue / baseBookings),
        uniqueGuests: Math.floor(baseBookings * 0.85),
        searchQueries: baseBookings * (8 + Math.floor(Math.random() * 4)),
        conversionRate: Math.round((baseBookings / (baseBookings * 10)) * 1000) / 10,
        topDestinations: [
          { city: 'São Paulo', bookings: Math.floor(baseBookings * 0.25) },
          { city: 'Rio de Janeiro', bookings: Math.floor(baseBookings * 0.20) },
          { city: 'Salvador', bookings: Math.floor(baseBookings * 0.15) },
          { city: 'Fortaleza', bookings: Math.floor(baseBookings * 0.12) },
          { city: 'Fernando de Noronha', bookings: Math.floor(baseBookings * 0.08) }
        ],
        deviceTypes: {
          mobile: Math.round(baseBookings * 0.65),
          desktop: Math.round(baseBookings * 0.30),
          tablet: Math.round(baseBookings * 0.05)
        },
        currencies: {
          BRL: Math.round(baseRevenue * 0.70),
          USD: Math.round(baseRevenue * 0.20),
          EUR: Math.round(baseRevenue * 0.10)
        }
      }
    });
  }
  
  return weeks;
}

// Calculate growth rates
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * GET /api/hotels/analytics/weekly
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const weeks = parseInt(url.searchParams.get('weeks') || '12');
    const currency = url.searchParams.get('currency') || 'BRL';
    
    const weeklyData = generateWeeklyAnalytics().slice(-weeks);
    const currentWeek = weeklyData[weeklyData.length - 1];
    const previousWeek = weeklyData[weeklyData.length - 2];
    
    // Calculate summary metrics
    const summary = {
      totalBookings: weeklyData.reduce((sum, week) => sum + week.metrics.totalBookings, 0),
      totalRevenue: weeklyData.reduce((sum, week) => sum + week.metrics.totalRevenue, 0),
      averageBookingValue: 0,
      uniqueGuests: weeklyData.reduce((sum, week) => sum + week.metrics.uniqueGuests, 0),
      averageConversionRate: weeklyData.reduce((sum, week) => sum + week.metrics.conversionRate, 0) / weeklyData.length,
      growth: {
        bookings: previousWeek ? calculateGrowth(currentWeek.metrics.totalBookings, previousWeek.metrics.totalBookings) : 0,
        revenue: previousWeek ? calculateGrowth(currentWeek.metrics.totalRevenue, previousWeek.metrics.totalRevenue) : 0,
        conversionRate: previousWeek ? calculateGrowth(currentWeek.metrics.conversionRate, previousWeek.metrics.conversionRate) : 0
      }
    };
    
    summary.averageBookingValue = summary.totalBookings > 0 ? 
      Math.round(summary.totalRevenue / summary.totalBookings) : 0;
    
    // Top performers across all weeks
    const allDestinations: Record<string, number> = {};
    weeklyData.forEach(week => {
      week.metrics.topDestinations.forEach(dest => {
        allDestinations[dest.city] = (allDestinations[dest.city] || 0) + dest.bookings;
      });
    });
    
    const topDestinations = Object.entries(allDestinations)
      .map(([city, bookings]) => ({ city, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    return NextResponse.json({
      status: 'success',
      data: {
        summary,
        weeklyData,
        topDestinations,
        period: {
          start: weeklyData[0]?.periodStart,
          end: weeklyData[weeklyData.length - 1]?.periodEnd,
          weeksCount: weeklyData.length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible',
        currency,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Weekly analytics error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch weekly analytics',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';