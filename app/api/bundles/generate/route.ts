import { NextRequest, NextResponse } from 'next/server';
import { bundleGenerator } from '@/lib/ml/bundle-generator';
import { dynamicPricingEngine } from '@/lib/ml/dynamic-pricing';

/**
 * POST /api/bundles/generate
 * ===========================
 * Generates personalized add-on bundles using ML
 *
 * Request body:
 * {
 *   route: { from: string, to: string, distance: number, duration: number },
 *   passenger: { type: 'business' | 'leisure' | 'family' | 'budget', count: number, hasChildren: boolean },
 *   basePrice: number,
 *   currency: string
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { route, passenger, basePrice, currency } = body;

    // Validate inputs
    if (!route || !passenger || !basePrice || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: route, passenger, basePrice, currency' },
        { status: 400 }
      );
    }

    // Determine route profile
    const routeProfile = {
      distance: route.distance || calculateDistance(route.from, route.to),
      duration: route.duration || 180, // minutes
      destinationType: route.distance > 2000 ? 'long-haul' : route.international ? 'international' : 'domestic' as 'domestic' | 'international' | 'long-haul',
      isLeisureDestination: isLeisureDestination(route.to),
      isBusinessHub: isBusinessHub(route.to),
    };

    // Passenger profile
    const passengerProfile = {
      type: passenger.type || 'leisure',
      count: passenger.count || 1,
      hasChildren: passenger.hasChildren || false,
      priceElasticity: passenger.priceElasticity || 0.5, // Medium price sensitivity
    };

    // Generate bundles
    const bundles = await bundleGenerator.generateBundles(
      routeProfile,
      passengerProfile,
      basePrice,
      currency
    );

    // Apply dynamic pricing to bundles
    const pricingContext = dynamicPricingEngine.buildContext({
      basePrice,
      currency,
      route: route.from && route.to ? `${route.from}-${route.to}` : 'unknown',
      departureDate: route.departureDate || new Date().toISOString(),
      userSegment: passenger.type || 'leisure',
      currentDemand: 'medium', // TODO: Calculate from real metrics
    });

    const dynamicallyPricedBundles = bundles.map(bundle => {
      const pricingResult = dynamicPricingEngine.calculatePrice(
        {
          basePrice: bundle.price,
          category: 'bundle',
          name: bundle.name,
        },
        pricingContext
      );

      return {
        ...bundle,
        price: pricingResult.adjustedPrice,
        originalPrice: pricingResult.originalPrice,
        priceAdjustment: pricingResult.adjustmentPercent,
        pricingReason: pricingResult.reason,
        // Recalculate savings based on adjusted price
        savings: Math.max(0, pricingResult.originalPrice - pricingResult.adjustedPrice + bundle.savings),
      };
    });

    return NextResponse.json({
      success: true,
      bundles: dynamicallyPricedBundles,
      metadata: {
        routeProfile,
        passengerProfile,
        pricingContext,
        dynamicPricingApplied: true,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bundle generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bundles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper functions (simplified - would use actual geo data in production)

function calculateDistance(from: string, to: string): number {
  // Simplified: return mock distance based on airport codes
  // In production: use Haversine formula with actual lat/long
  const distances: { [key: string]: number } = {
    'JFK-LAX': 2475,
    'LAX-JFK': 2475,
    'JFK-LHR': 3459,
    'LHR-JFK': 3459,
    'SFO-NYC': 2565,
    'NYC-SFO': 2565,
    'LAX-MIA': 2342,
    'MIA-LAX': 2342,
  };

  const key = `${from}-${to}`;
  return distances[key] || 1000; // Default 1000 miles
}

function isLeisureDestination(airport: string): boolean {
  const leisureDestinations = ['LAX', 'MIA', 'LAS', 'MCO', 'HNL', 'CUN', 'CDG', 'FCO', 'BCN', 'DXB'];
  return leisureDestinations.includes(airport);
}

function isBusinessHub(airport: string): boolean {
  const businessHubs = ['JFK', 'LHR', 'FRA', 'SIN', 'HKG', 'DXB', 'ORD', 'SFO', 'NYC', 'LAX'];
  return businessHubs.includes(airport);
}
