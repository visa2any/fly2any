import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAmadeusClient } from '@/lib/flights/enhanced-amadeus-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 API Flight Details - Starting details search...');
    
    const flightId = params.id;

    if (!flightId) {
      return NextResponse.json({
        success: false,
        error: 'Flight ID is required'
      }, { status: 400 });
    }

    // Initialize enhanced Amadeus client
    const amadeusClient = new EnhancedAmadeusClient();

    // Get detailed flight information from real API
    const detailedFlight = await amadeusClient.getFlightDetails(flightId);

    console.log('✅ Flight details retrieved successfully');

    return NextResponse.json(detailedFlight);

  } catch (error) {
    console.error('❌ Error in flight details API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Flight not found',
      message: 'Unable to retrieve flight details from our system'
    }, { status: 404 });
  }
}