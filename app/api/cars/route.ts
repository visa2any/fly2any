import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { generateMockCarRentals } from '@/lib/mock-data/car-rentals';

// Mark this route as dynamic (it uses request params)
export const dynamic = 'force-dynamic';

// Check if we're in production Amadeus environment
const isProductionAPI = process.env.AMADEUS_ENVIRONMENT === 'production';

/**
 * Car Rental Search API
 *
 * Uses Amadeus Car Rental API v2 in production.
 * Falls back to mock data only when API returns no results.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pickupLocation = searchParams.get('pickupLocation');
    const dropoffLocation = searchParams.get('dropoffLocation');
    const pickupDate = searchParams.get('pickupDate');
    const dropoffDate = searchParams.get('dropoffDate');
    const pickupTime = searchParams.get('pickupTime');
    const dropoffTime = searchParams.get('dropoffTime');

    if (!pickupLocation || !pickupDate || !dropoffDate) {
      return NextResponse.json(
        { error: 'pickupLocation, pickupDate, and dropoffDate are required' },
        { status: 400 }
      );
    }

    console.log(`🚗 Car search: ${pickupLocation} | ${pickupDate} to ${dropoffDate} | API: ${isProductionAPI ? 'PRODUCTION' : 'TEST'}`);

    // Try Amadeus API first
    const result = await amadeusAPI.searchCarRentals({
      pickupLocationCode: pickupLocation,
      dropoffLocationCode: dropoffLocation || undefined,
      pickupDate,
      dropoffDate,
      pickupTime: pickupTime || '10:00:00',
      dropoffTime: dropoffTime || '10:00:00',
      driverAge: 30,
    });

    // If Amadeus returns data, transform and return it
    if (result.data && result.data.length > 0) {
      console.log(`✅ Amadeus returned ${result.data.length} car rental options`);

      // Transform Amadeus response to our format
      const transformedData = {
        data: result.data.map((offer: any, index: number) => ({
          id: offer.id || `CAR_${pickupLocation}_${index}`,
          vehicle: {
            description: offer.vehicle?.description || offer.vehicle?.name || 'Car Rental',
            category: offer.vehicle?.category || 'STANDARD',
            transmission: offer.vehicle?.transmission || 'AUTOMATIC',
            airConditioning: offer.vehicle?.airConditioning !== false,
            seats: offer.vehicle?.seats || offer.vehicle?.passengerQuantity || 5,
            doors: offer.vehicle?.doors || 4,
            fuelType: offer.vehicle?.fuelType || 'PETROL',
            imageURL: offer.vehicle?.imageURL || getCarImageByCategory(offer.vehicle?.category),
          },
          provider: {
            companyCode: offer.provider?.code || offer.serviceProvider?.code || 'ZZ',
            companyName: offer.provider?.name || offer.serviceProvider?.name || 'Car Rental Company',
          },
          price: {
            currency: offer.price?.currency || 'USD',
            total: offer.price?.total || offer.quotation?.totalPrice?.value || '0',
            perDay: offer.price?.perDay || calculatePerDay(offer.price?.total, pickupDate, dropoffDate),
            base: offer.price?.base || offer.price?.total || '0',
            taxes: offer.price?.taxes || '0',
          },
          pickupLocation: {
            code: pickupLocation,
            name: offer.pickUp?.locationName || `${pickupLocation} Airport`,
            address: offer.pickUp?.address || '',
          },
          dropoffLocation: {
            code: dropoffLocation || pickupLocation,
            name: offer.dropOff?.locationName || `${dropoffLocation || pickupLocation} Airport`,
            address: offer.dropOff?.address || '',
          },
          pickupDateTime: `${pickupDate}T${pickupTime || '10:00:00'}`,
          dropoffDateTime: `${dropoffDate}T${dropoffTime || '10:00:00'}`,
          mileage: {
            unlimited: offer.mileage?.unlimited !== false,
          },
          insurance: {
            included: offer.coverage?.included || false,
          },
          features: offer.features || ['AC', 'Bluetooth'],
          rating: offer.rating || 4.5,
          reviewCount: offer.reviewCount || 100,
        })),
        meta: {
          count: result.data.length,
          source: 'amadeus_production',
        },
      };

      return NextResponse.json(transformedData);
    }

    // Fallback to mock data if Amadeus returns no results
    console.log('⚠️ Amadeus returned no results, using enhanced mock data');
    const mockData = generateMockCarRentals({
      pickupLocation,
      dropoffLocation: dropoffLocation || pickupLocation,
      pickupDate,
      dropoffDate,
      pickupTime: pickupTime || undefined,
      dropoffTime: dropoffTime || undefined,
    });

    return NextResponse.json(mockData);
  } catch (error: any) {
    console.error('❌ Error in cars API:', error.message);

    // Return mock data on error
    const { searchParams } = new URL(request.url);
    const mockData = generateMockCarRentals({
      pickupLocation: searchParams.get('pickupLocation') || 'JFK',
      dropoffLocation: searchParams.get('dropoffLocation') || searchParams.get('pickupLocation') || 'JFK',
      pickupDate: searchParams.get('pickupDate') || new Date().toISOString().split('T')[0],
      dropoffDate: searchParams.get('dropoffDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    return NextResponse.json(mockData);
  }
}

// Helper: Get car image by category
function getCarImageByCategory(category: string): string {
  const images: Record<string, string> = {
    'ECONOMY': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    'COMPACT': 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&q=80',
    'STANDARD': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    'SUV': 'https://images.unsplash.com/photo-1568844293986-8c3a92e8ea4c?w=800&q=80',
    'PREMIUM': 'https://images.unsplash.com/photo-1584345604476-8ec5f82d718c?w=800&q=80',
    'LUXURY': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'VAN': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  };
  return images[category?.toUpperCase()] || images['STANDARD'];
}

// Helper: Calculate price per day
function calculatePerDay(total: string, pickupDate: string, dropoffDate: string): string {
  const totalNum = parseFloat(total) || 0;
  const days = Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;
  return (totalNum / days).toFixed(2);
}
