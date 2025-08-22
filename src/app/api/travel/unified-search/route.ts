/**
 * 🎯 UNIFIED TRAVEL SEARCH API
 * Central API endpoint that orchestrates all travel services
 * - Flights, Hotels, Cars, Activities search
 * - Smart bundling and pricing
 * - Real-time availability
 * - Conversion optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Import our service modules
import { carRentalService } from '@/lib/amadeus/car-rentals';
import { activitiesService } from '@/lib/amadeus/activities';
import { smartBundlingEngine } from '@/lib/travel/smart-bundling-engine';

// ========================================
// REQUEST VALIDATION SCHEMA
// ========================================

const UnifiedSearchRequestSchema = z.object({
  query: z.string().min(2).max(200),
  intent: z.object({
    type: z.enum(['flights', 'hotels', 'cars', 'activities', 'package', 'unknown']),
    confidence: z.number().min(0).max(1),
    suggestedServices: z.array(z.enum(['flights', 'hotels', 'cars', 'activities']))
  }).optional(),
  origin: z.object({
    code: z.string(),
    name: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  destination: z.object({
    code: z.string(),
    name: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    })
  }),
  dates: z.object({
    departure: z.string(), // ISO date
    return: z.string().optional(),
    flexible: z.boolean().default(false)
  }),
  travelers: z.object({
    adults: z.number().min(1).max(20),
    children: z.number().min(0).max(10),
    infants: z.number().min(0).max(5)
  }),
  preferences: z.object({
    budget: z.object({
      min: z.number().min(0),
      max: z.number(),
      currency: z.string().length(3)
    }).optional(),
    travelClass: z.enum(['economy', 'premium', 'business', 'first']).default('economy'),
    accommodationType: z.enum(['budget', 'mid-range', 'luxury']).default('mid-range'),
    carType: z.enum(['economy', 'compact', 'standard', 'suv', 'luxury']).default('economy'),
    activityTypes: z.array(z.string()).default([]),
    accessibility: z.array(z.string()).default([])
  }).optional(),
  services: z.object({
    flights: z.boolean().default(true),
    hotels: z.boolean().default(false),
    cars: z.boolean().default(false),
    activities: z.boolean().default(false)
  }),
  options: z.object({
    generateBundles: z.boolean().default(true),
    maxResults: z.number().min(1).max(50).default(10),
    sortBy: z.enum(['price', 'duration', 'rating', 'relevance']).default('relevance'),
    includeNearbyAirports: z.boolean().default(false)
  }).optional()
});

// ========================================
// UNIFIED SEARCH HANDLER
// ========================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Enhanced logging for debugging
    console.log('🔥 [UNIFIED SEARCH] Request initiated at:', new Date().toISOString());
    
    // Parse request body with detailed logging
    const body = await request.json();
    console.log('📦 [UNIFIED SEARCH] Raw request body:', JSON.stringify(body, null, 2));
    
    // Log the schema validation attempt
    console.log('🔍 [UNIFIED SEARCH] Starting Zod validation...');
    
    const searchRequest = UnifiedSearchRequestSchema.parse(body);
    
    console.log('✅ [UNIFIED SEARCH] Validation successful, parsed request:', {
      query: searchRequest.query,
      destination: searchRequest.destination,
      dates: searchRequest.dates,
      travelers: searchRequest.travelers,
      services: searchRequest.services
    });
    
    console.log('🔍 Unified Travel Search:', {
      query: searchRequest.query,
      services: searchRequest.services,
      destination: searchRequest.destination.name
    });

    // Initialize parallel search promises
    const searchPromises: Promise<any>[] = [];
    const results: any = {
      searchId: `unified_${Date.now()}`,
      query: searchRequest.query,
      searchTime: 0,
      services: {},
      bundles: [],
      recommendations: [],
      meta: {
        totalResults: 0,
        searchCriteria: searchRequest
      }
    };

    // ========================================
    // FLIGHTS SEARCH
    // ========================================
    
    if (searchRequest.services.flights) {
      const flightSearchPromise = searchFlights(searchRequest)
        .then(flightResults => {
          results.services.flights = flightResults;
          return flightResults;
        })
        .catch(error => {
          console.error('Flight search error:', error);
          // Semantic fallback: provide empty results instead of breaking
          results.services.flights = { 
            success: false,
            data: [],
            meta: { count: 0, error: error.message },
            error: error.message 
          };
          return null;
        });
      
      searchPromises.push(flightSearchPromise);
    }

    // ========================================
    // HOTELS SEARCH
    // ========================================
    
    if (searchRequest.services.hotels) {
      const hotelSearchPromise = searchHotels(searchRequest)
        .then(hotelResults => {
          results.services.hotels = hotelResults;
          return hotelResults;
        })
        .catch(error => {
          console.error('Hotel search error:', error);
          // Semantic fallback: provide empty results instead of breaking
          results.services.hotels = { 
            success: false,
            data: [],
            meta: { count: 0, error: error.message },
            error: error.message 
          };
          return null;
        });
      
      searchPromises.push(hotelSearchPromise);
    }

    // ========================================
    // CAR RENTALS SEARCH
    // ========================================
    
    if (searchRequest.services.cars) {
      const carSearchPromise = searchCarRentals(searchRequest)
        .then(carResults => {
          results.services.cars = carResults;
          return carResults;
        })
        .catch(error => {
          console.error('Car rental search error:', error);
          results.services.cars = { error: error.message };
          return null;
        });
      
      searchPromises.push(carSearchPromise);
    }

    // ========================================
    // ACTIVITIES SEARCH
    // ========================================
    
    if (searchRequest.services.activities) {
      const activitiesSearchPromise = searchActivities(searchRequest)
        .then(activityResults => {
          results.services.activities = activityResults;
          return activityResults;
        })
        .catch(error => {
          console.error('Activities search error:', error);
          results.services.activities = { error: error.message };
          return null;
        });
      
      searchPromises.push(activitiesSearchPromise);
    }

    // Wait for all searches to complete
    const searchResults = await Promise.allSettled(searchPromises);
    
    // ========================================
    // SMART BUNDLING
    // ========================================
    
    if (searchRequest.options?.generateBundles) {
      try {
        const bundleRequest = {
          travelIntent: {
            type: inferTravelType(searchRequest),
            confidence: searchRequest.intent?.confidence || 0.8,
            duration: calculateTripDuration(searchRequest.dates),
            budget: searchRequest.preferences?.budget ? {
              ...searchRequest.preferences.budget,
              flexible: true
            } : undefined
          },
          destination: {
            code: searchRequest.destination.code,
            name: searchRequest.destination.name,
            coordinates: searchRequest.destination.coordinates || { lat: 0, lng: 0 }
          },
          dateRange: {
            checkIn: searchRequest.dates.departure,
            checkOut: searchRequest.dates.return || searchRequest.dates.departure,
            flexible: searchRequest.dates.flexible
          },
          travelers: searchRequest.travelers,
          preferences: {
            accommodationLevel: searchRequest.preferences?.accommodationType || 'mid-range',
            transportPreference: 'mixed' as const,
            activityInterests: searchRequest.preferences?.activityTypes || [],
            dietaryRestrictions: [],
            accessibilityNeeds: searchRequest.preferences?.accessibility || []
          },
          requestedServices: searchRequest.services
        };

        const bundleResponse = await smartBundlingEngine.generateSmartBundles(
          bundleRequest,
          results.services.flights?.data || [],
          results.services.hotels?.data || [],
          results.services.cars?.data || [],
          results.services.activities?.data || []
        );

        if (bundleResponse.success) {
          results.bundles = bundleResponse.data;
          results.bundlingMeta = bundleResponse.meta;
        }
      } catch (bundlingError) {
        console.error('Bundling error:', bundlingError);
        results.bundlingError = bundlingError instanceof Error ? bundlingError.message : 'Bundling failed';
      }
    }

    // ========================================
    // GENERATE RECOMMENDATIONS
    // ========================================
    
    results.recommendations = generateSmartRecommendations(searchRequest, results);

    // ========================================
    // CALCULATE TOTALS & METADATA
    // ========================================
    
    results.meta.totalResults = Object.values(results.services).reduce((total: number, service: any) => {
      return total + (service?.data?.length || 0);
    }, 0);

    results.searchTime = Date.now() - startTime;

    // ========================================
    // ANALYTICS TRACKING
    // ========================================
    
    trackSearchAnalytics(searchRequest, results);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('🚨 [UNIFIED SEARCH] Error occurred:', error);
    
    // Enhanced error logging
    if (error instanceof z.ZodError) {
      console.error('📋 [UNIFIED SEARCH] Zod validation errors:', JSON.stringify(error.issues, null, 2));
      console.error('🔍 [UNIFIED SEARCH] Validation error details:');
      error.issues.forEach((err, index) => {
        console.error(`  ${index + 1}. Path: ${err.path.join('.')} | Code: ${err.code} | Message: ${err.message}`);
        if (err.code === 'invalid_type') {
          console.error(`     Expected: ${(err as any).expected} | Received: ${(err as any).received}`);
        }
      });
    } else {
      console.error('🚨 [UNIFIED SEARCH] Non-validation error:', error);
      console.error('🔍 [UNIFIED SEARCH] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'UNIFIED_SEARCH_ERROR',
        message: error instanceof Error ? error.message : 'Search failed',
        details: error instanceof z.ZodError ? error.issues : undefined,
        timestamp: new Date().toISOString()
      }
    }, { status: 400 });
  }
}

// ========================================
// INDIVIDUAL SEARCH FUNCTIONS
// ========================================

/**
 * Search flights using existing flight search functionality
 */
async function searchFlights(request: z.infer<typeof UnifiedSearchRequestSchema>) {
  try {
    // Semantic origin-destination mapping with intelligent inference
    const destinationCode = request.destination.code;
    
    // If destination appears to be São Paulo, user likely wants flights TO São Paulo
    const isSaoPauloDestination = request.destination.name.toLowerCase().includes('sao paulo') || 
                                  request.destination.name.toLowerCase().includes('são paulo') ||
                                  destinationCode === 'SAO' || destinationCode === 'GRU';
    
    // Semantic logic: For "Sao Paulo" searches, assume international flights TO São Paulo
    const inferredOrigin = request.origin?.code || (
      isSaoPauloDestination 
        ? 'MIA' // Miami as common US departure point to Brazil
        : 'GRU'  // São Paulo as common Brazil departure point
    );
    
    // Ensure proper destination code for São Paulo
    const properDestinationCode = isSaoPauloDestination && destinationCode === 'SAO' 
      ? 'GRU'  // Convert SAO to proper airport code GRU
      : destinationCode;
    
    const flightSearchParams = new URLSearchParams({
      originLocationCode: inferredOrigin,
      destinationLocationCode: properDestinationCode,
      departureDate: request.dates.departure,
      adults: request.travelers.adults.toString(),
      travelClass: request.preferences?.travelClass || 'economy',
      oneWay: (!request.dates.return).toString(),
      currencyCode: request.preferences?.budget?.currency || 'USD',
      max: '10'
    });

    // Add return date if exists
    if (request.dates.return) {
      flightSearchParams.append('returnDate', request.dates.return);
    }

    // Add children and infants if they exist
    if (request.travelers.children > 0) {
      flightSearchParams.append('children', request.travelers.children.toString());
    }
    if (request.travelers.infants > 0) {
      flightSearchParams.append('infants', request.travelers.infants.toString());
    }

    // Call existing flight search API
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://fly2any.com' 
      : 'http://localhost:3000';
    
    const flightSearchUrl = `${baseUrl}/api/flights/search?${flightSearchParams.toString()}`;
    
    console.log('🛫 Calling existing flight search API:', flightSearchUrl);
    
    const response = await fetch(flightSearchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Flight search API failed with status: ${response.status}`);
    }

    const flightResults = await response.json();
    
    if (!flightResults.success) {
      throw new Error(`Flight search failed: ${flightResults.error || 'Unknown error'}`);
    }

    // Return results in consistent format
    return {
      success: true,
      data: flightResults.data || [],
      meta: {
        count: flightResults.data?.length || 0,
        searchCriteria: {
          origin: request.origin?.code,
          destination: request.destination.code,
          dates: request.dates
        },
        amadeus: flightResults.meta
      }
    };
  } catch (error) {
    console.error('Flight search integration error:', error);
    throw new Error(`Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search hotels using LiteAPI integration
 */
async function searchHotels(request: z.infer<typeof UnifiedSearchRequestSchema>) {
  try {
    // Semantic hotel search parameter construction with proper date handling
    const checkInDate = request.dates.departure;
    const checkOutDate = request.dates.return || (() => {
      // Semantic logic: if no return date, add minimum 1 night stay
      const checkIn = new Date(request.dates.departure);
      checkIn.setDate(checkIn.getDate() + 1);
      return checkIn.toISOString().split('T')[0];
    })();
    
    const hotelSearchParams = new URLSearchParams({
      destination: request.destination.name,
      destinationType: 'city', 
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: request.travelers.adults.toString(),
      children: request.travelers.children.toString(),
      rooms: '1', // Default to 1 room, could be enhanced later
      currency: request.preferences?.budget?.currency || 'USD',
      limit: '10'
    });

    // Add budget constraints if provided
    if (request.preferences?.budget) {
      if (request.preferences.budget.min > 0) {
        hotelSearchParams.append('minPrice', request.preferences.budget.min.toString());
      }
      hotelSearchParams.append('maxPrice', request.preferences.budget.max.toString());
    }

    // Add accommodation level filter (star rating)
    if (request.preferences?.accommodationType) {
      const starRatingMap = {
        'budget': '1,2',
        'mid-range': '3,4',
        'luxury': '4,5'
      };
      hotelSearchParams.append('starRating', starRatingMap[request.preferences.accommodationType]);
    }

    // Call existing hotel search API
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://fly2any.com' 
      : 'http://localhost:3000';
    
    const hotelSearchUrl = `${baseUrl}/api/hotels/search?${hotelSearchParams.toString()}`;
    
    console.log('🏨 Calling existing hotel search API:', hotelSearchUrl);
    
    const response = await fetch(hotelSearchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Hotel search API failed with status: ${response.status}`);
    }

    const hotelResults = await response.json();
    
    if (hotelResults.status !== 'success') {
      throw new Error(`Hotel search failed: ${hotelResults.message || 'Unknown error'}`);
    }

    // Return results in consistent format
    return {
      success: true,
      data: hotelResults.data?.hotels || [],
      meta: {
        count: hotelResults.data?.hotels?.length || 0,
        searchCriteria: {
          destination: request.destination.name,
          dates: request.dates,
          guests: request.travelers
        },
        liteapi: hotelResults.metadata
      }
    };
  } catch (error) {
    console.error('Hotel search integration error:', error);
    throw new Error(`Hotel search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search car rentals using Amadeus Car Rental API
 */
async function searchCarRentals(request: z.infer<typeof UnifiedSearchRequestSchema>) {
  try {
    const carSearchParams = {
      pickupLocation: {
        locationCode: request.destination.code,
        locationName: request.destination.name,
        ...(request.destination.coordinates && {
          latitude: request.destination.coordinates.lat,
          longitude: request.destination.coordinates.lng
        })
      },
      pickupDateTime: `${request.dates.departure}T10:00:00`,
      dropoffDateTime: `${request.dates.return || request.dates.departure}T10:00:00`,
      driverAge: 30, // Default driver age
      currency: request.preferences?.budget?.currency || 'USD',
      maxResults: request.options?.maxResults || 10
    };

    const carResults = await carRentalService.searchCarRentals(carSearchParams);
    
    return carResults;
  } catch (error) {
    throw new Error(`Car rental search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search activities using Activities API
 */
async function searchActivities(request: z.infer<typeof UnifiedSearchRequestSchema>) {
  try {
    if (!request.destination.coordinates) {
      // If no coordinates, use default coordinates for the destination
      // This should be enhanced with a geocoding service
      throw new Error('Destination coordinates required for activity search');
    }

    const activitySearchParams = {
      location: {
        latitude: request.destination.coordinates.lat,
        longitude: request.destination.coordinates.lng,
        radius: 15, // 15km radius
        locationName: request.destination.name
      },
      startDate: request.dates.departure,
      endDate: request.dates.return,
      adults: request.travelers.adults,
      children: request.travelers.children,
      language: 'en', // Default language
      categories: request.preferences?.activityTypes,
      priceRange: request.preferences?.budget ? {
        min: request.preferences.budget.min,
        max: request.preferences.budget.max,
        currency: request.preferences.budget.currency
      } : undefined,
      maxResults: request.options?.maxResults || 10
    };

    const activityResults = await activitiesService.searchActivities(activitySearchParams);
    
    return activityResults;
  } catch (error) {
    throw new Error(`Activities search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Infer travel type from search request
 */
function inferTravelType(request: z.infer<typeof UnifiedSearchRequestSchema>): 'leisure' | 'business' | 'romantic' | 'family' | 'adventure' {
  const query = request.query.toLowerCase();
  
  if (query.includes('business') || query.includes('meeting') || query.includes('conference')) {
    return 'business';
  }
  
  if (query.includes('romantic') || query.includes('honeymoon') || query.includes('anniversary')) {
    return 'romantic';
  }
  
  if (query.includes('family') || query.includes('kids') || request.travelers.children > 0) {
    return 'family';
  }
  
  if (query.includes('adventure') || query.includes('hiking') || query.includes('extreme')) {
    return 'adventure';
  }
  
  return 'leisure';
}

/**
 * Calculate trip duration in days
 */
function calculateTripDuration(dates: { departure: string; return?: string }): number {
  const departure = new Date(dates.departure);
  const returnDate = dates.return ? new Date(dates.return) : departure;
  
  const diffTime = returnDate.getTime() - departure.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays);
}

/**
 * Generate smart recommendations based on search results
 */
function generateSmartRecommendations(
  request: z.infer<typeof UnifiedSearchRequestSchema>, 
  results: any
): string[] {
  const recommendations: string[] = [];
  
  // Budget-based recommendations
  if (request.preferences?.budget) {
    const maxBudget = request.preferences.budget.max;
    recommendations.push(`Consider booking services together to stay within your ${maxBudget} ${request.preferences.budget.currency} budget`);
  }
  
  // Service-specific recommendations
  if (request.services.flights && !request.services.hotels) {
    recommendations.push('Add hotel booking to save up to 15% with our package deals');
  }
  
  if (request.services.hotels && !request.services.cars && calculateTripDuration(request.dates) > 3) {
    recommendations.push('Consider adding a car rental for longer trips to save on transportation costs');
  }
  
  if (!request.services.activities && request.destination.name.toLowerCase().includes('brazil')) {
    recommendations.push('Explore local activities and tours to make the most of your Brazil trip');
  }
  
  // Timing recommendations
  const departureDate = new Date(request.dates.departure);
  const daysUntilDeparture = Math.ceil((departureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeparture < 14) {
    recommendations.push('Book soon! Prices typically increase closer to departure date');
  }
  
  return recommendations;
}

/**
 * Track search analytics
 */
function trackSearchAnalytics(
  request: z.infer<typeof UnifiedSearchRequestSchema>, 
  results: any
) {
  // This would integrate with your analytics system
  const analyticsData = {
    searchId: results.searchId,
    query: request.query,
    services: request.services,
    destination: request.destination.name,
    travelers: request.travelers.adults + request.travelers.children,
    resultsFound: results.meta.totalResults,
    bundlesGenerated: results.bundles?.length || 0,
    searchTime: results.searchTime,
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 Search Analytics:', analyticsData);
  
  // Here you would send to your analytics service
  // analytics.track('travel_search', analyticsData);
}

// ========================================
// GET METHOD - HEALTH CHECK
// ========================================

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'unified-travel-search',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    availableServices: {
      flights: true,
      hotels: true,
      cars: true,
      activities: true,
      bundling: true
    }
  });
}