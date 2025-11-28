import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * GET /api/hotels/currencies
 * Get list of all supported currencies
 * Used for multi-currency pricing and conversion
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Getting currencies');

    // Get currencies from LiteAPI
    const currencies = await liteAPI.getCurrencies();

    console.log(`✅ API: Returning ${currencies.length} currencies`);

    return NextResponse.json({
      success: true,
      data: currencies,
      meta: {
        count: currencies.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ API: Error getting currencies:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch currencies',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
