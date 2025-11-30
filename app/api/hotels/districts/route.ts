import { NextRequest, NextResponse } from 'next/server';
import { cityLocations, getCityData } from '@/lib/data/city-locations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/hotels/districts?city=dubai
 * Returns popular districts for a specific city
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');

    if (!city) {
      // Return all cities with their districts
      const allCities = Object.entries(cityLocations).map(([key, data]) => ({
        city: key.charAt(0).toUpperCase() + key.slice(1),
        cityKey: key,
        districts: data.popularDistricts,
        center: data.center,
        airport: data.airport,
      }));

      return NextResponse.json({
        success: true,
        data: allCities,
        meta: { count: allCities.length },
      }, {
        headers: {
          'Cache-Control': 'public, max-age=86400', // 24 hours
        }
      });
    }

    // Get districts for specific city
    const cityData = getCityData(city);

    if (!cityData) {
      return NextResponse.json({
        success: true,
        data: [],
        message: `No district data available for "${city}"`,
      });
    }

    // Return districts with location data for direct search
    const districts = cityData.popularDistricts.map((district, idx) => ({
      id: `${city.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
      name: district,
      city: city.charAt(0).toUpperCase() + city.slice(1),
      location: cityData.center, // Use city center as approximate location
    }));

    return NextResponse.json({
      success: true,
      data: districts,
      meta: {
        city,
        count: districts.length,
        airport: cityData.airport,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // 1 hour
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching districts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}
