import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// Mock transfer data - will integrate with real API later
const TRANSFER_TYPES = [
  { id: 'private-sedan', name: 'Private Sedan', maxPassengers: 3, icon: '🚗', category: 'private' },
  { id: 'private-suv', name: 'Private SUV', maxPassengers: 5, icon: '🚙', category: 'private' },
  { id: 'private-van', name: 'Private Van', maxPassengers: 7, icon: '🚐', category: 'private' },
  { id: 'luxury-sedan', name: 'Luxury Sedan', maxPassengers: 3, icon: '🚘', category: 'luxury' },
  { id: 'luxury-suv', name: 'Luxury SUV', maxPassengers: 5, icon: '✨', category: 'luxury' },
  { id: 'shuttle', name: 'Shared Shuttle', maxPassengers: 10, icon: '🚌', category: 'shared' },
  { id: 'minibus', name: 'Minibus', maxPassengers: 16, icon: '🚎', category: 'group' },
];

function generateTransfers(pickup: string, dropoff: string, passengers: number) {
  const basePrice = 35 + Math.random() * 50;
  const distanceMultiplier = 1 + Math.random() * 0.5;

  return TRANSFER_TYPES
    .filter(t => t.maxPassengers >= passengers)
    .map(t => {
      let price = basePrice * distanceMultiplier;
      if (t.category === 'luxury') price *= 2.5;
      if (t.category === 'shared') price *= 0.4;
      if (t.category === 'group') price *= 1.5;

      // Add markup (35% min $25)
      const finalPrice = price + Math.max(price * 0.35, 25);

      return {
        id: `${t.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: t.id,
        name: t.name,
        icon: t.icon,
        category: t.category,
        maxPassengers: t.maxPassengers,
        pickup,
        dropoff,
        price: { amount: finalPrice.toFixed(2), currency: 'USD' },
        duration: `${Math.floor(20 + Math.random() * 40)} min`,
        rating: (4 + Math.random()).toFixed(1),
        features: t.category === 'luxury'
          ? ['WiFi', 'Water bottles', 'Meet & greet', 'Flight tracking']
          : t.category === 'private'
          ? ['Meet & greet', 'Flight tracking']
          : ['Air conditioning'],
        cancellation: t.category === 'shared' ? '24h before' : 'Free up to 48h',
      };
    });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pickup = searchParams.get('pickup') || '';
    const dropoff = searchParams.get('dropoff') || '';
    const date = searchParams.get('date') || '';
    const passengers = parseInt(searchParams.get('passengers') || '1');

    if (!pickup || !dropoff) {
      return NextResponse.json({ error: 'pickup and dropoff required' }, { status: 400 });
    }

    const cacheKey = generateCacheKey('transfers:search', { pickup, dropoff, date, passengers });
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const transfers = generateTransfers(pickup, dropoff, passengers);
    const response = {
      data: transfers,
      meta: { count: transfers.length, pickup, dropoff, date, passengers }
    };

    await setCache(cacheKey, response, 3600); // 1hr cache

    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
  } catch (error: any) {
    console.error('Transfers search error:', error);
    return NextResponse.json({ error: 'Failed to search transfers' }, { status: 500 });
  }
}
