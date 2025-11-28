import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * GET /api/hotels/chains
 * Get list of all hotel chains (Marriott, Hilton, etc.)
 * Used for advanced search filtering by brand
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Getting hotel chains');

    // Get chains from LiteAPI
    const chains = await liteAPI.getHotelChains();

    console.log(`✅ API: Returning ${chains.length} hotel chains`);

    return NextResponse.json({
      success: true,
      data: chains,
      meta: {
        count: chains.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ API: Error getting hotel chains:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hotel chains',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
