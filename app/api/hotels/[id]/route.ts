import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { mockDuffelStaysAPI } from '@/lib/api/mock-duffel-stays';
import { liteAPI } from '@/lib/api/liteapi';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { isDemoHotelId, generateDemoHotelDetails } from '@/lib/utils/demo-hotels';

/**
 * Check if hotel ID is from LiteAPI (starts with 'lp' prefix)
 */
function isLiteAPIHotelId(hotelId: string): boolean {
  return hotelId.startsWith('lp') || hotelId.length <= 10;
}

/**
 * Hotel Details API Route
 *
 * GET /api/hotels/[id]
 *
 * Fetch detailed information about a specific hotel including:
 * - Complete property details
 * - All available rooms and rates
 * - Photos and images
 * - Amenities and facilities
 * - Reviews and ratings
 * - Location and map data
 * - Cancellation policies
 *
 * Response is cached for 30 minutes to reduce API calls.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accommodationId = params.id;

    if (!accommodationId) {
      return NextResponse.json(
        { error: 'Missing accommodation ID' },
        { status: 400 }
      );
    }

    // ✅ EMERGENCY FIX: Handle demo hotel IDs
    // Demo hotels are generated as fallback data when real API fails
    // Format: demo-hotel-{city}-{index}
    if (isDemoHotelId(accommodationId)) {
      console.log(`🏨 [DEMO] Generating demo hotel details for ${accommodationId}`);

      try {
        const demoHotel = generateDemoHotelDetails(accommodationId);

        return NextResponse.json({
          data: demoHotel,
          meta: {
            lastUpdated: new Date().toISOString(),
            source: 'Demo Data',
            isDemoData: true,
            message: 'This is demo data. Configure real APIs for production use.',
          },
        }, {
          headers: {
            'X-Data-Source': 'DEMO',
            'Cache-Control': 'public, max-age=3600', // Cache demo data for 1 hour
          }
        });
      } catch (error: any) {
        console.error(`❌ [DEMO] Failed to generate demo hotel:`, error);
        return NextResponse.json(
          { error: 'Invalid demo hotel ID format' },
          { status: 400 }
        );
      }
    }

    // Check if this is a LiteAPI hotel
    if (isLiteAPIHotelId(accommodationId)) {
      console.log(`🏨 [LITEAPI] Fetching hotel details for ${accommodationId}`);

      // Get query params for rates (optional)
      const searchParams = request.nextUrl.searchParams;
      const checkIn = searchParams.get('checkIn');
      const checkOut = searchParams.get('checkOut');
      const adults = parseInt(searchParams.get('adults') || '2', 10);

      // Generate cache key for LiteAPI (include dates if provided)
      const cacheKey = generateCacheKey('hotels:liteapi:details', {
        id: accommodationId,
        checkIn: checkIn || 'none',
        checkOut: checkOut || 'none',
      });

      // Try to get from cache (30 minutes TTL)
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        console.log(`✅ Returning cached LiteAPI hotel details for ${accommodationId}`);
        return NextResponse.json(cached, {
          headers: {
            'X-Cache-Status': 'HIT',
            'X-API-Source': 'LITEAPI',
            'Cache-Control': 'public, max-age=1800',
          }
        });
      }

      try {
        // Use getEnhancedHotelDetails for comprehensive data including ALL photos
        const enhancedDetails = await liteAPI.getEnhancedHotelDetails(accommodationId);

        // Fallback to basic getHotelDetails if enhanced fails
        const hotelDetails = enhancedDetails || await liteAPI.getHotelDetails({ hotelId: accommodationId });

        if (!hotelDetails) {
          return NextResponse.json(
            { error: 'Hotel not found' },
            { status: 404 }
          );
        }

        // Build images array from LiteAPI response - GET ALL PHOTOS
        const images: Array<{ url: string; caption?: string }> = [];

        // Debug: Log what photo data is available
        console.log(`📸 [DEBUG] Photo sources for ${accommodationId}:`, {
          enhancedHotelPhotos: enhancedDetails?.hotelPhotos?.length || 0,
          hotelImagesFromDetails: hotelDetails.hotelImages?.length || 0,
          hotelPhotosFromDetails: hotelDetails.hotelPhotos?.length || 0,
          imagesArray: hotelDetails.images?.length || 0,
          hasMainPhoto: !!hotelDetails.main_photo,
          hasThumbnail: !!hotelDetails.thumbnail,
        });

        // PRIORITY 1: Use hotelPhotos from enhanced details (parsed from hotelImages)
        if (enhancedDetails?.hotelPhotos && enhancedDetails.hotelPhotos.length > 0) {
          enhancedDetails.hotelPhotos.forEach((photo) => {
            if (photo.url) {
              images.push({
                url: photo.url,
                caption: photo.caption || `${hotelDetails.name}`,
              });
            }
          });
          console.log(`📸 [LITEAPI] Using ${images.length} photos from enhancedDetails.hotelPhotos`);
        }
        // PRIORITY 2: Use hotelImages directly from hotelDetails (official LiteAPI field)
        else if (hotelDetails.hotelImages && Array.isArray(hotelDetails.hotelImages) && hotelDetails.hotelImages.length > 0) {
          // Sort by order and defaultImage
          const sortedImages = [...hotelDetails.hotelImages].sort((a: any, b: any) => {
            if (a.defaultImage && !b.defaultImage) return -1;
            if (!a.defaultImage && b.defaultImage) return 1;
            return (a.order || 0) - (b.order || 0);
          });
          sortedImages.forEach((img: any) => {
            const imageUrl = img.url || img.image;
            if (imageUrl) {
              images.push({
                url: imageUrl,
                caption: img.caption || `${hotelDetails.name}`,
              });
            }
          });
          console.log(`📸 [LITEAPI] Using ${images.length} photos from hotelDetails.hotelImages`);
        }
        // PRIORITY 3: Use hotelPhotos from basic endpoint
        else if (hotelDetails.hotelPhotos && Array.isArray(hotelDetails.hotelPhotos) && hotelDetails.hotelPhotos.length > 0) {
          hotelDetails.hotelPhotos.forEach((photo: any) => {
            const imageUrl = photo.image || photo.url;
            if (imageUrl) {
              images.push({
                url: imageUrl,
                caption: photo.imageCaption || photo.caption || `${hotelDetails.name}`,
              });
            }
          });
          console.log(`📸 [LITEAPI] Using ${images.length} photos from hotelDetails.hotelPhotos`);
        }
        // PRIORITY 4: Use images array from basic endpoint
        else if (hotelDetails.images && Array.isArray(hotelDetails.images) && hotelDetails.images.length > 0) {
          hotelDetails.images.forEach((img: any, index: number) => {
            const imageUrl = typeof img === 'string' ? img : (img.url || img.large || img.medium || img.small || img.image);
            if (imageUrl) {
              images.push({
                url: imageUrl,
                caption: img.caption || img.imageCaption || `${hotelDetails.name} - Photo ${index + 1}`
              });
            }
          });
          console.log(`📸 [LITEAPI] Using ${images.length} photos from hotelDetails.images`);
        }
        // PRIORITY 5: Fallback to main_photo and thumbnail
        else {
          if (hotelDetails.main_photo) {
            images.push({ url: hotelDetails.main_photo, caption: hotelDetails.name });
          }
          if (hotelDetails.thumbnail && hotelDetails.thumbnail !== hotelDetails.main_photo) {
            images.push({ url: hotelDetails.thumbnail, caption: `${hotelDetails.name}` });
          }
          console.log(`📸 [LITEAPI] Using ${images.length} fallback photos (main_photo/thumbnail)`);
        }

        console.log(`📸 [LITEAPI] Total ${images.length} photos for hotel ${accommodationId}`);

        // ============================================================================
        // ENHANCED AMENITIES/FACILITIES EXTRACTION
        // Priority: hotelFacilities (names) > facilities array > facilityIds mapping
        // ============================================================================

        // Get facilities from enhanced details (has actual names!)
        const hotelFacilities = enhancedDetails?.hotelFacilities || enhancedDetails?.facilities || [];

        // Extract amenity names from facilities array (can have id + name)
        let amenities: string[] = [];

        // PRIORITY 1: Use hotelFacilities if available (has actual names)
        if (Array.isArray(hotelFacilities) && hotelFacilities.length > 0) {
          amenities = hotelFacilities.map((f: any) => {
            // Handle different formats: string, {name}, {id, name}
            if (typeof f === 'string') return f;
            if (f.name) return f.name;
            return null;
          }).filter(Boolean);
          console.log(`✅ [AMENITIES] Using ${amenities.length} facilities from hotelFacilities`);
        }

        // PRIORITY 2: Fallback to facilityIds mapping if no names available
        if (amenities.length === 0 && hotelDetails.facilityIds?.length > 0) {
          // Extended facility ID mapping (LiteAPI common IDs)
          const facilityMap: Record<number, string> = {
            1: 'Free WiFi', 2: 'Parking', 3: 'Swimming Pool', 4: 'Fitness Center', 5: 'Restaurant',
            6: 'Bar/Lounge', 7: 'Spa', 8: 'Room Service', 9: 'Air Conditioning', 10: 'Laundry Service',
            11: 'Concierge', 12: 'Business Center', 13: 'Pet Friendly', 14: 'Non-Smoking Rooms',
            15: 'Family Rooms', 16: 'Airport Shuttle', 17: 'Beach Access', 18: 'Golf Course',
            19: 'Tennis Court', 20: 'Kids Club', 21: 'Sauna', 22: 'Hot Tub', 23: 'Casino',
            24: 'Nightclub', 25: 'Meeting Rooms', 26: 'Wheelchair Accessible', 27: '24-Hour Front Desk',
            28: 'Breakfast Included', 29: 'Kitchen', 30: 'Balcony', 31: 'Ocean View', 32: 'City View',
            33: 'Garden', 34: 'Terrace', 35: 'BBQ Facilities', 36: 'Elevator', 37: 'Safe Deposit Box',
            38: 'Luggage Storage', 39: 'Currency Exchange', 40: 'ATM', 41: 'Gift Shop', 42: 'Valet Parking',
            43: 'Electric Vehicle Charging', 44: 'Bicycle Rental', 45: 'Car Rental', 46: 'Tour Desk',
            47: 'Ticket Service', 48: 'Babysitting', 49: 'Dry Cleaning', 50: 'Ironing Service',
          };
          amenities = (hotelDetails.facilityIds || [])
            .map((id: number) => facilityMap[id])
            .filter(Boolean);
          console.log(`✅ [AMENITIES] Using ${amenities.length} facilities from facilityIds mapping`);
        }

        // PRIORITY 3: Check for common amenity fields in hotelDetails
        if (amenities.length === 0) {
          const commonAmenities: string[] = [];
          if (hotelDetails.hasWifi || hotelDetails.wifi) commonAmenities.push('Free WiFi');
          if (hotelDetails.hasParking || hotelDetails.parking) commonAmenities.push('Parking');
          if (hotelDetails.hasPool || hotelDetails.pool) commonAmenities.push('Swimming Pool');
          if (hotelDetails.hasGym || hotelDetails.gym) commonAmenities.push('Fitness Center');
          if (hotelDetails.hasRestaurant || hotelDetails.restaurant) commonAmenities.push('Restaurant');
          if (hotelDetails.hasSpa || hotelDetails.spa) commonAmenities.push('Spa');
          if (hotelDetails.hasBar || hotelDetails.bar) commonAmenities.push('Bar/Lounge');
          if (hotelDetails.airConditioning || hotelDetails.ac) commonAmenities.push('Air Conditioning');
          if (hotelDetails.roomService) commonAmenities.push('Room Service');
          if (hotelDetails.petFriendly) commonAmenities.push('Pet Friendly');
          if (commonAmenities.length > 0) {
            amenities = commonAmenities;
            console.log(`✅ [AMENITIES] Using ${amenities.length} common amenity fields`);
          }
        }

        console.log(`📋 [LITEAPI] Final amenities count: ${amenities.length}`);

        // Strip HTML tags from description
        const stripHtml = (html: string): string => {
          return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        // Extract check-in/out times from enhanced details
        const checkInTime = enhancedDetails?.checkinCheckoutTimes?.checkin || hotelDetails.checkInTime || '15:00';
        const checkOutTime = enhancedDetails?.checkinCheckoutTimes?.checkout || hotelDetails.checkOutTime || '11:00';

        // Get hotel important information from enhanced details
        const hotelImportantInfo = enhancedDetails?.hotelImportantInformation || hotelDetails.hotelImportantInformation;

        // Format response to match expected structure for ClientPage
        const formattedResponse = {
          data: {
            id: hotelDetails.id || accommodationId,
            name: hotelDetails.name,
            description: stripHtml(hotelDetails.hotelDescription || ''),
            address: {
              street: hotelDetails.address || '',
              city: hotelDetails.city || '',
              country: hotelDetails.country || '',
              lat: hotelDetails.latitude,
              lng: hotelDetails.longitude,
            },
            location: {
              lat: hotelDetails.latitude,
              lng: hotelDetails.longitude,
            },
            starRating: hotelDetails.stars || 0,
            star_rating: hotelDetails.stars || 0, // Alternate format
            reviewRating: hotelDetails.rating || 0,
            reviewCount: hotelDetails.reviewCount || 0,
            images: images,
            photos: images.map(img => img.url), // Alternate format
            totalPhotos: images.length, // Photo count for gallery UI
            amenities: amenities,
            facilities: hotelDetails.facilityIds || [],
            hotelFacilities: hotelFacilities,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            // CRITICAL: Add checkIn/checkOut dates for nights calculation
            checkIn: checkIn || null,
            checkOut: checkOut || null,
            chain: hotelDetails.chain,
            // Important information from enhanced API
            hotelImportantInformation: Array.isArray(hotelImportantInfo)
              ? hotelImportantInfo.join('\n')
              : hotelImportantInfo || '',
            source: 'LiteAPI',
            // Room rates - fetch if dates provided
            rates: [] as any[],
          },
          meta: {
            lastUpdated: new Date().toISOString(),
            source: 'LiteAPI',
            photoCount: images.length,
          },
        };

        // Fetch rates if check-in/check-out dates provided
        if (checkIn && checkOut) {
          try {
            console.log(`🏨 [LITEAPI] Fetching rates for ${accommodationId} (${checkIn} - ${checkOut})`);
            const ratesData = await liteAPI.getHotelRates({
              hotelIds: [accommodationId],
              checkin: checkIn,
              checkout: checkOut,
              occupancies: [{ adults }],
              currency: 'USD',
              guestNationality: 'US',
            });

            // Transform rates to match expected format - GROUP BY UNIQUE ROOM TYPE
            if (ratesData && ratesData.length > 0) {
              const hotelRates = ratesData[0];

              // Group rates by room type name to avoid duplicates
              const roomTypeMap = new Map<string, {
                rates: any[];
                lowestPrice: number;
                currency: string;
                hasRefundable: boolean;
                hasBreakfast: boolean;
                maxOccupancy: number;
                offerId: string;
                bestRate: any;
              }>();

              // First pass: collect all rates by room type name
              for (const roomType of hotelRates.roomTypes || []) {
                for (const rate of roomType.rates || []) {
                  const roomName = rate.name || 'Standard Room';
                  const price = rate.retailRate?.total?.[0]?.amount || 0;
                  const currency = rate.retailRate?.total?.[0]?.currency || 'USD';
                  const isRefundable = rate.cancellationPolicies?.refundableTag === 'RFN';
                  const hasBreakfast = rate.boardType === 'BB' || rate.boardName?.toLowerCase().includes('breakfast');

                  if (!roomTypeMap.has(roomName)) {
                    roomTypeMap.set(roomName, {
                      rates: [],
                      lowestPrice: price,
                      currency: currency,
                      hasRefundable: isRefundable,
                      hasBreakfast: hasBreakfast,
                      maxOccupancy: rate.maxOccupancy || 2,
                      offerId: roomType.offerId,
                      bestRate: rate,
                    });
                  }

                  const existing = roomTypeMap.get(roomName)!;
                  existing.rates.push(rate);

                  // Update with best values
                  if (price < existing.lowestPrice) {
                    existing.lowestPrice = price;
                    existing.bestRate = rate;
                  }
                  if (isRefundable) existing.hasRefundable = true;
                  if (hasBreakfast) existing.hasBreakfast = true;
                  if (rate.maxOccupancy > existing.maxOccupancy) {
                    existing.maxOccupancy = rate.maxOccupancy;
                  }
                }
              }

              // Extract bed type from room name
              const extractBedType = (name: string): string => {
                const nameLower = name.toLowerCase();
                if (nameLower.includes('king')) return 'King Bed';
                if (nameLower.includes('queen')) return 'Queen Bed';
                if (nameLower.includes('twin')) return 'Twin Beds';
                if (nameLower.includes('double')) return 'Double Bed';
                if (nameLower.includes('single')) return 'Single Bed';
                if (nameLower.includes('suite')) return 'Suite';
                if (nameLower.includes('studio')) return 'Studio';
                return 'Standard Bed';
              };

              // Use hotel images for rooms (since LiteAPI doesn't provide room-level images)
              let imageIndex = 1;
              const rates: any[] = [];

              // Convert grouped rooms to rates array
              for (const [roomName, roomData] of roomTypeMap) {
                // Assign images in round-robin fashion
                const roomImages = [];
                if (images.length > 1) {
                  const currentImageIndex = (imageIndex % (images.length - 1)) + 1;
                  roomImages.push(images[currentImageIndex]);
                  imageIndex++;
                }

                rates.push({
                  id: roomData.bestRate.rateId,
                  offerId: roomData.offerId,
                  roomName: roomName,
                  name: roomName,
                  bedType: extractBedType(roomName),
                  maxGuests: roomData.maxOccupancy,
                  totalPrice: {
                    amount: String(roomData.lowestPrice),
                    currency: roomData.currency,
                  },
                  refundable: roomData.hasRefundable,
                  breakfastIncluded: roomData.hasBreakfast,
                  amenities: [],
                  images: roomImages,
                  // Include all rate options for user selection
                  rateOptions: roomData.rates.length,
                  allRates: roomData.rates.map(r => ({
                    rateId: r.rateId,
                    price: r.retailRate?.total?.[0]?.amount || 0,
                    boardType: r.boardType,
                    boardName: r.boardName,
                    refundable: r.cancellationPolicies?.refundableTag === 'RFN',
                  })),
                });
              }

              // Sort by price (lowest first)
              rates.sort((a, b) => parseFloat(a.totalPrice.amount) - parseFloat(b.totalPrice.amount));

              formattedResponse.data.rates = rates;
              console.log(`✅ [LITEAPI] Found ${rates.length} unique room types (from ${hotelRates.roomTypes?.length || 0} total)`);
            }
          } catch (ratesError) {
            console.error('⚠️ [LITEAPI] Failed to fetch rates:', ratesError);
            // Continue without rates - basic info is still useful
          }
        }

        // Store in cache (30 minutes TTL)
        await setCache(cacheKey, formattedResponse, 1800);

        return NextResponse.json(formattedResponse, {
          headers: {
            'X-Cache-Status': 'MISS',
            'X-API-Source': 'LITEAPI',
            'Cache-Control': 'public, max-age=1800',
          }
        });
      } catch (error: any) {
        console.error('❌ LiteAPI hotel details error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to fetch hotel details from LiteAPI' },
          { status: 500 }
        );
      }
    }

    // Fallback to Duffel Stays API for non-LiteAPI hotels
    // Generate cache key
    const cacheKey = generateCacheKey('hotels:duffel:details', { id: accommodationId });

    // Try to get from cache (30 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached hotel details for ${accommodationId}`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=1800', // 30 minutes
        }
      });
    }

    // Choose API based on USE_MOCK_HOTELS environment variable
    const USE_MOCK_HOTELS = process.env.USE_MOCK_HOTELS === 'true';
    const hotelAPI = USE_MOCK_HOTELS ? mockDuffelStaysAPI : duffelStaysAPI;

    // Fetch accommodation details from selected API
    console.log(`🏨 Fetching hotel details for ${accommodationId}... (${USE_MOCK_HOTELS ? 'MOCK' : 'Duffel Stays'} API)`);
    const accommodation = await hotelAPI.getAccommodation(accommodationId);

    const response = {
      data: accommodation.data,
      meta: {
        lastUpdated: new Date().toISOString(),
        source: USE_MOCK_HOTELS ? 'Mock Data' : 'Duffel Stays',
      },
    };

    // Store in cache (30 minutes TTL)
    await setCache(cacheKey, response, 1800);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=1800',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel details error:', error);

    // Handle specific errors
    if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch hotel details',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs
// export const runtime = 'edge';
