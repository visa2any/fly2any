import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { applyFlightMarkup } from '@/lib/config/flight-markup';

// Maximum parallel requests to Amadeus to avoid rate limits
const MAX_PARALLEL_REQUESTS = 10;

/**
 * POST /api/flights/upselling/batch
 * Batch version of upselling API - fetches fare families for multiple flights in parallel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffers, isAgent = false } = body;

    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: flightOffers (array)' },
        { status: 400 }
      );
    }

    console.log(`🎫 Batch fetching fare families for ${flightOffers.length} flights... (Agent: ${isAgent})`);

    // Process in chunks to avoid overwhelming Amadeus or hitting rate limits
    const results: Record<string, any[]> = {};
    
    // Helper function to process a single flight
    const processFlight = async (flightOffer: any) => {
      try {
        const flightId = flightOffer.id;
        // Call Amadeus Upselling API
        const response = await amadeusAPI.getUpsellingFares(flightOffer);
        const fareOptions = response.data || [];

        // Apply markup to all fares
        const markedUpFares = fareOptions.map((fare: any) => {
          const netPrice = parseFloat(String(fare.price?.total || '0'));
          const source = fare.source?.toLowerCase() || flightOffer.source?.toLowerCase() || 'unknown';

          // Skip markup for consolidator flights
          if (source === 'consolidator') return fare;

          let markupAmount: number;
          let finalPrice: number;

          if (isAgent) {
            // AGENT PRICING: Reverse public 7% markup, then apply agent 3.5% markup
            const publicPrice = netPrice; 
            const apiNetPrice = publicPrice / 1.07;
            markupAmount = Math.max(15, apiNetPrice * 0.035);
            finalPrice = apiNetPrice + markupAmount;
          } else {
            // CUSTOMER PRICING: Apply standard markup
            const markupResult = applyFlightMarkup(netPrice);
            finalPrice = markupResult.customerPrice;
          }

          // Update fare price
          return {
            ...fare,
            price: {
              ...fare.price,
              total: finalPrice.toString(),
              grandTotal: finalPrice.toString(),
            },
            travelerPricings: fare.travelerPricings?.map((tp: any) => ({
              ...tp,
              price: {
                ...tp.price,
                total: finalPrice.toString(),
              },
            })),
          };
        });

        return { flightId, fares: markedUpFares };
      } catch (err) {
        console.error(`❌ Error fetching upselling for flight ${flightOffer.id}:`, err);
        return { flightId: flightOffer.id, fares: [] };
      }
    };

    // Execute in parallel with limit
    // For simplicity in this implementation, we'll use Promise.all since 10-20 flights is reasonable
    // IF list is huge, we should chunk it. Assuming search results page size is ~10-20.
    const promises = flightOffers.map(processFlight);
    const processed = await Promise.all(promises);

    processed.forEach(item => {
      if (item && item.fares.length > 0) {
        results[item.flightId] = item.fares;
      }
    });

    console.log(`✅ Batch processed ${Object.keys(results).length}/${flightOffers.length} flights successfully`);

    return NextResponse.json({
      success: true,
      results // Map of flightId -> fareOptions[]
    });

  } catch (error: any) {
    console.error('❌ Batch Upselling API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
