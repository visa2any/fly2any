import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * GET /api/hotels/types
 * Get list of all hotel types (Resort, Boutique, Business Hotel, etc.)
 * Used for advanced search filtering by property type
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Getting hotel types');

    // Get types from LiteAPI
    const types = await liteAPI.getHotelTypes();

    console.log(`✅ API: Returning ${types.length} hotel types`);

    return NextResponse.json({
      success: true,
      data: types,
      meta: {
        count: types.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ API: Error getting hotel types:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hotel types',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
