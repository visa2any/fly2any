import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Admin API - Analytics Data
 * GET /api/admin/analytics?type=bookings|revenue|routes|devices&period=7d|30d|90d|1y
 *
 * Returns chart data for analytics dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'bookings';
    const period = searchParams.get('period') || '30d';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('📊 Fetching analytics data:', { type, period, startDate, endDate });

    let data;

    switch (type) {
      case 'bookings':
        data = generateBookingsData(period);
        break;
      case 'revenue':
        data = generateRevenueData(period);
        break;
      case 'routes':
        data = generateRoutesData();
        break;
      case 'devices':
        data = generateDevicesData();
        break;
      case 'status':
        data = generateStatusData();
        break;
      case 'cabinClass':
        data = generateCabinClassData();
        break;
      case 'airlines':
        data = generateAirlinesData();
        break;
      case 'conversion':
        data = generateConversionFunnelData();
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid analytics type',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      period,
      data,
    });
  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper functions to generate mock analytics data

function generateBookingsData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      bookings: Math.floor(Math.random() * 50) + 20,
      confirmed: Math.floor(Math.random() * 40) + 15,
      pending: Math.floor(Math.random() * 10) + 2,
      cancelled: Math.floor(Math.random() * 5) + 1,
    });
  }

  return data;
}

function generateRevenueData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 15000) + 5000,
    });
  }

  return data;
}

function generateRoutesData() {
  return [
    { route: 'JFK → LAX', bookings: 124, revenue: 52400 },
    { route: 'LAX → SFO', bookings: 98, revenue: 29400 },
    { route: 'ORD → MIA', bookings: 87, revenue: 43500 },
    { route: 'ATL → DEN', bookings: 76, revenue: 34200 },
    { route: 'DFW → PHX', bookings: 65, revenue: 29250 },
    { route: 'SEA → LAX', bookings: 58, revenue: 26100 },
    { route: 'BOS → SFO', bookings: 52, revenue: 28600 },
    { route: 'SFO → JFK', bookings: 49, revenue: 29400 },
    { route: 'LAX → LAS', bookings: 47, revenue: 14100 },
    { route: 'MIA → JFK', bookings: 44, revenue: 22000 },
  ];
}

function generateDevicesData() {
  return [
    { device: 'Desktop', users: 3542, percentage: 45.2 },
    { device: 'Mobile', users: 3124, percentage: 39.8 },
    { device: 'Tablet', users: 1178, percentage: 15.0 },
  ];
}

function generateStatusData() {
  return [
    { status: 'Confirmed', count: 1098, percentage: 88.0 },
    { status: 'Pending', count: 42, percentage: 3.4 },
    { status: 'Payment Pending', count: 24, percentage: 1.9 },
    { status: 'Cancelled', count: 83, percentage: 6.7 },
  ];
}

function generateCabinClassData() {
  return [
    { class: 'Economy', bookings: 845, revenue: 254000, avgPrice: 300 },
    { class: 'Premium Economy', bookings: 234, revenue: 140400, avgPrice: 600 },
    { class: 'Business', bookings: 142, revenue: 284000, avgPrice: 2000 },
    { class: 'First Class', bookings: 26, revenue: 104000, avgPrice: 4000 },
  ];
}

function generateAirlinesData() {
  return [
    { airline: 'American Airlines', bookings: 284, revenue: 142000 },
    { airline: 'Delta Air Lines', bookings: 256, revenue: 153600 },
    { airline: 'United Airlines', bookings: 234, revenue: 140400 },
    { airline: 'Southwest Airlines', bookings: 198, revenue: 79200 },
    { airline: 'JetBlue Airways', bookings: 142, revenue: 71000 },
    { airline: 'Alaska Airlines', bookings: 98, revenue: 58800 },
    { airline: 'Spirit Airlines', bookings: 87, revenue: 34800 },
    { airline: 'Frontier Airlines', bookings: 76, revenue: 30400 },
  ];
}

function generateConversionFunnelData() {
  return [
    { stage: 'Visits', count: 12458, percentage: 100 },
    { stage: 'Searches', count: 8234, percentage: 66.1 },
    { stage: 'Results Viewed', count: 5678, percentage: 45.6 },
    { stage: 'Flight Selected', count: 2345, percentage: 18.8 },
    { stage: 'Checkout Started', count: 1456, percentage: 11.7 },
    { stage: 'Payment Completed', count: 1247, percentage: 10.0 },
  ];
}
