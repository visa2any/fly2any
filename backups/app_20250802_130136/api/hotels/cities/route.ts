/**
 * Hotel Cities API Endpoint
 * GET /api/hotels/cities
 * 
 * Returns available cities based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Popular Brazilian cities for hotel booking
const cities = [
  {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    countryCode: 'BR',
    coordinates: {
      latitude: -22.9068,
      longitude: -43.1729
    },
    hotelCount: 1247,
    averagePrice: 450,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    iataCode: 'GIG',
    popular: true
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    countryCode: 'BR',
    coordinates: {
      latitude: -23.5505,
      longitude: -46.6333
    },
    hotelCount: 2156,
    averagePrice: 380,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    iataCode: 'GRU',
    popular: true
  },
  {
    id: 'salvador',
    name: 'Salvador',
    state: 'BA',
    country: 'Brasil',
    countryCode: 'BR',
    coordinates: {
      latitude: -12.9714,
      longitude: -38.5014
    },
    hotelCount: 567,
    averagePrice: 320,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    iataCode: 'SSA',
    popular: true
  },
  {
    id: 'fortaleza',
    name: 'Fortaleza',
    state: 'CE',
    country: 'Brasil',
    countryCode: 'BR',
    coordinates: {
      latitude: -3.7319,
      longitude: -38.5267
    },
    hotelCount: 423,
    averagePrice: 280,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    iataCode: 'FOR',
    popular: true
  },
  {
    id: 'recife',
    name: 'Recife',
    state: 'PE',
    country: 'Brasil',
    countryCode: 'BR',
    coordinates: {
      latitude: -8.0476,
      longitude: -34.8770
    },
    hotelCount: 334,
    averagePrice: 290,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    iataCode: 'REC',
    popular: true
  },
  {
    id: 'fernando-de-noronha',
    name: 'Fernando de Noronha',
    state: 'PE',
    country: 'Brasil',
    countryCode: 'BR',
    coordinates: {
      latitude: -3.8536,
      longitude: -32.4297
    },
    hotelCount: 45,
    averagePrice: 650,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    iataCode: 'FEN',
    popular: true
  }
];

/**
 * GET /api/hotels/cities
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const country = url.searchParams.get('country');
    const popular = url.searchParams.get('popular') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    
    let filteredCities = cities;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCities = cities.filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.state.toLowerCase().includes(searchLower)
      );
    }
    
    if (country) {
      filteredCities = filteredCities.filter(city => 
        city.countryCode === country.toUpperCase()
      );
    }
    
    if (popular) {
      filteredCities = filteredCities.filter(city => city.popular);
    }
    
    // Apply limit
    filteredCities = filteredCities.slice(0, limit);

    return NextResponse.json({
      status: 'success',
      data: {
        cities: filteredCities,
        totalCount: filteredCities.length,
        countries: [...new Set(cities.map(c => c.countryCode))]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible',
        searchQuery: search || null
      }
    });

  } catch (error) {
    console.error('Cities API error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch cities',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';