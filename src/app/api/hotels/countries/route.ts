/**
 * Hotel Countries API Endpoint
 * GET /api/hotels/countries
 * 
 * Returns list of countries with ISO-2 codes based on LiteAPI structure
 */

import { NextRequest, NextResponse } from 'next/server';

// Countries based on LiteAPI structure
const countries = [
  {
    id: 'BR',
    name: 'Brasil',
    iso2: 'BR',
    iso3: 'BRA',
    continent: 'South America',
    currency: 'BRL',
    phoneCode: '+55',
    hotelCount: 15420,
    popularCities: ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza'],
    flag: '🇧🇷'
  },
  {
    id: 'US',
    name: 'United States',
    iso2: 'US',
    iso3: 'USA',
    continent: 'North America',
    currency: 'USD',
    phoneCode: '+1',
    hotelCount: 58340,
    popularCities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas'],
    flag: '🇺🇸'
  },
  {
    id: 'FR',
    name: 'France',
    iso2: 'FR',
    iso3: 'FRA',  
    continent: 'Europe',
    currency: 'EUR',
    phoneCode: '+33',
    hotelCount: 23180,
    popularCities: ['Paris', 'Nice', 'Lyon', 'Marseille'],
    flag: '🇫🇷'
  },
  {
    id: 'IT',
    name: 'Italy',
    iso2: 'IT',
    iso3: 'ITA',
    continent: 'Europe', 
    currency: 'EUR',
    phoneCode: '+39',
    hotelCount: 31250,
    popularCities: ['Rome', 'Milan', 'Venice', 'Florence'],
    flag: '🇮🇹'
  },
  {
    id: 'ES',
    name: 'Spain',
    iso2: 'ES',
    iso3: 'ESP',
    continent: 'Europe',
    currency: 'EUR', 
    phoneCode: '+34',
    hotelCount: 28450,
    popularCities: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
    flag: '🇪🇸'
  },
  {
    id: 'UK',
    name: 'United Kingdom',
    iso2: 'GB',
    iso3: 'GBR',
    continent: 'Europe',
    currency: 'GBP',
    phoneCode: '+44',
    hotelCount: 19780,
    popularCities: ['London', 'Edinburgh', 'Manchester', 'Liverpool'],
    flag: '🇬🇧'
  },
  {
    id: 'DE',
    name: 'Germany',
    iso2: 'DE',
    iso3: 'DEU',
    continent: 'Europe',
    currency: 'EUR',
    phoneCode: '+49',
    hotelCount: 22340,
    popularCities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
    flag: '🇩🇪'
  },
  {
    id: 'JP',
    name: 'Japan',
    iso2: 'JP',
    iso3: 'JPN',
    continent: 'Asia',
    currency: 'JPY',
    phoneCode: '+81',
    hotelCount: 18920,
    popularCities: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'],
    flag: '🇯🇵'
  },
  {
    id: 'CN',
    name: 'China',
    iso2: 'CN',
    iso3: 'CHN',
    continent: 'Asia',
    currency: 'CNY',
    phoneCode: '+86',
    hotelCount: 45680,
    popularCities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
    flag: '🇨🇳'
  },
  {
    id: 'AU',
    name: 'Australia',
    iso2: 'AU',
    iso3: 'AUS',
    continent: 'Oceania',
    currency: 'AUD',
    phoneCode: '+61',
    hotelCount: 12850,
    popularCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    flag: '🇦🇺'
  }
];

/**
 * GET /api/hotels/countries
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const continent = url.searchParams.get('continent');
    const currency = url.searchParams.get('currency');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    
    let filteredCountries = countries;
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCountries = countries.filter(country => 
        country.name.toLowerCase().includes(searchLower) ||
        country.iso2.toLowerCase().includes(searchLower) ||
        country.iso3.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by continent
    if (continent) {
      filteredCountries = filteredCountries.filter(country => 
        country.continent.toLowerCase() === continent.toLowerCase()
      );
    }
    
    // Filter by currency
    if (currency) {
      filteredCountries = filteredCountries.filter(country => 
        country.currency === currency.toUpperCase()
      );
    }
    
    // Apply limit
    filteredCountries = filteredCountries.slice(0, limit);

    return NextResponse.json({
      status: 'success',
      data: {
        countries: filteredCountries,
        totalCount: filteredCountries.length,
        continents: [...new Set(countries.map(c => c.continent))],
        currencies: [...new Set(countries.map(c => c.currency))]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'LiteAPI-compatible',
        searchQuery: search || null
      }
    });

  } catch (error) {
    console.error('Countries API error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch countries',
      data: null
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';