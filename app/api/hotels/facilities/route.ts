import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * GET /api/hotels/facilities
 * Get list of all hotel facilities/amenities
 * Used for advanced search filtering by amenities (Pool, Gym, WiFi, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Getting hotel facilities');

    // Get facilities from LiteAPI
    const result = await liteAPI.getFacilities();
    const facilities = result.data;

    console.log(`✅ API: Returning ${facilities.length} facilities`);

    return NextResponse.json({
      success: true,
      data: facilities,
      meta: {
        count: facilities.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ API: Error getting facilities:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch facilities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
