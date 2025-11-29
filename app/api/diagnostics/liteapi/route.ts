import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';

/**
 * LiteAPI Diagnostic Test Endpoint
 * Tests LiteAPI connection and configuration
 *
 * Usage: GET /api/diagnostics/liteapi
 */
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.LITEAPI_ENVIRONMENT,
    apiKeyConfigured: !!process.env.LITEAPI_PUBLIC_KEY || !!process.env.LITEAPI_SANDBOX_PUBLIC_KEY,
    baseUrl: 'https://api.liteapi.travel/v3.0',
    tests: {},
  };

  console.log('🔍 Running LiteAPI diagnostics...');

  try {
    // Test 1: Check if API is configured
    diagnostics.tests.configuration = {
      status: liteAPI.isConfigured() ? 'PASS' : 'FAIL',
      details: liteAPI.getEnvironmentInfo(),
    };

    // Test 2: Try to get countries (simple test)
    try {
      const countries = await liteAPI.getCountries();
      diagnostics.tests.countryEndpoint = {
        status: 'PASS',
        count: countries.data.length,
        sample: countries.data.slice(0, 3),
      };
    } catch (error: any) {
      diagnostics.tests.countryEndpoint = {
        status: 'FAIL',
        error: error.message,
      };
    }

    // Test 3: Try to get hotels by location (New York)
    try {
      const { hotels } = await liteAPI.getHotelsByLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        limit: 5,
      });
      diagnostics.tests.hotelsByLocation = {
        status: 'PASS',
        count: hotels.length,
        sample: hotels.slice(0, 2).map(h => ({
          id: h.id,
          name: h.name,
          city: h.city,
        })),
      };
    } catch (error: any) {
      diagnostics.tests.hotelsByLocation = {
        status: 'FAIL',
        error: error.message,
        stack: error.stack,
      };
    }

    // Test 4: Try a simple rate search
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const checkIn = tomorrow.toISOString().split('T')[0];
      const checkOut = dayAfter.toISOString().split('T')[0];

      const results = await liteAPI.searchHotelsWithRates({
        latitude: 40.7128,
        longitude: -74.0060,
        checkinDate: checkIn,
        checkoutDate: checkOut,
        adults: 2,
        currency: 'USD',
        guestNationality: 'US',
        limit: 3,
      });

      diagnostics.tests.rateSearch = {
        status: 'PASS',
        count: results.hotels.length,
        sample: results.hotels.slice(0, 1).map(h => ({
          id: h.id,
          name: h.name,
          lowestPrice: h.lowestPrice,
          currency: h.currency,
        })),
      };
    } catch (error: any) {
      diagnostics.tests.rateSearch = {
        status: 'FAIL',
        error: error.message,
        stack: error.stack,
      };
    }

    // Overall status
    const failedTests = Object.values(diagnostics.tests).filter(
      (test: any) => test.status === 'FAIL'
    ).length;

    diagnostics.overallStatus = failedTests === 0 ? 'HEALTHY' : 'UNHEALTHY';
    diagnostics.failedTests = failedTests;
    diagnostics.totalTests = Object.keys(diagnostics.tests).length;

    console.log('✅ LiteAPI diagnostics complete:', diagnostics.overallStatus);

    return NextResponse.json(diagnostics, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('❌ LiteAPI diagnostics failed:', error);

    return NextResponse.json({
      ...diagnostics,
      overallStatus: 'ERROR',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
