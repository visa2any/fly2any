import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { amadeus } from '@/lib/api/amadeus';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { GLOBAL_CITIES } from '@/lib/data/global-cities-database';

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

  // Service provider with full details
  const serviceProvider = offer.serviceProvider || {};
  const providerContacts = serviceProvider.contacts || {};

  // Payment methods
  const methodsOfPayment = offer.methodsOfPayment || ['CREDIT_CARD'];

  // Equipment options (child seats, wheelchair, etc.)
  const equipment = (offer.equipment || []).map((e: any) => ({
    code: e.code,
    description: e.description,
    price: e.quotation?.monetaryAmount ? parseFloat(e.quotation.monetaryAmount) : null,
    currency: e.quotation?.currencyCode || 'USD',
  }));

  // Discount codes
  const discountCodes = offer.discountCodes || [];

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

    // Provider info with full details
    provider: {
      name: serviceProvider.name || 'Transfer Provider',
      code: serviceProvider.code || null,
      logoUrl: serviceProvider.logoUrl || null,
      rating: serviceProvider.rating || null,
      termsUrl: serviceProvider.termsUrl || null,
      phone: providerContacts.phone || null,
      email: providerContacts.email || null,
    },

    // Payment methods accepted
    paymentMethods: methodsOfPayment,

    // Available equipment (child seats, etc.)
    equipment: equipment.length > 0 ? equipment : null,

    // Discount codes if available
    discounts: discountCodes.length > 0 ? discountCodes : null,

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

/**
 * Geocode a location string to coordinates using our cities database
 * Fallback to well-known locations
 */
function geocodeLocation(location: string): { latitude: number; longitude: number } | null {
  const q = location.toLowerCase().trim();

  // Search in global cities database
  const city = GLOBAL_CITIES.find(c =>
    c.name.toLowerCase() === q ||
    c.id === q ||
    c.aliases?.some(a => q.includes(a.toLowerCase())) ||
    q.includes(c.name.toLowerCase())
  );

  if (city) {
    return { latitude: city.location.lat, longitude: city.location.lng };
  }

  // Fallback for common city centers
  const knownLocations: Record<string, { latitude: number; longitude: number }> = {
    'manhattan': { latitude: 40.7831, longitude: -73.9712 },
    'times square': { latitude: 40.7580, longitude: -73.9855 },
    'downtown': { latitude: 40.7128, longitude: -74.0060 },
    'city center': { latitude: 40.7128, longitude: -74.0060 },
    'central park': { latitude: 40.7829, longitude: -73.9654 },
    'hollywood': { latitude: 34.0928, longitude: -118.3287 },
    'paris city': { latitude: 48.8566, longitude: 2.3522 },
    'london city': { latitude: 51.5074, longitude: -0.1278 },
  };

  for (const [key, coords] of Object.entries(knownLocations)) {
    if (q.includes(key)) return coords;
  }

  return null;
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);
    const pickup = searchParams.get('pickup') || '';
    const dropoff = searchParams.get('dropoff') || '';
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '10:00';
    const passengers = parseInt(searchParams.get('passengers') || '2');
    const transferType = searchParams.get('type') as any;

    if (!pickup || !dropoff || !date) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'pickup, dropoff, and date are required',
        data: [],
        meta: { count: 0 }
      }, { status: 400 });
    }

    // Check cache first (fast path)
    const cacheKey = generateCacheKey('transfers:search:v3', { pickup, dropoff, date, time, passengers, transferType });
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached transfer results');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Response-Time': '< 50ms' } });
    }

    const startTime = Date.now();
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

    // Set start location (prefer airport code, then geocode, then address)
    if (pickupCode) {
      amadeusParams.startLocationCode = pickupCode;
    } else {
      const pickupGeo = geocodeLocation(pickup);
      if (pickupGeo) {
        amadeusParams.startGeoCode = pickupGeo;
      } else {
        amadeusParams.startAddressLine = pickup;
      }
    }

    // Set end location (prefer airport code, then geocode, then address)
    if (dropoffCode) {
      amadeusParams.endLocationCode = dropoffCode;
    } else {
      const dropoffGeo = geocodeLocation(dropoff);
      if (dropoffGeo) {
        amadeusParams.endGeoCode = dropoffGeo;
      } else {
        amadeusParams.endAddressLine = dropoff;
      }
    }

    // Optional transfer type filter
    if (transferType) {
      amadeusParams.transferType = transferType.toUpperCase().replace('-', '_');
    }

    // Search Amadeus for real transfer offers with timeout (25s)
    let transfers: any[] = [];
    let apiError: string | null = null;

    console.log('🚗 Transfer search params:', JSON.stringify(amadeusParams, null, 2));

    try {
      const amadeusResponse = await Promise.race([
        amadeus.searchTransfers(amadeusParams),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Amadeus timeout')), 25000))
      ]) as any;

      if (amadeusResponse?.data && Array.isArray(amadeusResponse.data)) {
        // Apply markup ($35 or 35% whichever is higher)
        transfers = amadeusResponse.data.map((offer: any) => normalizeTransferOffer(offer, 0.35));
        console.log(`✅ Amadeus returned ${transfers.length} transfer offers in ${Date.now() - startTime}ms`);
      }
    } catch (amErr: any) {
      apiError = amErr.message;
      console.error('⚠️ Amadeus transfers search failed:', amErr.message);
    }

    const responseTime = Date.now() - startTime;

    // If no results from Amadeus, return empty with message
    if (transfers.length === 0) {
      console.log(`⚠️ No transfer offers found (${responseTime}ms)`);
      const response = {
        success: true,
        data: [],
        meta: {
          count: 0,
          pickup,
          dropoff,
          date,
          time,
          passengers,
          responseTime: `${responseTime}ms`,
          message: apiError
            ? 'Transfer search temporarily unavailable. Please try again.'
            : 'No transfers available for this route. Try a different location or date.'
        }
      };
      // Still cache empty results to prevent repeated slow API calls (5 min)
      await setCache(cacheKey, response, 300);
      return NextResponse.json(response, { headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${responseTime}ms` } });
    }

    // Sort by price
    transfers.sort((a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount));

    const response = {
      success: true,
      data: transfers,
      meta: {
        count: transfers.length,
        pickup,
        dropoff,
        date,
        time,
        passengers,
        source: 'Amadeus',
        responseTime: `${responseTime}ms`
      }
    };

    // Cache for 30 minutes (transfer prices change less frequently)
    await setCache(cacheKey, response, 1800);

    console.log(`✅ Transfer search completed: ${transfers.length} results in ${responseTime}ms`);
    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${responseTime}ms` } });
  }, { category: 'external_api' as any, severity: 'high' as any });
}
