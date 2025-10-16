import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

export async function GET(
  request: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const { hotelId } = params;
    const searchParams = request.nextUrl.searchParams;

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    const currency = searchParams.get('currency') || 'USD';

    const results = await liteAPI.getHotelDetails({ hotelId, currency });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Hotel details error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get hotel details' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
