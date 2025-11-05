import { NextResponse } from 'next/server';

/**
 * GET /api/environment
 * Returns the current API environment configuration
 */
export async function GET() {
  // Check if API credentials are configured (not placeholders)
  const amadeusConfigured = !!(
    process.env.AMADEUS_API_KEY &&
    process.env.AMADEUS_API_SECRET &&
    !process.env.AMADEUS_API_KEY.includes('your_') &&
    !process.env.AMADEUS_API_KEY.includes('placeholder')
  );

  const databaseConfigured = !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('placeholder') &&
    !process.env.DATABASE_URL.includes('localhost')
  );

  const nextauthConfigured = !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_SECRET.length > 20
  );

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
                !process.env.DUFFEL_ACCESS_TOKEN?.startsWith('duffel_live_'),
    // Configuration status for banner
    amadeusConfigured,
    databaseConfigured,
    nextauthConfigured,
  };

  return NextResponse.json(environment, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  });
}
