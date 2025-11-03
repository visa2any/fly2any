/**
 * TripMatch Apply Credits API
 *
 * POST /api/tripmatch/credits/apply - Apply credits to a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';

/**
 * POST /api/tripmatch/credits/apply
 *
 * Apply credits to a booking or member reservation
 *
 * Request body:
 * {
 *   amount: number; // Credits to apply (max: user's balance)
 *   tripId?: string; // Trip ID
 *   memberId?: string; // Member ID (for member-specific bookings)
 *   bookingId?: string; // Existing booking ID
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credit amount',
      }, { status: 400 });
    }

    if (!body.tripId && !body.bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Either tripId or bookingId is required',
      }, { status: 400 });
    }

    // Get user's credit balance
    const creditAccount = await sql`
      SELECT * FROM user_credits
      WHERE user_id = ${userId}
    `;

    if (creditAccount.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Credit account not found',
      }, { status: 404 });
    }

    const account = creditAccount[0];

    // Check if user has enough credits
    if (account.balance < body.amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credit balance',
        available: account.balance,
        requested: body.amount,
      }, { status: 400 });
    }

    // Get trip/member info
    let tripId = body.tripId;
    let memberId = body.memberId;

    if (body.bookingId) {
      const booking = await sql`
        SELECT trip_id, member_id FROM group_bookings
        WHERE id = ${body.bookingId}
      `;

      if (booking.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Booking not found',
        }, { status: 404 });
      }

      tripId = booking[0].trip_id;
      memberId = booking[0].member_id;
    }

    // Verify membership
    const membership = await sql`
      SELECT * FROM group_members
      WHERE trip_id = ${tripId} AND user_id = ${userId}
    `;

    if (membership.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'You are not a member of this trip',
      }, { status: 403 });
    }

    const member = membership[0];

    // Calculate credit value (1 credit = $0.10)
    const creditValueUSD = body.amount * 0.10;

    // Deduct credits from balance
    await sql`
      UPDATE user_credits
      SET
        balance = balance - ${body.amount},
        lifetime_spent = lifetime_spent + ${body.amount},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Log redemption transaction
    const transactionResult = await sql`
      INSERT INTO credit_transactions (
        user_id,
        amount,
        type,
        source,
        description,
        reference_type,
        reference_id,
        status,
        processed_at
      ) VALUES (
        ${userId},
        ${-body.amount},
        'redemption',
        'booking_payment',
        ${`Applied ${body.amount} credits ($${creditValueUSD.toFixed(2)}) to trip booking`},
        'trip',
        ${tripId},
        'completed',
        NOW()
      )
      RETURNING *
    `;

    const transaction = transactionResult[0];

    // Update member record with applied credits
    await sql`
      UPDATE group_members
      SET
        credits_applied = COALESCE(credits_applied, 0) + ${body.amount},
        updated_at = NOW()
      WHERE id = ${member.id}
    `;

    // Log activity
    await sql`
      INSERT INTO trip_activities (
        trip_id,
        user_id,
        activity_type,
        description,
        metadata
      ) VALUES (
        ${tripId},
        ${userId},
        'credits_applied',
        ${`Applied ${body.amount} credits ($${creditValueUSD.toFixed(2)})`},
        ${JSON.stringify({ amount: body.amount, valueUSD: creditValueUSD, transactionId: transaction.id })}
      )
    `;

    // Get updated balance
    const updatedAccount = await sql`
      SELECT balance FROM user_credits
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        creditsApplied: body.amount,
        valueUSD: creditValueUSD,
        remainingBalance: updatedAccount[0].balance,
        tripId,
        memberId: member.id,
      },
      message: `Successfully applied ${body.amount} credits ($${creditValueUSD.toFixed(2)}) to your booking!`,
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error applying credits:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to apply credits',
      message: error.message,
    }, { status: 500 });
  }
}
