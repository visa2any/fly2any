import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';

/**
 * POST /api/orders/modify/offers
 * Get available modification offers for a change request
 *
 * Supports Duffel bookings only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changeRequestId } = body;

    if (!changeRequestId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: changeRequestId',
            code: 'MISSING_FIELDS',
          },
        },
        { status: 400 }
      );
    }

    console.log(`Fetching change offers for request: ${changeRequestId}`);

    try {
      const offersResponse = await duffelAPI.getOrderChangeOffers(changeRequestId);

      // Transform Duffel offers to our format
      const transformedOffers = offersResponse.data.map((offer: any) => ({
        changeRequestId: changeRequestId,
        offerId: offer.id,
        changeFee: parseFloat(offer.change_total_amount || '0'),
        priceDifference: parseFloat(offer.new_total_amount || '0') - parseFloat(offer.penalty_amount || '0'),
        totalCost: parseFloat(offer.change_total_amount || '0'),
        currency: offer.change_total_currency || 'USD',
        newFlight: offer.slices ? {
          segments: offer.slices.flatMap((slice: any) =>
            slice.segments.map((segment: any) => ({
              departure: {
                iataCode: segment.origin.iata_code,
                terminal: segment.origin.terminal,
                at: segment.departing_at,
              },
              arrival: {
                iataCode: segment.destination.iata_code,
                terminal: segment.destination.terminal,
                at: segment.arriving_at,
              },
              carrierCode: segment.marketing_carrier.iata_code,
              flightNumber: segment.marketing_carrier_flight_number,
              aircraft: segment.aircraft?.iata_code,
              duration: segment.duration,
              class: segment.passengers?.[0]?.cabin_class || 'economy',
            }))
          ),
        } : undefined,
        expiresAt: offer.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        restrictions: offer.conditions?.change_before_departure ?
          [`Must be changed before ${offer.conditions.change_before_departure.allowed_time_before_departure}`]
          : undefined,
      }));

      return NextResponse.json({
        success: true,
        data: transformedOffers,
        meta: {
          timestamp: new Date().toISOString(),
          count: transformedOffers.length,
          source: 'Duffel',
        },
      });
    } catch (error: any) {
      console.error('Error fetching change offers:', error);

      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Change request not found or has expired',
              code: 'REQUEST_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Error getting modification offers:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to get modification offers',
          code: 'MODIFICATION_OFFERS_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
