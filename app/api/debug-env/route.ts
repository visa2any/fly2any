import { NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Check environment variable status
 * This endpoint helps diagnose why Amadeus API might be using mock data
 */
export async function GET() {
  const envStatus = {
    AMADEUS_API_KEY: !!process.env.AMADEUS_API_KEY,
    AMADEUS_API_SECRET: !!process.env.AMADEUS_API_SECRET,
    AMADEUS_ENVIRONMENT: process.env.AMADEUS_ENVIRONMENT || 'not set',
    NODE_ENV: process.env.NODE_ENV,
    runtime: 'nodejs', // This route uses Node.js runtime
    timestamp: new Date().toISOString(),
  };

  // Only show first few characters for security
  if (process.env.AMADEUS_API_KEY) {
    envStatus.AMADEUS_API_KEY_PREVIEW = process.env.AMADEUS_API_KEY.substring(0, 10) + '...';
  }

  return NextResponse.json(envStatus);
}

// Use Node.js runtime to ensure env vars are accessible
export const runtime = 'nodejs';
