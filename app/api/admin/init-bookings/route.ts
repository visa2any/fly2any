import { NextResponse } from 'next/server';
import { initBookingsTables, checkBookingsTable } from '@/lib/db/init-bookings';

/**
 * Initialize bookings database tables
 */
export async function POST() {
  try {
    await initBookingsTables();
    const status = await checkBookingsTable();

    return NextResponse.json({
      message: 'Bookings tables initialized successfully',
      status,
    });
  } catch (error: any) {
    console.error('Bookings initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize bookings tables' },
      { status: 500 }
    );
  }
}

/**
 * Check bookings table status
 */
export async function GET() {
  try {
    const status = await checkBookingsTable();

    return NextResponse.json({
      ...status,
    });
  } catch (error: any) {
    console.error('Bookings table check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check bookings table' },
      { status: 500 }
    );
  }
}
