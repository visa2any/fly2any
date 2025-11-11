import { NextRequest, NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/db/prisma';

// Force Node.js runtime for database access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Dashboard Statistics
 * GET /api/admin/stats?period=week|month|year|all
 *
 * Returns aggregated statistics for the admin dashboard
 * - Bookings (total, confirmed, pending, cancelled, revenue)
 * - Users (total, active, new registrations)
 * - Searches (total by service type)
 * - Conversion rates
 * - Average booking value
 * - Time-based trends
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, year, all

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Mock data for now - replace with real database queries when Prisma models are ready
    const stats = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },

      // Bookings metrics
      bookings: {
        total: 1247,
        confirmed: 1098,
        pending: 42,
        cancelled: 107,
        revenue: 524780,
        averageValue: 421,
        change: 12.4, // % change from previous period
        byStatus: {
          confirmed: 1098,
          pending: 42,
          payment_pending: 24,
          cancelled: 83,
          failed: 24,
        },
      },

      // Users metrics
      users: {
        total: 5847,
        active: 3421,
        new: 284,
        change: 15.7,
        registrationsByDay: generateDailyData(7, 30, 50),
      },

      // Searches metrics
      searches: {
        total: 12458,
        flights: 8234,
        hotels: 3124,
        cars: 1100,
        conversion: 10.01, // %
        change: 22.3,
      },

      // Revenue metrics
      revenue: {
        total: 524780,
        thisMonth: 124580,
        lastMonth: 108920,
        change: 14.4,
        byDay: generateRevenueData(30),
        averageBookingValue: 421,
      },

      // Conversion metrics
      conversion: {
        overall: 10.01,
        flights: 12.3,
        hotels: 8.5,
        cars: 6.2,
      },

      // Top routes
      topRoutes: [
        { from: 'JFK', to: 'LAX', count: 124, revenue: 52400 },
        { from: 'LAX', to: 'SFO', count: 98, revenue: 29400 },
        { from: 'ORD', to: 'MIA', count: 87, revenue: 43500 },
        { from: 'ATL', to: 'DEN', count: 76, revenue: 34200 },
        { from: 'DFW', to: 'PHX', count: 65, revenue: 29250 },
        { from: 'SEA', to: 'LAX', count: 58, revenue: 26100 },
        { from: 'BOS', to: 'SFO', count: 52, revenue: 28600 },
        { from: 'SFO', to: 'JFK', count: 49, revenue: 29400 },
        { from: 'LAX', to: 'LAS', count: 47, revenue: 14100 },
        { from: 'MIA', to: 'JFK', count: 44, revenue: 22000 },
      ],

      // System health
      system: {
        apiResponseTime: {
          p50: 245,
          p95: 580,
          p99: 1200,
        },
        errorRate: 0.42, // %
        cacheHitRate: 78.5,
        activeSessions: 342,
        uptime: 99.96,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Error fetching admin stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to generate daily data
function generateDailyData(days: number, min: number, max: number): Array<{ date: string; count: number }> {
  const data: Array<{ date: string; count: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const count = Math.floor(Math.random() * (max - min + 1)) + min;

    data.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }

  return data;
}

// Helper function to generate revenue data
function generateRevenueData(days: number): Array<{ date: string; amount: number }> {
  const data: Array<{ date: string; amount: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 15000) + 5000;

    data.push({
      date: date.toISOString().split('T')[0],
      amount,
    });
  }

  return data;
}
