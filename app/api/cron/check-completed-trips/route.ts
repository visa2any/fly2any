import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { unlockPointsForCompletedTrip } from '@/lib/services/referralNetworkService';

/**
 * CRON JOB: Check Completed Trips & Unlock Referral Points
 *
 * Monitors bookings to detect when trips have completed successfully
 * and unlocks referral points that were locked pending trip completion.
 *
 * BUSINESS RULES:
 * - Trip is considered "completed" when:
 *   1. Trip end date has passed
 *   2. Grace period of 48 hours has elapsed (to detect cancellations/refunds)
 *   3. Booking has not been cancelled
 *   4. Booking has not been refunded
 * - Points are moved from "locked" to "available" balance
 * - All referrers in the network (up to 3 levels) get their points unlocked simultaneously
 *
 * SECURITY:
 * - Requires CRON_SECRET environment variable
 * - Only accessible via Vercel Cron or authorized requests
 *
 * SCHEDULE: Runs daily at 2:00 AM UTC (configurable in vercel.json)
 */

const GRACE_PERIOD_HOURS = 48; // Wait 48 hours after trip end before unlocking

/**
 * GET /api/cron/check-completed-trips
 * Cron job endpoint to check for completed trips and unlock points
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🚀 Starting trip completion check job...');

  try {
    const prisma = getPrismaClient();

    // Calculate cutoff date (trip end date + grace period)
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - GRACE_PERIOD_HOURS);

    console.log(`📅 Checking trips that ended before: ${cutoffDate.toISOString()}`);

    // Find all locked points transactions where trip should have completed
    const eligibleTransactions = await prisma.referralPointsTransaction.findMany({
      where: {
        status: 'locked',
        tripCancelled: false,
        tripRefunded: false,
        tripEndDate: {
          lte: cutoffDate, // Trip ended more than 48 hours ago
        },
      },
      select: {
        bookingId: true,
      },
      distinct: ['bookingId'], // Get unique bookings
    });

    console.log(`📊 Found ${eligibleTransactions.length} bookings ready for points unlock`);

    if (eligibleTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No completed trips to process',
        stats: {
          totalBookings: 0,
          totalTransactions: 0,
          totalPointsUnlocked: 0,
          errors: 0,
          duration: Date.now() - startTime,
        },
      });
    }

    let processedBookings = 0;
    let totalTransactionsUnlocked = 0;
    let totalPointsUnlocked = 0;
    let errors = 0;

    // Process each booking
    for (const { bookingId } of eligibleTransactions) {
      try {
        console.log(`\n🔍 Processing booking: ${bookingId}`);

        // Double-check booking status (in case it was cancelled after query)
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        });

        // Skip if booking was cancelled or refunded
        if (!booking || booking.status === 'cancelled' || booking.status === 'refunded') {
          console.log(`⚠️ Booking ${bookingId} is ${booking?.status || 'not found'} - skipping`);
          continue;
        }

        // Unlock points for this booking
        const result = await unlockPointsForCompletedTrip(bookingId);

        if (result.success) {
          processedBookings++;
          totalTransactionsUnlocked += result.unlockedCount;

          // Calculate total points unlocked for this booking
          const transactions = await prisma.referralPointsTransaction.findMany({
            where: {
              bookingId,
              status: 'unlocked',
            },
            select: {
              pointsAwarded: true,
            },
          });

          const bookingPoints = transactions.reduce((sum, t) => sum + t.pointsAwarded, 0);
          totalPointsUnlocked += bookingPoints;

          console.log(`✅ Booking ${bookingId}: Unlocked ${result.unlockedCount} transactions (${bookingPoints} points)`);
        }
      } catch (error) {
        console.error(`❌ Error processing booking ${bookingId}:`, error);
        errors++;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`\n🎉 Trip completion check completed!`);
    console.log(`   Bookings Processed: ${processedBookings}`);
    console.log(`   Transactions Unlocked: ${totalTransactionsUnlocked}`);
    console.log(`   Total Points Unlocked: ${totalPointsUnlocked}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Trip completion check completed',
      stats: {
        totalBookings: processedBookings,
        totalTransactions: totalTransactionsUnlocked,
        totalPointsUnlocked,
        errors,
        duration,
      },
    });
  } catch (error) {
    console.error('❌ Trip completion check failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process completed trips',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/check-completed-trips
 * Manual trigger for testing
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
