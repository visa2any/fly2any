import { NextResponse } from 'next/server';

/**
 * GET /api/environment
 * Returns the current API environment configuration
 */
export async function GET() {
  const environment = {
    amadeus: {
      mode: process.env.AMADEUS_ENVIRONMENT || 'test',
      isProduction: process.env.AMADEUS_ENVIRONMENT === 'production',
      baseUrl: process.env.AMADEUS_ENVIRONMENT === 'production'
        ? 'https://api.amadeus.com'
        : 'https://test.api.amadeus.com'
    },
    duffel: {
      mode: process.env.DUFFEL_ACCESS_TOKEN?.startsWith('duffel_live_') ? 'production' : 'test',
      isProduction: process.env.DUFFEL_ACCESS_TOKEN?.startsWith('duffel_live_') || false
    },
    nodeEnv: process.env.NODE_ENV || 'development',
    isTestData: (process.env.AMADEUS_ENVIRONMENT !== 'production') ||
                !process.env.DUFFEL_ACCESS_TOKEN?.startsWith('duffel_live_')
  };

  return NextResponse.json(environment, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  });
}
