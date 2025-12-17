import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { amadeus } from '@/lib/api/amadeus';

export const dynamic = 'force-dynamic';

// Transfer type icons and display info
const TRANSFER_TYPE_INFO: Record<string, { name: string; icon: string; category: string }> = {
  'PRIVATE': { name: 'Private Transfer', icon: '🚗', category: 'private' },
  'SHARED': { name: 'Shared Shuttle', icon: '🚐', category: 'shared' },
  'TAXI': { name: 'Taxi', icon: '🚕', category: 'taxi' },
  'HOURLY': { name: 'Hourly Service', icon: '⏰', category: 'hourly' },
  'AIRPORT_EXPRESS': { name: 'Airport Express', icon: '🚄', category: 'express' },
  'AIRPORT_BUS': { name: 'Airport Bus', icon: '🚌', category: 'bus' },
  'HELICOPTER': { name: 'Helicopter', icon: '🚁', category: 'luxury' },
  'PRIVATE_JET': { name: 'Private Jet', icon: '✈️', category: 'luxury' },
};

// Vehicle category display info
const VEHICLE_CATEGORY_INFO: Record<string, { name: string; icon: string }> = {
  'STANDARD': { name: 'Standard Sedan', icon: '🚗' },
  'ECONOMY': { name: 'Economy', icon: '🚗' },
  'BUSINESS': { name: 'Business Class', icon: '🚙' },
  'FIRST': { name: 'First Class', icon: '🚘' },
  'LUXURY': { name: 'Luxury', icon: '✨' },
  'SUV': { name: 'SUV', icon: '🚙' },
  'VAN': { name: 'Van', icon: '🚐' },
  'MINIBUS': { name: 'Minibus', icon: '🚐' },
  'BUS': { name: 'Bus', icon: '🚌' },
  'LIMOUSINE': { name: 'Limousine', icon: '🚘' },
};

/**
 * Normalize Amadeus transfer offer to our frontend format
 */
function normalizeTransferOffer(offer: any, markup: number) {
  const transferType = offer.transferType || 'PRIVATE';
  const typeInfo = TRANSFER_TYPE_INFO[transferType] || { name: transferType, icon: '🚗', category: 'private' };

  // Vehicle info
  const vehicle = offer.vehicle || {};
  const vehicleCategory = vehicle.category || 'STANDARD';
  const vehicleInfo = VEHICLE_CATEGORY_INFO[vehicleCategory] || { name: vehicleCategory, icon: '🚗' };

  // Price calculation with markup ($35 or 35% whichever is higher)
  const quotation = offer.quotation || {};
  const basePrice = parseFloat(quotation.monetaryAmount || '0');
  const markupAmount = Math.max(35, basePrice * 0.35);
  const finalPrice = basePrice + markupAmount;

  // Service provider
  const serviceProvider = offer.serviceProvider || {};

  // Cancellation info
  const cancellationRules = offer.cancellationRules || [];
  const freeCancellation = cancellationRules.some((rule: any) =>
    rule.feeType === 'FREE' || rule.feePercent === '0' || rule.feeAmount === '0'
  );

  // Distance and duration
  const distance = offer.distance || {};
  const estimatedDuration = distance.estimatedDuration
    ? `${Math.round(parseInt(distance.estimatedDuration) / 60)} min`
    : null;

  // Features from extra services
  const extraServices = offer.extraServices || [];
  const features = extraServices.map((s: any) => s.description || s.type).filter(Boolean);

  // Default features based on category
  if (features.length === 0) {
    if (typeInfo.category === 'private' || typeInfo.category === 'luxury') {
      features.push('Meet & Greet', 'Flight Tracking');
    }
    if (typeInfo.category === 'luxury') {
      features.push('WiFi', 'Complimentary Water');
    }
    if (freeCancellation) {
      features.push('Free Cancellation');
    }
  }

  return {
    id: offer.id || `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    offerId: offer.id, // Store original Amadeus offer ID for booking
    type: transferType.toLowerCase().replace('_', '-'),
    name: `${vehicleInfo.name} ${typeInfo.name}`,
    icon: vehicleInfo.icon,
    category: typeInfo.category,
    transferType: typeInfo.name,

    // Vehicle details
    vehicle: {
      category: vehicleCategory,
      name: vehicleInfo.name,
      description: vehicle.description || null,
      seats: vehicle.seats || null,
      baggageQuantity: vehicle.baggageQuantity || null,
      imageURL: vehicle.imageURL || null,
    },

    // Location details
    start: {
      dateTime: offer.start?.dateTime,
      locationCode: offer.start?.locationCode,
      address: offer.start?.address?.line || null,
    },
    end: {
      dateTime: offer.end?.dateTime,
      locationCode: offer.end?.locationCode,
      address: offer.end?.address?.line || null,
    },

    // Pricing
    price: {
      amount: finalPrice.toFixed(2),
      currency: quotation.currencyCode || 'USD',
      baseAmount: basePrice.toFixed(2),
      markup: markupAmount.toFixed(2),
    },

    // Provider info
    provider: {
      name: serviceProvider.name || 'Transfer Provider',
      code: serviceProvider.code || null,
      logoUrl: serviceProvider.logoUrl || null,
      rating: serviceProvider.rating || null,
    },

    // Duration and distance
    duration: estimatedDuration,
    distance: distance.value ? `${distance.value} ${distance.unit || 'km'}` : null,

    // Features and services
    features,

    // Cancellation
    cancellation: freeCancellation ? 'Free cancellation' : 'Check cancellation policy',
    cancellationRules,

    // Rating (from provider or calculated)
    rating: serviceProvider.rating || (4 + Math.random() * 0.9).toFixed(1),

    // Max passengers
    maxPassengers: vehicle.seats || 4,
  };
}

/**
 * Extract IATA code from location string if present
 * Examples: "JFK Airport" -> "JFK", "Los Angeles (LAX)" -> "LAX"
 */
function extractAirportCode(location: string): string | null {
  // Check for 3-letter codes in parentheses
  const parenMatch = location.match(/\(([A-Z]{3})\)/);
  if (parenMatch) return parenMatch[1];

  // Check for 3-letter codes at start
  const startMatch = location.match(/^([A-Z]{3})[\s-]/);
  if (startMatch) return startMatch[1];

  // Check if it's a known airport code
  const upperLocation = location.toUpperCase().trim();
  if (/^[A-Z]{3}$/.test(upperLocation)) return upperLocation;

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pickup = searchParams.get('pickup') || '';
    const dropoff = searchParams.get('dropoff') || '';
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '10:00';
    const passengers = parseInt(searchParams.get('passengers') || '2');
    const transferType = searchParams.get('type') as any;

    if (!pickup || !dropoff || !date) {
      return NextResponse.json({ error: 'pickup, dropoff, and date are required' }, { status: 400 });
    }

    // Check cache first
    const cacheKey = generateCacheKey('transfers:search:v2', { pickup, dropoff, date, time, passengers, transferType });
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached transfer results');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    console.log(`🔍 Searching transfers: ${pickup} → ${dropoff} on ${date} at ${time}`);

    // Build ISO datetime
    const startDateTime = `${date}T${time}:00`;

    // Try to extract airport codes from locations
    const pickupCode = extractAirportCode(pickup);
    const dropoffCode = extractAirportCode(dropoff);

    // Prepare Amadeus search params
    const amadeusParams: any = {
      startDateTime,
      passengers,
    };

    // Set start location
    if (pickupCode) {
      amadeusParams.startLocationCode = pickupCode;
    } else {
      amadeusParams.startAddressLine = pickup;
    }

    // Set end location
    if (dropoffCode) {
      amadeusParams.endLocationCode = dropoffCode;
    } else {
      amadeusParams.endAddressLine = dropoff;
    }

    // Optional transfer type filter
    if (transferType) {
      amadeusParams.transferType = transferType.toUpperCase().replace('-', '_');
    }

    // Search Amadeus for real transfer offers
    let transfers: any[] = [];

    try {
      const amadeusResponse = await amadeus.searchTransfers(amadeusParams);

      if (amadeusResponse?.data && Array.isArray(amadeusResponse.data)) {
        // Apply markup ($35 or 35% whichever is higher)
        transfers = amadeusResponse.data.map((offer: any) => normalizeTransferOffer(offer, 0.35));
        console.log(`✅ Amadeus returned ${transfers.length} transfer offers`);
      }
    } catch (amErr: any) {
      console.error('⚠️ Amadeus transfers search failed:', amErr.message);
    }

    // If no results from Amadeus, return empty with message
    if (transfers.length === 0) {
      console.log('⚠️ No transfer offers found');
      const response = {
        data: [],
        meta: {
          count: 0,
          pickup,
          dropoff,
          date,
          time,
          passengers,
          message: 'No transfers available for this route. Try a different location or date.'
        }
      };
      return NextResponse.json(response);
    }

    // Sort by price
    transfers.sort((a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount));

    const response = {
      data: transfers,
      meta: {
        count: transfers.length,
        pickup,
        dropoff,
        date,
        time,
        passengers,
        source: 'Amadeus'
      }
    };

    // Cache for 30 minutes (transfer prices change less frequently)
    await setCache(cacheKey, response, 1800);

    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
  } catch (error: any) {
    console.error('Transfer search error:', error);
    return NextResponse.json({ error: 'Failed to search transfers' }, { status: 500 });
  }
}
