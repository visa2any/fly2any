// Stream Hotel Rates API - Server-Sent Events (SSE)
// Real-time streaming of hotel rates as they're found
import { NextRequest } from 'next/server';

const LITEAPI_BASE_URL = 'https://api.liteapi.travel/v3.0';
const LITEAPI_KEY = process.env.LITEAPI_PUBLIC_KEY || process.env.LITEAPI_SANDBOX_PUBLIC_KEY || '';

interface StreamedHotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stars: number;
  rating: number;
  reviewCount: number;
  image: string;
  thumbnail: string;
  lowestPrice: number;
  lowestPricePerNight: number;
  currency: string;
  amenities: string[];
  refundable: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const adults = searchParams.get('adults') || '2';
  const children = searchParams.get('children') || '0';
  const currency = searchParams.get('currency') || 'USD';
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!latitude || !longitude || !checkin || !checkout) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Calculate nights
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const nights = Math.max(1, Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Searching hotels...' })}\n\n`));

        // Step 1: Get hotel static data
        console.log('🔍 Stream: Getting hotels by location...');
        const hotelsResponse = await fetch(
          `${LITEAPI_BASE_URL}/data/hotels?latitude=${latitude}&longitude=${longitude}&radius=25000&limit=${limit}`,
          {
            headers: {
              'X-API-Key': LITEAPI_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!hotelsResponse.ok) {
          throw new Error('Failed to fetch hotels');
        }

        const hotelsData = await hotelsResponse.json();
        const hotels = hotelsData.data || [];
        const hotelIds = hotels.filter((h: any) => !h.deletedAt).map((h: any) => h.id);

        if (hotelIds.length === 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', total: 0 })}\n\n`));
          controller.close();
          return;
        }

        // Send progress update
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: `Found ${hotelIds.length} hotels, fetching rates...`, total: hotelIds.length })}\n\n`));

        // Create hotel map for quick lookup
        const hotelMap = new Map(hotels.map((h: any) => [h.id, h]));

        // Step 2: Fetch rates in batches and stream results
        const BATCH_SIZE = 15;
        let processedCount = 0;
        let availableCount = 0;

        for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) {
          const batchIds = hotelIds.slice(i, i + BATCH_SIZE);

          try {
            // Prepare occupancies
            const childrenCount = parseInt(children);
            const occupancies = [{
              adults: parseInt(adults),
              ...(childrenCount > 0 && { children: Array(childrenCount).fill(10) })
            }];

            const ratesResponse = await fetch(`${LITEAPI_BASE_URL}/hotels/rates`, {
              method: 'POST',
              headers: {
                'X-API-Key': LITEAPI_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                hotelIds: batchIds,
                checkin,
                checkout,
                occupancies,
                currency,
                guestNationality: 'US',
                timeout: 5,
                roomMapping: true,
              }),
            });

            if (ratesResponse.ok) {
              const ratesData = await ratesResponse.json();
              const rates = ratesData.data || [];

              // Stream each hotel with rate
              for (const rateData of rates) {
                const hotelInfo = hotelMap.get(rateData.hotelId) as any;
                if (!hotelInfo || !rateData.roomTypes?.length) continue;

                // Find lowest price
                let lowestPrice = Infinity;
                let isRefundable = false;

                for (const roomType of rateData.roomTypes) {
                  const price = roomType.offerRetailRate?.amount;
                  if (price && price < lowestPrice) {
                    lowestPrice = price;
                  }
                  // Check if any rate is refundable
                  for (const rate of roomType.rates || []) {
                    if (rate.cancellationPolicies?.refundableTag === 'RFN') {
                      isRefundable = true;
                      break;
                    }
                  }
                }

                if (lowestPrice === Infinity) continue;

                const hotel: StreamedHotel = {
                  id: hotelInfo.id,
                  name: hotelInfo.name,
                  address: hotelInfo.address,
                  city: hotelInfo.city,
                  country: hotelInfo.country,
                  latitude: hotelInfo.latitude,
                  longitude: hotelInfo.longitude,
                  stars: hotelInfo.stars || 0,
                  rating: hotelInfo.rating || 0,
                  reviewCount: hotelInfo.reviewCount || 0,
                  image: hotelInfo.main_photo || '',
                  thumbnail: hotelInfo.thumbnail || hotelInfo.main_photo || '',
                  lowestPrice,
                  lowestPricePerNight: lowestPrice / nights,
                  currency,
                  amenities: [], // Will be populated separately if needed
                  refundable: isRefundable,
                };

                availableCount++;

                // Stream the hotel data
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'hotel', data: hotel })}\n\n`));
              }
            }
          } catch (batchError) {
            console.error(`Batch error:`, batchError);
            // Continue to next batch
          }

          processedCount += batchIds.length;

          // Send progress update
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            processed: processedCount,
            available: availableCount,
            total: hotelIds.length,
            percentage: Math.round((processedCount / hotelIds.length) * 100)
          })}\n\n`));

          // Small delay between batches
          if (i + BATCH_SIZE < hotelIds.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Send completion message
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'complete',
          total: availableCount,
          processed: processedCount,
          message: `Found ${availableCount} hotels with availability`
        })}\n\n`));

      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Search failed'
        })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
