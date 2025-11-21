/**
 * Commission Lifecycle Service
 *
 * Handles the automatic progression of commissions through their lifecycle:
 * pending → trip_in_progress → trip_completed → in_hold_period → available → paid
 *
 * Key Features:
 * - Smart hold periods based on affiliate category + trust level
 * - Only pay when trip completes successfully (no cancellations/refunds)
 * - Automatic status progression
 * - Trust score calculation
 * - Lifecycle audit logging
 */

import { getPrismaClient } from '@/lib/prisma'

const prisma = getPrismaClient()

/**
 * Process commissions that need to start their trip
 * Moves: pending → trip_in_progress
 */
export async function startTripsInProgress() {
  try {
    const now = new Date()

    // Find commissions with trips starting today or earlier
    const commissionsToStart = await prisma!.commission.findMany({
      where: {
        status: 'pending',
        tripStartDate: { lte: now },
      },
      include: {
        affiliate: {
          select: { id: true, referralCode: true },
        },
      },
    })

    console.log(`🚀 Found ${commissionsToStart.length} trips starting...`)

    let updated = 0

    for (const commission of commissionsToStart) {
      try {
        // Update commission status
        await prisma!.commission.update({
          where: { id: commission.id },
          data: {
            status: 'trip_in_progress',
            tripStartedAt: now,
          },
        })

        // Log lifecycle change
        await prisma!.commissionLifecycleLog.create({
          data: {
            commissionId: commission.id,
            fromStatus: 'pending',
            toStatus: 'trip_in_progress',
            reason: `Trip started automatically (scheduled start: ${commission.tripStartDate.toISOString().split('T')[0]})`,
            automated: true,
          },
        })

        updated++
        console.log(`  ✅ Trip started: ${commission.affiliate.referralCode} | ${commission.id.substring(0, 8)}`)
      } catch (error) {
        console.error(`  ❌ Error starting trip ${commission.id}:`, error)
      }
    }

    console.log(`✅ Started ${updated}/${commissionsToStart.length} trips\n`)

    return { success: true, processed: updated, total: commissionsToStart.length }
  } catch (error) {
    console.error('Error in startTripsInProgress:', error)
    return { success: false, processed: 0, total: 0, error: 'Failed to start trips' }
  }
}

/**
 * Process commissions that have completed their trip
 * Moves: trip_in_progress → trip_completed → in_hold_period
 */
export async function completeFinishedTrips() {
  try {
    const now = new Date()

    // Find commissions with trips ending today or earlier
    const commissionsToComplete = await prisma!.commission.findMany({
      where: {
        status: 'trip_in_progress',
        tripEndDate: { lte: now },
        isFraud: false, // Don't complete fraudulent bookings
      },
      include: {
        affiliate: {
          select: {
            id: true,
            referralCode: true,
            category: true,
            trustLevel: true,
            customHoldPeriod: true,
          },
        },
      },
    })

    console.log(`🏁 Found ${commissionsToComplete.length} trips completed...`)

    let updated = 0

    for (const commission of commissionsToComplete) {
      try {
        // Get hold period (already stored in commission, but recalculate in case it changed)
        const holdPeriodDays = commission.holdPeriodDays

        // Calculate when hold period ends
        const holdPeriodEndsAt = new Date(now)
        holdPeriodEndsAt.setDate(holdPeriodEndsAt.getDate() + holdPeriodDays)

        // Update commission status
        await prisma!.commission.update({
          where: { id: commission.id },
          data: {
            status: 'in_hold_period',
            tripCompletedAt: now,
            holdPeriodEndsAt,
          },
        })

        // Log lifecycle change
        await prisma!.commissionLifecycleLog.create({
          data: {
            commissionId: commission.id,
            fromStatus: 'trip_in_progress',
            toStatus: 'in_hold_period',
            reason: `Trip completed successfully. Hold period: ${holdPeriodDays} days (ends ${holdPeriodEndsAt.toISOString().split('T')[0]})`,
            automated: true,
            metadata: {
              holdPeriodDays,
              holdPeriodEndsAt: holdPeriodEndsAt.toISOString(),
            },
          },
        })

        updated++
        console.log(`  ✅ Trip completed: ${commission.affiliate.referralCode} | ${commission.id.substring(0, 8)} | Hold: ${holdPeriodDays}d`)
      } catch (error) {
        console.error(`  ❌ Error completing trip ${commission.id}:`, error)
      }
    }

    console.log(`✅ Completed ${updated}/${commissionsToComplete.length} trips\n`)

    return { success: true, processed: updated, total: commissionsToComplete.length }
  } catch (error) {
    console.error('Error in completeFinishedTrips:', error)
    return { success: false, processed: 0, total: 0, error: 'Failed to complete trips' }
  }
}

/**
 * Process commissions whose hold period has expired
 * Moves: in_hold_period → available
 */
export async function releaseFromHoldPeriod() {
  try {
    const now = new Date()

    // Find commissions with expired hold periods
    const commissionsToRelease = await prisma!.commission.findMany({
      where: {
        status: 'in_hold_period',
        holdPeriodEndsAt: { lte: now },
        isFraud: false,
        cancelledAt: null,
        refundedAt: null,
      },
      include: {
        affiliate: {
          select: { id: true, referralCode: true, successfulBookingsCount: true },
        },
      },
    })

    console.log(`💰 Found ${commissionsToRelease.length} commissions ready for release...`)

    let updated = 0

    for (const commission of commissionsToRelease) {
      try {
        // Update commission status
        await prisma!.commission.update({
          where: { id: commission.id },
          data: {
            status: 'available',
          },
        })

        // Move from pending to current balance
        await prisma!.affiliate.update({
          where: { id: commission.affiliateId },
          data: {
            pendingBalance: { decrement: commission.totalCommissionAmount },
            currentBalance: { increment: commission.totalCommissionAmount },
            successfulBookingsCount: { increment: 1 },
            completedTrips: { increment: 1 },
            monthlyCompletedTrips: { increment: 1 },
          },
        })

        // Update referral status
        await prisma!.affiliateReferral.updateMany({
          where: {
            bookingId: commission.bookingId,
          },
          data: {
            status: 'completed',
            convertedAt: now,
          },
        })

        // Update trust score
        await updateTrustScore(commission.affiliateId)

        // Log lifecycle change
        await prisma!.commissionLifecycleLog.create({
          data: {
            commissionId: commission.id,
            fromStatus: 'in_hold_period',
            toStatus: 'available',
            reason: `Hold period expired. Commission now available for payout.`,
            automated: true,
            metadata: {
              amount: commission.totalCommissionAmount,
            },
          },
        })

        updated++
        console.log(`  ✅ Released: ${commission.affiliate.referralCode} | $${commission.totalCommissionAmount.toFixed(2)}`)
      } catch (error) {
        console.error(`  ❌ Error releasing commission ${commission.id}:`, error)
      }
    }

    console.log(`✅ Released ${updated}/${commissionsToRelease.length} commissions\n`)

    return { success: true, processed: updated, total: commissionsToRelease.length }
  } catch (error) {
    console.error('Error in releaseFromHoldPeriod:', error)
    return { success: false, processed: 0, total: 0, error: 'Failed to release commissions' }
  }
}

/**
 * Handle booking cancellation
 * Moves commission to 'cancelled' and removes from balances
 */
export async function handleBookingCancellation(
  commissionId: string,
  reason: string,
  cancelledBy?: string
) {
  try {
    const commission = await prisma!.commission.findUnique({
      where: { id: commissionId },
      include: {
        affiliate: { select: { id: true, referralCode: true } },
      },
    })

    if (!commission) {
      return { success: false, error: 'Commission not found' }
    }

    // Only cancel if not already paid
    if (commission.status === 'paid') {
      return { success: false, error: 'Cannot cancel paid commission' }
    }

    const originalStatus = commission.status

    // Update commission
    await prisma!.commission.update({
      where: { id: commissionId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    })

    // Remove from pending balance if applicable
    if (['pending', 'trip_in_progress', 'trip_completed', 'in_hold_period'].includes(originalStatus)) {
      await prisma!.affiliate.update({
        where: { id: commission.affiliateId },
        data: {
          pendingBalance: { decrement: commission.totalCommissionAmount },
          canceledBookings: { increment: 1 },
        },
      })
    }

    // Update referral status
    await prisma!.affiliateReferral.updateMany({
      where: { bookingId: commission.bookingId },
      data: { status: 'canceled' },
    })

    // Log lifecycle change
    await prisma!.commissionLifecycleLog.create({
      data: {
        commissionId,
        fromStatus: originalStatus,
        toStatus: 'cancelled',
        reason: `Booking cancelled: ${reason}`,
        changedBy: cancelledBy,
        automated: !cancelledBy,
      },
    })

    console.log(`❌ Cancelled: ${commission.affiliate.referralCode} | ${commissionId.substring(0, 8)}`)

    return { success: true }
  } catch (error) {
    console.error('Error handling cancellation:', error)
    return { success: false, error: 'Failed to cancel commission' }
  }
}

/**
 * Handle booking refund (after commission was paid)
 * Moves commission to 'reversed' and creates negative balance
 */
export async function handleBookingRefund(
  commissionId: string,
  refundAmount: number,
  reason: string,
  refundedBy?: string
) {
  try {
    const commission = await prisma!.commission.findUnique({
      where: { id: commissionId },
      include: {
        affiliate: { select: { id: true, referralCode: true } },
      },
    })

    if (!commission) {
      return { success: false, error: 'Commission not found' }
    }

    const originalStatus = commission.status

    // Update commission
    await prisma!.commission.update({
      where: { id: commissionId },
      data: {
        reversed: true,
        reversedAt: new Date(),
        reversalReason: reason,
        reversalAmount: commission.totalCommissionAmount,
        refundedAt: new Date(),
        refundAmount,
        refundReason: reason,
      },
    })

    // Deduct from current balance (can go negative)
    await prisma!.affiliate.update({
      where: { id: commission.affiliateId },
      data: {
        currentBalance: { decrement: commission.totalCommissionAmount },
        failedBookingsCount: { increment: 1 },
        refundedBookings: { increment: 1 },
      },
    })

    // Update referral status
    await prisma!.affiliateReferral.updateMany({
      where: { bookingId: commission.bookingId },
      data: { status: 'refunded' },
    })

    // Update trust score (negative impact)
    await updateTrustScore(commission.affiliateId)

    // Log lifecycle change
    await prisma!.commissionLifecycleLog.create({
      data: {
        commissionId,
        fromStatus: originalStatus,
        toStatus: 'reversed',
        reason: `Refund issued: ${reason}. Commission clawback: $${commission.totalCommissionAmount.toFixed(2)}`,
        changedBy: refundedBy,
        automated: !refundedBy,
        metadata: {
          refundAmount,
          commissionClawback: commission.totalCommissionAmount,
        },
      },
    })

    console.log(`🔄 Refunded: ${commission.affiliate.referralCode} | Clawback: $${commission.totalCommissionAmount.toFixed(2)}`)

    return { success: true }
  } catch (error) {
    console.error('Error handling refund:', error)
    return { success: false, error: 'Failed to process refund' }
  }
}

/**
 * Update affiliate trust score based on performance
 */
async function updateTrustScore(affiliateId: string) {
  try {
    const affiliate = await prisma!.affiliate.findUnique({
      where: { id: affiliateId },
      select: {
        successfulBookingsCount: true,
        failedBookingsCount: true,
        trustScore: true,
        trustLevel: true,
        category: true,
      },
    })

    if (!affiliate) return

    const total = affiliate.successfulBookingsCount + affiliate.failedBookingsCount
    if (total === 0) return

    // Calculate success rate
    const successRate = affiliate.successfulBookingsCount / total

    // Calculate new trust score (0-100)
    let newTrustScore = successRate * 100

    // Bonus points for volume
    if (affiliate.successfulBookingsCount >= 100) newTrustScore = Math.min(100, newTrustScore + 5)
    else if (affiliate.successfulBookingsCount >= 50) newTrustScore = Math.min(100, newTrustScore + 3)
    else if (affiliate.successfulBookingsCount >= 25) newTrustScore = Math.min(100, newTrustScore + 2)

    // Smooth transition (don't change too drastically)
    newTrustScore = (affiliate.trustScore * 0.7 + newTrustScore * 0.3)

    // Determine new trust level
    let newTrustLevel = affiliate.trustLevel

    const holdConfig = await prisma!.holdPeriodConfig.findMany({
      where: { category: affiliate.category },
      orderBy: { minTrustScore: 'desc' },
    })

    for (const config of holdConfig) {
      if (config.minTrustScore && newTrustScore >= config.minTrustScore) {
        if (config.minSuccessfulBookings && affiliate.successfulBookingsCount >= config.minSuccessfulBookings) {
          newTrustLevel = config.trustLevel
          break
        }
      }
    }

    // Update affiliate
    await prisma!.affiliate.update({
      where: { id: affiliateId },
      data: {
        trustScore: Math.round(newTrustScore * 10) / 10,
        trustLevel: newTrustLevel,
      },
    })

    console.log(`  📊 Trust updated: Score ${newTrustScore.toFixed(1)}/100, Level: ${newTrustLevel}`)
  } catch (error) {
    console.error('Error updating trust score:', error)
  }
}

/**
 * Main processor - runs all lifecycle checks
 */
export async function processCommissionLifecycle() {
  console.log('\n🔄 === COMMISSION LIFECYCLE PROCESSOR ===\n')
  console.log(`⏰ Running at: ${new Date().toISOString()}\n`)

  const results = {
    tripsStarted: { success: false, processed: 0, total: 0 },
    tripsCompleted: { success: false, processed: 0, total: 0 },
    commissionsReleased: { success: false, processed: 0, total: 0 },
  }

  // Step 1: Start trips
  results.tripsStarted = await startTripsInProgress()

  // Step 2: Complete trips
  results.tripsCompleted = await completeFinishedTrips()

  // Step 3: Release from hold period
  results.commissionsReleased = await releaseFromHoldPeriod()

  console.log('📊 Summary:')
  console.log(`   Trips Started: ${results.tripsStarted.processed}/${results.tripsStarted.total}`)
  console.log(`   Trips Completed: ${results.tripsCompleted.processed}/${results.tripsCompleted.total}`)
  console.log(`   Commissions Released: ${results.commissionsReleased.processed}/${results.commissionsReleased.total}`)
  console.log('\n✨ Lifecycle processing complete!\n')

  return results
}
