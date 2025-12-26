import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { checkRateLimit, prebookRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiter';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

/**
 * Hotel Prebook API Endpoint
 *
 * POST /api/hotels/prebook
 *
 * Pre-books a hotel room to lock in the price and verify availability before payment.
 * This is a critical step in the booking flow that prevents:
 * - Price changes during checkout
 * - Availability issues at payment
 * - "Room just sold out" errors
 *
 * Industry Standard Flow:
 * 1. User selects room → Click "Continue"
 * 2. System calls prebook API → Locks price for 15 minutes
 * 3. User enters details → Timer shows countdown
 * 4. User pays → Uses prebookId to complete booking
 * 5. If timer expires → Re-prebook required
 *
 * Request Body:
 * {
 *   offerId: string;        // From LiteAPI rates search
 *   hotelId?: string;       // Optional for tracking
 *   checkIn?: string;       // Optional for tracking
 *   checkOut?: string;      // Optional for tracking
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     prebookId: string;              // Use this for final booking
 *     hotelId: string;
 *     offerId: string;
 *     status: 'confirmed' | 'pending' | 'failed';
 *     price: {
 *       amount: number;               // LOCKED PRICE
 *       currency: string;
 *     };
 *     expiresAt: string;              // ISO timestamp - when price lock expires
 *     hotelConfirmationCode?: string;
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // Rate limiting to prevent abuse
    const rateLimitResult = await checkRateLimit(request, prebookRateLimit);
    if (!rateLimitResult.success) {
      const headers = new Headers();
      addRateLimitHeaders(headers, rateLimitResult);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many prebook attempts',
          message: 'Please wait before trying again.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { offerId, hotelId, checkIn, checkOut } = body;

    // Validate required parameters
    if (!offerId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: offerId'
      }, { status: 400 });
    }

    console.log('🔒 Hotel Prebook Request:');
    console.log(`   Offer ID: ${offerId}`);
    if (hotelId) console.log(`   Hotel ID: ${hotelId}`);
    if (checkIn && checkOut) console.log(`   Dates: ${checkIn} → ${checkOut}`);

    // Call LiteAPI prebook endpoint with User Payment SDK enabled
    // This enables customers to pay directly via LiteAPI's secure payment portal
    const prebookResponse = await liteAPI.preBookHotel(offerId, {
      usePaymentSdk: true, // Enable LiteAPI User Payment SDK
    });

    // Check prebook status
    if (prebookResponse.status === 'failed') {
      console.error('❌ Prebook failed - room no longer available');
      return NextResponse.json({
        success: false,
        error: 'Room is no longer available',
        message: 'This room is no longer available. Please select another option.',
        code: 'ROOM_UNAVAILABLE'
      }, { status: 409 });
    }

    // Calculate time until expiry
    const expiresAt = new Date(prebookResponse.expiresAt);
    const now = new Date();
    const timeUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000); // seconds

    console.log('✅ Prebook successful!');
    console.log(`   Prebook ID: ${prebookResponse.prebookId}`);
    console.log(`   Status: ${prebookResponse.status}`);
    console.log(`   Locked Price: ${prebookResponse.price.amount} ${prebookResponse.price.currency}`);
    console.log(`   Expires At: ${prebookResponse.expiresAt}`);
    console.log(`   Time Until Expiry: ${Math.floor(timeUntilExpiry / 60)} minutes`);

    // Log User Payment SDK info if available
    if (prebookResponse.secretKey) {
      console.log(`   Payment SDK: Enabled`);
      console.log(`   Transaction ID: ${prebookResponse.transactionId}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...prebookResponse,
        // Ensure secretKey and transactionId are included for SDK
        secretKey: prebookResponse.secretKey,
        transactionId: prebookResponse.transactionId,
      },
      meta: {
        timeUntilExpiry, // seconds until expiry
        expiryMinutes: Math.floor(timeUntilExpiry / 60),
        expirySeconds: timeUntilExpiry % 60,
        paymentSdkEnabled: !!prebookResponse.secretKey,
      }
    });
  }, { category: ErrorCategory.BOOKING, severity: ErrorSeverity.CRITICAL });
}

/**
 * GET /api/hotels/prebook?prebookId=xxx
 *
 * Check the status of an existing prebook (verify it hasn't expired)
 *
 * Query Parameters:
 * - prebookId: string
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     valid: boolean;
 *     expired: boolean;
 *     expiresAt: string;
 *     timeRemaining: number; // seconds
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const searchParams = request.nextUrl.searchParams;
    const prebookId = searchParams.get('prebookId');
    const expiresAt = searchParams.get('expiresAt');

    if (!prebookId || !expiresAt) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: prebookId and expiresAt'
      }, { status: 400 });
    }

    // Check if expired
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const expired = now >= expiryDate;
    const timeRemaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      success: true,
      data: {
        prebookId,
        valid: !expired,
        expired,
        expiresAt,
        timeRemaining, // seconds
        timeRemainingMinutes: Math.floor(timeRemaining / 60),
        timeRemainingSeconds: timeRemaining % 60,
      }
    });
  }, { category: ErrorCategory.BOOKING, severity: ErrorSeverity.NORMAL });
}
