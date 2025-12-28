import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { amadeus, amadeusAPI } from '@/lib/api/amadeus';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { GLOBAL_CITIES } from '@/lib/data/global-cities-database';

export const dynamic = 'force-dynamic';

// Keywords to identify transfer-type activities in Amadeus Activities API
const TRANSFER_KEYWORDS = [
  'transfer', 'shuttle', 'airport pickup', 'airport drop', 'private car',
  'limousine', 'airport to', 'to airport', 'pickup service', 'drop-off',
  'transportation', 'private driver', 'chauffeur', 'airport express'
];

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
 * Detect transfer type from activity name/description
 */
function detectTransferType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('shared') || lower.includes('shuttle')) return 'SHARED';
  if (lower.includes('private')) return 'PRIVATE';
  if (lower.includes('limousine') || lower.includes('limo')) return 'LIMOUSINE';
  if (lower.includes('helicopter') || lower.includes('heliport')) return 'HELICOPTER';
  if (lower.includes('express') || lower.includes('fast')) return 'AIRPORT_EXPRESS';
  if (lower.includes('bus')) return 'AIRPORT_BUS';
  return 'PRIVATE'; // Default
}

/**
 * Normalize Activity API result to transfer format (for fallback)
 */
function normalizeActivityAsTransfer(activity: any): any {
  const text = `${activity.name || ''} ${activity.shortDescription || ''}`;
  const transferType = detectTransferType(text);
  const typeInfo = TRANSFER_TYPE_INFO[transferType] || { name: 'Private Transfer', icon: '🚗', category: 'private' };

  // Extract base price and apply markup ($35 or 35% whichever is higher)
  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : 50;
  const markupAmount = Math.max(35, basePrice * 0.35);
  const finalPrice = basePrice + markupAmount;

  // Extract duration from description if available
  let duration = null;
  const durationMatch = text.match(/(\d+)\s*(hour|hr|min|minute)/i);
  if (durationMatch) {
    const num = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit.includes('hour') || unit.includes('hr') ? `${num * 60} min` : `${num} min`;
  }

  // Estimate max passengers from description
  let maxPassengers = 4;
  if (text.toLowerCase().includes('van') || text.toLowerCase().includes('minibus')) maxPassengers = 8;
  if (text.toLowerCase().includes('bus')) maxPassengers = 20;
  if (text.toLowerCase().includes('suv')) maxPassengers = 6;

  return {
    id: activity.id || `activity-transfer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    offerId: activity.id,
    type: transferType.toLowerCase().replace('_', '-'),
    name: activity.name || 'Airport Transfer',
    icon: typeInfo.icon,
    category: typeInfo.category,
    transferType: typeInfo.name,
    source: 'activities', // Mark as sourced from Activities API

    vehicle: {
      category: transferType.includes('SHARED') ? 'VAN' : 'STANDARD',
      name: typeInfo.name,
      description: activity.shortDescription || null,
      seats: maxPassengers,
      baggageQuantity: Math.min(maxPassengers, 4),
      imageURL: activity.pictures?.[0]?.url || null,
    },

    start: { dateTime: null, locationCode: null, address: null },
    end: { dateTime: null, locationCode: null, address: null },

    price: {
      amount: finalPrice.toFixed(2),
      currency: activity.price?.currencyCode || 'USD',
      baseAmount: basePrice.toFixed(2),
      markup: markupAmount.toFixed(2),
    },

    provider: {
      name: 'Local Operator',
      code: null,
      logoUrl: null,
      rating: activity.rating || (4 + Math.random() * 0.9).toFixed(1),
      termsUrl: null,
    },

    paymentMethods: ['CREDIT_CARD'],
    equipment: null,
    discounts: null,
    duration,
    distance: null,
    features: ['Online Booking', 'Instant Confirmation'],
    cancellation: activity.cancellation?.cancelable ? 'Free cancellation' : 'Check cancellation policy',
    cancellationRules: [],
    rating: activity.rating || (4 + Math.random() * 0.9).toFixed(1),
    maxPassengers,

    // Activity-specific fields
    bookingLink: activity.bookingLink,
    description: activity.shortDescription,
    pictures: activity.pictures,
  };
}

/**
 * Filter transfer-type activities from Activities API results
 */
function filterTransferActivities(activities: any[]): any[] {
  return activities.filter(activity => {
    const text = `${activity.name || ''} ${activity.shortDescription || activity.description || ''}`.toLowerCase();
    return TRANSFER_KEYWORDS.some(keyword => text.includes(keyword));
  });
}

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

    // Provider info (contact details admin-only, not exposed to customers)
    provider: {
      name: serviceProvider.name || 'Transfer Provider',
      code: serviceProvider.code || null,
      logoUrl: serviceProvider.logoUrl || null,
      rating: serviceProvider.rating || null,
      termsUrl: serviceProvider.termsUrl || null,
      // Note: phone/email stored internally for admin but not exposed
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
    // GPS coordinates passed from search bar (for hotels/landmarks)
    const pickupLat = searchParams.get('pickupLat');
    const pickupLng = searchParams.get('pickupLng');
    const dropoffLat = searchParams.get('dropoffLat');
    const dropoffLng = searchParams.get('dropoffLng');
    const dropoffCity = searchParams.get('dropoffCity');
    const dropoffCountry = searchParams.get('dropoffCountry');

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

    // Set start location (prefer airport code, then passed GPS coords, then geocode, then address)
    if (pickupCode) {
      amadeusParams.startLocationCode = pickupCode;
    } else if (pickupLat && pickupLng) {
      // Use GPS coordinates passed from search bar (for hotels/landmarks)
      amadeusParams.startGeoCode = { latitude: parseFloat(pickupLat), longitude: parseFloat(pickupLng) };
    } else {
      const pickupGeo = geocodeLocation(pickup);
      if (pickupGeo) {
        amadeusParams.startGeoCode = pickupGeo;
      } else {
        amadeusParams.startAddressLine = pickup;
      }
    }

    // Set end location (prefer airport code, then passed GPS coords, then geocode, then address)
    if (dropoffCode) {
      amadeusParams.endLocationCode = dropoffCode;
    } else if (dropoffLat && dropoffLng) {
      // Use GPS coordinates passed from search bar (for hotels/landmarks)
      amadeusParams.endGeoCode = { latitude: parseFloat(dropoffLat), longitude: parseFloat(dropoffLng) };
      if (dropoffCity) amadeusParams.endCityName = dropoffCity;
      if (dropoffCountry) amadeusParams.endCountryCode = dropoffCountry;
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

    // If no results from Amadeus Transfer API, try Activities API as fallback
    if (transfers.length === 0) {
      console.log(`⚠️ No Amadeus transfer offers, trying Activities API fallback...`);

      // Get pickup location coordinates for Activities search
      let searchLat: number | null = null;
      let searchLng: number | null = null;

      if (pickupLat && pickupLng) {
        searchLat = parseFloat(pickupLat);
        searchLng = parseFloat(pickupLng);
      } else if (pickupCode) {
        // Map common airport codes to coordinates
        const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
          'JFK': { lat: 40.6413, lng: -73.7781 },
          'LAX': { lat: 33.9425, lng: -118.4081 },
          'MIA': { lat: 25.7959, lng: -80.2870 },
          'ORD': { lat: 41.9742, lng: -87.9073 },
          'LHR': { lat: 51.4700, lng: -0.4543 },
          'CDG': { lat: 49.0097, lng: 2.5479 },
          'FCO': { lat: 41.8003, lng: 12.2389 },
          'BCN': { lat: 41.2971, lng: 2.0785 },
          'CUN': { lat: 21.0366, lng: -86.8773 },
          'SFO': { lat: 37.6213, lng: -122.3790 },
          'ATL': { lat: 33.6407, lng: -84.4277 },
          'DFW': { lat: 32.8998, lng: -97.0403 },
          'LAS': { lat: 36.0840, lng: -115.1537 },
          'DEN': { lat: 39.8561, lng: -104.6737 },
          'SEA': { lat: 47.4502, lng: -122.3088 },
          'BOS': { lat: 42.3656, lng: -71.0096 },
          'EWR': { lat: 40.6895, lng: -74.1745 },
          'PHX': { lat: 33.4373, lng: -112.0078 },
          'MCO': { lat: 28.4312, lng: -81.3081 },
          'IAH': { lat: 29.9902, lng: -95.3368 },
        };
        const coords = AIRPORT_COORDS[pickupCode];
        if (coords) {
          searchLat = coords.lat;
          searchLng = coords.lng;
        }
      } else {
        const pickupGeo = geocodeLocation(pickup);
        if (pickupGeo) {
          searchLat = pickupGeo.latitude;
          searchLng = pickupGeo.longitude;
        }
      }

      // Search Activities API for transfer-type products
      if (searchLat && searchLng) {
        try {
          console.log(`🔍 Searching Activities API at ${searchLat}, ${searchLng}...`);
          const activitiesResult = await amadeusAPI.searchActivities({
            latitude: searchLat,
            longitude: searchLng,
            radius: 5, // 5km radius around airport
          });

          if (activitiesResult?.data && Array.isArray(activitiesResult.data)) {
            // Filter for transfer-type activities
            const transferActivities = filterTransferActivities(activitiesResult.data);
            console.log(`📦 Found ${transferActivities.length} transfer-type activities out of ${activitiesResult.data.length} total`);

            if (transferActivities.length > 0) {
              // Normalize to transfer format
              transfers = transferActivities.map(normalizeActivityAsTransfer);
              console.log(`✅ Converted ${transfers.length} activities to transfers`);
            }
          }
        } catch (actErr: any) {
          console.error('⚠️ Activities fallback failed:', actErr.message);
        }
      }
    }

    const responseTime = Date.now() - startTime;

    // Still no results after fallback
    if (transfers.length === 0) {
      console.log(`⚠️ No transfer offers found from any source (${responseTime}ms)`);
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

    // Determine source (some transfers may come from Activities API fallback)
    const hasActivitiesSource = transfers.some((t: any) => t.source === 'activities');
    const source = hasActivitiesSource ? 'Amadeus Activities' : 'Amadeus Transfers';

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
        source,
        responseTime: `${responseTime}ms`
      }
    };

    // Cache for 30 minutes (transfer prices change less frequently)
    await setCache(cacheKey, response, 1800);

    console.log(`✅ Transfer search completed: ${transfers.length} results in ${responseTime}ms`);
    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS', 'X-Response-Time': `${responseTime}ms` } });
  }, { category: 'external_api' as any, severity: 'high' as any });
}
