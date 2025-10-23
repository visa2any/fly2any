import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

// Mark this route as dynamic (it uses request params)
export const dynamic = 'force-dynamic';

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

    // Call Amadeus Car Rental API
    const result = await amadeusAPI.searchCarRentals({
      pickupLocationCode: pickupLocation,
      dropoffLocationCode: dropoffLocation || undefined,
      pickupDate,
      dropoffDate,
      pickupTime: pickupTime || '10:00:00',
      dropoffTime: dropoffTime || '10:00:00',
      driverAge: 30, // Default driver age
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in cars API:', error);

    // Fallback to mock data if Amadeus API fails
    console.log('🧪 Falling back to mock car rental data');
    const cars = [
      {
        id: '1',
        name: 'Toyota Camry',
        category: 'Sedan',
        company: 'Enterprise',
        passengers: 5,
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        pricePerDay: 45,
        features: ['AC', 'Bluetooth', 'GPS', 'USB'],
      },
      {
        id: '2',
        name: 'Honda CR-V',
        category: 'SUV',
        company: 'Hertz',
        passengers: 7,
        transmission: 'Automatic',
        fuelType: 'Hybrid',
        pricePerDay: 65,
        features: ['AC', 'Bluetooth', 'GPS', 'USB', 'Apple CarPlay'],
      },
    ];

    return NextResponse.json({ data: cars });
  }
}
