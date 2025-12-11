import { NextRequest, NextResponse } from 'next/server';
import { airlineDataService, type AirlineSearchParams } from '@/lib/airlines/airline-data-service';
import { requireAdmin } from '@/lib/admin/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fly2Any Airline API
 * GET /api/airlines - Search and list airlines
 *
 * Query Parameters:
 * - query: Search term (name, IATA code)
 * - alliance: Filter by alliance (star_alliance, oneworld, skyteam)
 * - country: Filter by country code
 * - type: Filter by airline type (FSC, LCC, ULCC, HYBRID, REGIONAL)
 * - hasWifi: Filter by WiFi availability
 * - hasPremiumEconomy: Filter by premium economy
 * - limit: Results per page (default: 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: AirlineSearchParams = {
      query: searchParams.get('query') || undefined,
      alliance: searchParams.get('alliance') || undefined,
      country: searchParams.get('country') || undefined,
      type: searchParams.get('type') || undefined,
      hasWifi: searchParams.get('hasWifi') === 'true' ? true :
               searchParams.get('hasWifi') === 'false' ? false : undefined,
      hasPremiumEconomy: searchParams.get('hasPremiumEconomy') === 'true' ? true :
                         searchParams.get('hasPremiumEconomy') === 'false' ? false : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await airlineDataService.search(params);

    return NextResponse.json({
      success: true,
      airlines: result.airlines,
      pagination: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: (params.offset || 0) + (params.limit || 50) < result.total,
      },
    });
  } catch (error: any) {
    console.error('Error searching airlines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search airlines' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/airlines - Admin operations
 *
 * Body:
 * - action: 'sync_static' | 'sync_all' | 'upsert'
 * - data: Airline data (for upsert)
 */
export async function POST(request: NextRequest) {
  // Require admin for write operations
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'sync_static': {
        const result = await airlineDataService.syncStatic();
        return NextResponse.json({
          success: true,
          action: 'sync_static',
          result,
        });
      }

      case 'upsert': {
        if (!data?.iataCode || !data?.name) {
          return NextResponse.json(
            { success: false, error: 'iataCode and name are required' },
            { status: 400 }
          );
        }
        const airline = await airlineDataService.upsert(data);
        return NextResponse.json({
          success: true,
          action: 'upsert',
          airline,
        });
      }

      case 'bulk_upsert': {
        if (!Array.isArray(data)) {
          return NextResponse.json(
            { success: false, error: 'data must be an array of airlines' },
            { status: 400 }
          );
        }
        const result = await airlineDataService.bulkUpsert(data);
        return NextResponse.json({
          success: true,
          action: 'bulk_upsert',
          result,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in airline POST:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}
