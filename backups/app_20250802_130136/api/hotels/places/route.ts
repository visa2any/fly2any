/**
 * Hotel Places API Endpoint
 * GET /api/hotels/places
 * 
 * Returns places and areas for hotel search based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Places/locations for hotel search
const places = [
  // Brasil - Principais destinos
  {
    id: 'place-rio-de-janeiro',
    name: 'Rio de Janeiro',
    type: 'city',
    country: 'Brasil',
    countryCode: 'BR',
    state: 'Rio de Janeiro',
    stateCode: 'RJ',
    coordinates: {
      latitude: -22.9068,
      longitude: -43.1729
    },
    hotelCount: 1247,
    averagePrice: 450,
    currency: 'BRL',
    description: 'Cidade Maravilhosa com praias icônicas',
    landmarks: ['Copacabana', 'Ipanema', 'Cristo Redentor', 'Pão de Açúcar'],
    airports: ['GIG', 'SDU'],
    popular: true,
    category: 'beach'
  },
  {
    id: 'place-sao-paulo',
    name: 'São Paulo',
    type: 'city',
    country: 'Brasil',
    countryCode: 'BR',
    state: 'São Paulo',
    stateCode: 'SP',
    coordinates: {
      latitude: -23.5505,
      longitude: -46.6333
    },
    hotelCount: 2156,
    averagePrice: 380,
    currency: 'BRL',
    description: 'Maior metrópole do Brasil e centro financeiro',
    landmarks: ['Avenida Paulista', 'Centro Histórico', 'Vila Madalena'],
    airports: ['GRU', 'CGH'],
    popular: true,
    category: 'business'
  },
  {
    id: 'place-salvador',
    name: 'Salvador',
    type: 'city',
    country: 'Brasil',
    countryCode: 'BR',
    state: 'Bahia',
    stateCode: 'BA',
    coordinates: {
      latitude: -12.9714,
      longitude: -38.5014
    },
    hotelCount: 567,
    averagePrice: 320,
    currency: 'BRL',
    description: 'Capital da Bahia rica em cultura e história',
    landmarks: ['Pelourinho', 'Farol da Barra', 'Mercado Modelo'],
    airports: ['SSA'],
    popular: true,
    category: 'cultural'
  },
  {
    id: 'place-fernando-noronha',
    name: 'Fernando de Noronha',
    type: 'island',
    country: 'Brasil',
    countryCode: 'BR',
    state: 'Pernambuco',
    stateCode: 'PE',
    coordinates: {
      latitude: -3.8536,
      longitude: -32.4297
    },
    hotelCount: 45,
    averagePrice: 650,
    currency: 'BRL',
    description: 'Arquipélago paradisíaco com natureza preservada',
    landmarks: ['Baía do Sancho', 'Dois Irmãos', 'Projeto Tamar'],
    airports: ['FEN'],
    popular: true,
    category: 'nature'
  },
  {
    id: 'place-fortaleza',
    name: 'Fortaleza',
    type: 'city',
    country: 'Brasil',
    countryCode: 'BR',
    state: 'Ceará',
    stateCode: 'CE',
    coordinates: {
      latitude: -3.7319,
      longitude: -38.5267
    },
    hotelCount: 423,
    averagePrice: 280,
    currency: 'BRL',
    description: 'Portal de entrada do Nordeste brasileiro',
    landmarks: ['Praia de Iracema', 'Centro Dragão do Mar', 'Mercado Central'],
    airports: ['FOR'],
    popular: true,
    category: 'beach'
  },
  
  // Internacional - Principais destinos
  {
    id: 'place-new-york',
    name: 'New York',
    type: 'city',
    country: 'United States',
    countryCode: 'US',
    state: 'New York',
    stateCode: 'NY',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    hotelCount: 1850,
    averagePrice: 300,
    currency: 'USD',
    description: 'A cidade que nunca dorme',
    landmarks: ['Times Square', 'Central Park', 'Statue of Liberty'],
    airports: ['JFK', 'LGA', 'EWR'],
    popular: true,
    category: 'urban'
  },
  {
    id: 'place-paris',
    name: 'Paris',
    type: 'city',
    country: 'France',
    countryCode: 'FR',
    state: 'Île-de-France',
    stateCode: 'IDF',
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522
    },
    hotelCount: 1240,
    averagePrice: 250,
    currency: 'EUR',
    description: 'Cidade da Luz e do romance',
    landmarks: ['Torre Eiffel', 'Louvre', 'Notre-Dame'],
    airports: ['CDG', 'ORY'],
    popular: true,
    category: 'cultural'
  },
  {
    id: 'place-london',
    name: 'London',
    type: 'city',
    country: 'United Kingdom',
    countryCode: 'GB',
    state: 'England',
    stateCode: 'ENG',
    coordinates: {
      latitude: 51.5074,
      longitude: -0.1278
    },
    hotelCount: 980,
    averagePrice: 280,
    currency: 'GBP',
    description: 'Capital histórica com tradição e modernidade',
    landmarks: ['Big Ben', 'Tower Bridge', 'Buckingham Palace'],
    airports: ['LHR', 'LGW', 'STN'],
    popular: true,
    category: 'cultural'
  }
];

/**
 * GET /api/hotels/places
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const country = url.searchParams.get('country');
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const popular = url.searchParams.get('popular') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    
    let filteredPlaces = places;
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPlaces = places.filter(place => 
        place.name.toLowerCase().includes(searchLower) ||
        place.country.toLowerCase().includes(searchLower) ||
        place.state.toLowerCase().includes(searchLower) ||
        place.description.toLowerCase().includes(searchLower) ||
        place.landmarks.some(landmark => 
          landmark.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Filter by country
    if (country) {
      filteredPlaces = filteredPlaces.filter(place => 
        place.countryCode === country.toUpperCase()
      );
    }
    
    // Filter by type
    if (type) {
      filteredPlaces = filteredPlaces.filter(place => 
        place.type === type.toLowerCase()
      );
    }
    
    // Filter by category
    if (category) {
      filteredPlaces = filteredPlaces.filter(place => 
        place.category === category.toLowerCase()
      );
    }
    
    // Filter by popularity
    if (popular) {
      filteredPlaces = filteredPlaces.filter(place => place.popular);
    }
    
    // Apply limit
    filteredPlaces = filteredPlaces.slice(0, limit);

    return NextResponse.json({
      status: 'success',
      data: {
        places: filteredPlaces,
        totalCount: filteredPlaces.length,
        suggestions: search ? filteredPlaces.slice(0, 5) : [],
        metadata: {
          countries: [...new Set(places.map(p => p.countryCode))],
          types: [...new Set(places.map(p => p.type))],
          categories: [...new Set(places.map(p => p.category))]
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible',
        searchQuery: search || null
      }
    });

  } catch (error) {
    console.error('Places API error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch places',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';