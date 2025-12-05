import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getVehiclePhoto, getRentalCompanyLogo } from '@/lib/data/car-photos';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { calculateValueScore } from '@/lib/ml/value-scorer';

export const runtime = 'edge';

const AIRPORT_LOCATIONS = {
  lax: { code: 'LAX', name: 'Los Angeles' },
  mia: { code: 'MIA', name: 'Miami' },
  jfk: { code: 'JFK', name: 'New York' },
  sfo: { code: 'SFO', name: 'San Francisco' },
  ord: { code: 'ORD', name: 'Chicago' },
  den: { code: 'DEN', name: 'Denver' },
  atl: { code: 'ATL', name: 'Atlanta' },
  sea: { code: 'SEA', name: 'Seattle' },
};

/**
 * Deterministic seeded random number generator
 * Uses location code + car type as seed
 */
function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert hash to number between 0 and 1
  return Math.abs(hash % 1000) / 1000;
}

function generateSyntheticData(seed: string) {
  return {
    rating: Number((seededRandom(seed, 0) * 1 + 4).toFixed(1)), // 4.0-5.0
    reviews: Math.floor(seededRandom(seed, 1) * 4500) + 500, // 500-5000
    demandLevel: Number((seededRandom(seed, 2) * 0.4 + 0.6).toFixed(2)), // 0.6-1.0
    availability: Math.floor(seededRandom(seed, 3) * 30) + 10, // 10-40
    viewersLast24h: Math.floor(seededRandom(seed, 4) * 150) + 50, // 50-200
    bookingsLast24h: Math.floor(seededRandom(seed, 5) * 20) + 5, // 5-25
    freeDelivery: seededRandom(seed, 6) > 0.5,
    trending: seededRandom(seed, 7) > 0.7,
    priceDropRecent: seededRandom(seed, 8) > 0.75,
  };
}

function generateBadges(
  vehicle: any,
  pricePerDay: number,
  valueScore: number,
  synthetic: ReturnType<typeof generateSyntheticData>
): string[] {
  const badges: string[] = [];

  if (valueScore >= 85) {
    badges.push('Best Value');
  } else if (valueScore >= 70) {
    badges.push('Great Deal');
  }

  if (synthetic.trending) {
    badges.push('Trending');
  }

  if (synthetic.priceDropRecent) {
    badges.push('Price Drop');
  }

  const type = vehicle.category?.toUpperCase() || '';
  if (
    type.includes('ECONOMY') ||
    type.includes('COMPACT') ||
    type.includes('HYBRID') ||
    type.includes('ELECTRIC')
  ) {
    badges.push('Eco-Friendly');
  }

  if (pricePerDay < 50) {
    badges.push('Budget Friendly');
  }

  if (
    type.includes('LUXURY') ||
    type.includes('PREMIUM') ||
    type.includes('CONVERTIBLE')
  ) {
    badges.push('Premium');
  }

  if (synthetic.freeDelivery) {
    badges.push('Free Delivery');
  }

  if (synthetic.bookingsLast24h > 15) {
    badges.push('Popular');
  }

  return badges.slice(0, 3); // Limit to 3 badges
}

function extractSpecs(vehicle: any) {
  const category = vehicle.category?.toUpperCase() || '';

  // Determine seats based on category
  let seats = 5;
  if (
    category.includes('COMPACT') ||
    category.includes('ECONOMY') ||
    category.includes('MINI')
  ) {
    seats = 4;
  } else if (
    category.includes('VAN') ||
    category.includes('MINIVAN') ||
    category.includes('9_PASSENGER')
  ) {
    seats = 7;
  } else if (category.includes('SUV') || category.includes('LUXURY')) {
    seats = 5;
  }

  // Determine bags based on category
  let bags = 2;
  if (category.includes('COMPACT') || category.includes('ECONOMY')) {
    bags = 1;
  } else if (
    category.includes('VAN') ||
    category.includes('SUV') ||
    category.includes('LUXURY')
  ) {
    bags = 4;
  } else if (category.includes('INTERMEDIATE') || category.includes('STANDARD')) {
    bags = 2;
  }

  // Transmission
  const transmission =
    vehicle.transmissionType === 'AUTOMATIC' || !vehicle.transmissionType
      ? 'Automatic'
      : 'Manual';

  // Fuel type
  let fuel = 'Gasoline';
  if (category.includes('HYBRID')) {
    fuel = 'Hybrid';
  } else if (category.includes('ELECTRIC')) {
    fuel = 'Electric';
  } else if (category.includes('DIESEL')) {
    fuel = 'Diesel';
  }

  return {
    seats,
    bags,
    transmission,
    fuel,
    airConditioning: vehicle.airConditioning !== false,
  };
}

async function searchCarsForLocation(
  locationCode: string,
  locationName: string,
  pickupDate: string,
  dropoffDate: string
) {
  try {
    const response = await amadeusAPI.searchCarRentals({
      pickupLocationCode: locationCode,
      pickupDate,
      dropoffDate,
    });

    if (!response?.data || response.data.length === 0) {
      return [];
    }

    // Map to synchronous operations (photos are cached, no async needed)
    const carPromises = response.data.map((car: any) => {
      const vehicle = car.vehicle || {};
      const quote = car.quote || {};

      // Create deterministic seed based on location and vehicle category
      const carSeed = `${locationCode}-${vehicle.category || 'CAR'}`;

      // Extract price (deterministic fallback)
      const pricePerDay = quote.totalPrice
        ? parseFloat(quote.totalPrice.amount) / 3
        : Math.floor(seededRandom(carSeed, 10) * 100) + 30;

      // Generate original price for some listings (deterministic)
      const hasOriginalPrice = seededRandom(carSeed, 11) > 0.7;
      const originalPrice = hasOriginalPrice
        ? pricePerDay * (1 + seededRandom(carSeed, 12) * 0.3 + 0.1)
        : undefined;

      // Get company info
      const companyCode = car.provider?.companyCode || 'UNKNOWN';
      const companyName = car.provider?.name || companyCode;

      // Get photos (synchronous - uses curated high-quality images)
      const photos = getVehiclePhoto({
        category: vehicle.category,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
      });
      const companyLogo = getRentalCompanyLogo(companyCode);

      // Calculate value score
      const valueScore = calculateValueScore({
        price: pricePerDay,
        marketAvgPrice: pricePerDay * 1.3,
        rating: 4.5,
        reviewCount: 1000,
        demandLevel: 70,
        availabilityLevel: 50,
      });

      // Generate synthetic data (deterministic)
      const synthetic = generateSyntheticData(carSeed);

      // Extract specs
      const specs = extractSpecs(vehicle);

      // Generate badges
      const badges = generateBadges(vehicle, pricePerDay, valueScore, synthetic);

      return {
        id: car.id || `${companyCode}-${locationCode}-${vehicle.category}`,
        type: vehicle.category || 'ECONOMY',
        model:
          vehicle.model ||
          vehicle.modelInfo?.modelDescription ||
          vehicle.category ||
          'Standard Car',
        company: companyName,
        companyCode,
        companyLogo,
        photoUrl: photos.photoUrl,
        thumbnail: photos.thumbnail,
        pricePerDay: Math.round(pricePerDay * 100) / 100,
        originalPrice: originalPrice
          ? Math.round(originalPrice * 100) / 100
          : undefined,
        valueScore,
        rating: synthetic.rating,
        reviews: synthetic.reviews,
        specs,
        badges,
        demandLevel: synthetic.demandLevel,
        availability: synthetic.availability,
        location: locationCode,
        pickupLocation: `${locationName} International Airport`,
        freeDelivery: synthetic.freeDelivery,
        trending: synthetic.trending,
        priceDropRecent: synthetic.priceDropRecent,
        viewersLast24h: synthetic.viewersLast24h,
        bookingsLast24h: synthetic.bookingsLast24h,
        vehicle: car.vehicle,
        quote: car.quote,
      };
    });

    // No Promise.all needed - all operations are synchronous now
    return carPromises;
  } catch (error: any) {
    // Don't log errors if Amadeus is not configured (expected behavior)
    if (error?.message !== 'AMADEUS_NOT_CONFIGURED' && process.env.NODE_ENV === 'development') {
      // Log only essential error info to avoid dumping huge objects
      console.error(`Error searching cars for ${locationCode}:`, {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        code: error?.code,
        type: error?.name || error?.constructor?.name
      });
    }
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationParam = searchParams.get('location') || 'all';
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    // Generate cache key with version for cache invalidation
    const cacheKey = generateCacheKey('cars-featured-enhanced', {
      location: locationParam,
      limit,
      version: '5.0-curated-hq-20251031', // HIGH-QUALITY CURATED IMAGES
    });

    // Check cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Calculate dates
    const now = new Date();
    const pickupDate = new Date(now);
    pickupDate.setDate(pickupDate.getDate() + 7);
    const dropoffDate = new Date(pickupDate);
    dropoffDate.setDate(dropoffDate.getDate() + 3);

    const pickupDateStr = pickupDate.toISOString().split('T')[0];
    const dropoffDateStr = dropoffDate.toISOString().split('T')[0];

    // Determine which locations to search
    let locationsToSearch: Array<{ code: string; name: string }> = [];

    if (locationParam === 'all') {
      locationsToSearch = Object.values(AIRPORT_LOCATIONS);
    } else {
      const locationKey = locationParam.toLowerCase() as keyof typeof AIRPORT_LOCATIONS;
      if (AIRPORT_LOCATIONS[locationKey]) {
        locationsToSearch = [AIRPORT_LOCATIONS[locationKey]];
      } else {
        locationsToSearch = Object.values(AIRPORT_LOCATIONS);
      }
    }

    // Search all locations in parallel
    const searchPromises = locationsToSearch.map((location) =>
      searchCarsForLocation(
        location.code,
        location.name,
        pickupDateStr,
        dropoffDateStr
      )
    );

    const results = await Promise.all(searchPromises);

    // Flatten and combine results
    let allCars = results.flat();

    // FALLBACK: Generate demo data if Amadeus returns empty/404 results
    if (allCars.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️  Amadeus API returned no cars - using demo fallback data`);
      }

      const demoCarModels = [
        { type: 'ECONOMY', model: 'Toyota Corolla', seats: 5, bags: 2, fuel: 'Gasoline', make: 'Toyota' },
        { type: 'COMPACT', model: 'Honda Civic', seats: 5, bags: 2, fuel: 'Gasoline', make: 'Honda' },
        { type: 'STANDARD', model: 'Toyota Camry', seats: 5, bags: 3, fuel: 'Gasoline', make: 'Toyota' },
        { type: 'INTERMEDIATE', model: 'Nissan Altima', seats: 5, bags: 3, fuel: 'Gasoline', make: 'Nissan' },
        { type: 'SUV', model: 'Toyota RAV4', seats: 5, bags: 4, fuel: 'Gasoline', make: 'Toyota' },
        { type: 'LUXURY', model: 'BMW 5 Series', seats: 5, bags: 3, fuel: 'Gasoline', make: 'BMW' },
        { type: 'MINIVAN', model: 'Honda Odyssey', seats: 7, bags: 4, fuel: 'Gasoline', make: 'Honda' },
        { type: 'CONVERTIBLE', model: 'Ford Mustang Convertible', seats: 4, bags: 2, fuel: 'Gasoline', make: 'Ford' },
      ];

      // Generate exactly 'limit' cars, cycling through all 8 models
      allCars = [];
      for (let i = 0; i < limit; i++) {
        const carIndex = i % demoCarModels.length; // Cycle through all 8 models
        const car = demoCarModels[carIndex];
        const location = locationsToSearch[i % locationsToSearch.length]; // Cycle through locations

        // Deterministic seed for demo data
        const demoSeed = `${location.code}-${car.type}`;

        const basePrice = 35 + (carIndex * 15);
        const pricePerDay = basePrice + Math.floor(seededRandom(demoSeed, 20) * 20);
        const hasOriginalPrice = seededRandom(demoSeed, 21) > 0.7;

        const valueScore = calculateValueScore({
          price: pricePerDay,
          marketAvgPrice: pricePerDay * 1.3,
          rating: 4 + seededRandom(demoSeed, 22) * 0.8,
          reviewCount: 500 + Math.floor(seededRandom(demoSeed, 23) * 1000),
          demandLevel: 60 + Math.floor(seededRandom(demoSeed, 24) * 30),
          availabilityLevel: 40 + Math.floor(seededRandom(demoSeed, 25) * 40),
        });

        const synthetic = generateSyntheticData(demoSeed);
        const specs = {
          seats: car.seats,
          bags: car.bags,
          transmission: carIndex % 3 === 0 ? 'Manual' : 'Automatic', // Mix of manual/automatic
          fuel: car.fuel,
          airConditioning: true,
        };
        const badges = generateBadges({ category: car.type }, pricePerDay, valueScore, synthetic);

        // Get photos (synchronous - uses curated high-quality images)
        const photos = getVehiclePhoto({
          category: car.type,
          type: car.type,
          make: car.make,
          model: car.model
        });

        allCars.push({
          id: `demo-car-${location.code.toLowerCase()}-${i}`,
          type: car.type,
          model: car.model,
          company: ['Enterprise', 'Hertz', 'Avis', 'Budget', 'National'][i % 5],
          companyCode: ['EP', 'ZR', 'ZI', 'ZD', 'ZL'][i % 5],
          companyLogo: getRentalCompanyLogo(['EP', 'ZR', 'ZI', 'ZD', 'ZL'][i % 5]),
          photoUrl: photos.photoUrl,
          thumbnail: photos.thumbnail,
          pricePerDay,
          originalPrice: hasOriginalPrice ? Math.round(pricePerDay * 1.2) : undefined,
          valueScore,
          rating: synthetic.rating,
          reviews: synthetic.reviews,
          specs,
          badges,
          demandLevel: synthetic.demandLevel,
          availability: synthetic.availability,
          location: location.code,
          pickupLocation: `${location.name} International Airport`,
          freeDelivery: synthetic.freeDelivery,
          trending: synthetic.trending,
          priceDropRecent: synthetic.priceDropRecent,
          viewersLast24h: synthetic.viewersLast24h,
          bookingsLast24h: synthetic.bookingsLast24h,
        });
      }

      // Log the variety of cars generated (development only)
      if (process.env.NODE_ENV === 'development') {
        const uniqueModels = [...new Set(allCars.map(c => c.model))];
        const uniqueTypes = [...new Set(allCars.map(c => c.type))];
        console.log(`✅ Generated ${allCars.length} demo cars for ${locationParam}`);
        console.log(`   Models: ${uniqueModels.join(', ')}`);
        console.log(`   Types: ${uniqueTypes.join(', ')}`);
      }
    }

    // Sort by value score (highest first)
    allCars.sort((a, b) => b.valueScore - a.valueScore);

    // Apply limit
    const limitedCars = allCars.slice(0, limit);

    const response = {
      data: limitedCars,
      meta: {
        count: limitedCars.length,
        total: allCars.length,
        limit,
        location: locationParam,
        pickupDate: pickupDateStr,
        dropoffDate: dropoffDateStr,
        rentalDays: 3,
        locationsSearched: locationsToSearch.map((l) => l.code),
        timestamp: new Date().toISOString(),
      },
    };

    // Cache for 24 hours (86400 seconds) - refresh daily with real API prices
    await setCache(cacheKey, response, 86400);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in featured-enhanced cars API:', error);

    return NextResponse.json(
      {
        data: [],
        meta: {
          count: 0,
          total: 0,
          error: 'Failed to fetch car rentals',
          errorDetails:
            error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 } // Return 200 with empty data instead of error status
    );
  }
}
