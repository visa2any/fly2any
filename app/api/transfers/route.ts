import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const { startLocationCode, endAddressLine, transferType, startDateTime, passengers } = await request.json();

    if (!startLocationCode || !endAddressLine) {
      return NextResponse.json(
        { error: 'Start location code and end address are required' },
        { status: 400 }
      );
    }

    console.log('🚗 Fetching airport transfers:', { startLocationCode, endAddressLine });

    const transfersData = await amadeusAPI.searchTransfers({
      startLocationCode,
      endAddressLine,
      transferType: transferType || 'PRIVATE',
      startDateTime: startDateTime || new Date().toISOString(),
      passengers: passengers || 1,
    });

    console.log('✅ Successfully fetched transfers');

    return NextResponse.json(transfersData);
  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.HIGH });
}
