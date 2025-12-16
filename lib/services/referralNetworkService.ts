/**
 * FLY2ANY REWARDS SERVICE
 *
 * Manages the tiered Travel Rewards Program for Fly2Any
 *
 * BUSINESS RULES:
 * - 3-Tier Rewards: Users earn from their direct referrals (Tier 1),
 *   their referrals' referrals (Tier 2), and Tier 3
 *
 * COMMISSION-BASED REWARDS (Sustainable Model):
 * - Points are calculated from COMMISSION earned, NOT gross booking value
 * - This ensures profitability on every booking
 *
 * - Points Structure (per $100 of COMMISSION):
 *   - Level 1: 50 points per $100 commission = $5 reward (5% of commission)
 *   - Level 2: 20 points per $100 commission = $2 reward (2% of commission)
 *   - Level 3: 10 points per $100 commission = $1 reward (1% of commission)
 *   - Total: 8% of commission goes to rewards (always profitable)
 *
 * - Product Multipliers (applied to encourage higher-margin products):
 *   - Flights: 1.0x
 *   - International Flights: 1.2x
 *   - Hotels: 1.5x
 *   - Packages: 2.0x
 *
 * - Points Locking: All points are LOCKED until trip completes successfully
 * - Anti-Fraud: Cancelled/refunded trips forfeit points
 * - Redemption: 10 points = $1 USD
 */

import { getPrismaClient } from '@/lib/prisma';
import { generateReferralCode } from '@/lib/utils';

const prisma = getPrismaClient();

// Points rate per $100 COMMISSION by level (NOT booking amount!)
// This ensures we never pay more in rewards than we earn
const POINTS_RATES = {
  1: 50, // Level 1: 50 points per $100 commission = $5 (5% of commission)
  2: 20, // Level 2: 20 points per $100 commission = $2 (2% of commission)
  3: 10, // Level 3: 10 points per $100 commission = $1 (1% of commission)
};
// Total: 8% of commission goes to rewards (sustainable model)

// Product multipliers (encourage higher-margin products)
const PRODUCT_MULTIPLIERS = {
  flight: 1.0,
  flight_international: 1.2,
  hotel: 1.5,
  package: 2.0,
  car: 1.0,
  activity: 1.0,
};

// Default commission rates by product type (used when actual commission not provided)
// These are conservative estimates - actual commission should be passed when available
const DEFAULT_COMMISSION_RATES = {
  flight: 0.03,              // 3% for domestic flights
  flight_international: 0.05, // 5% for international flights
  hotel: 0.10,               // 10% for hotels
  package: 0.12,             // 12% for packages
  car: 0.08,                 // 8% for car rentals
  activity: 0.15,            // 15% for activities
};

/**
 * Calculate commission from booking amount based on product type
 * Use this when actual commission is not known
 */
export function calculateDefaultCommission(
  bookingAmount: number,
  productType: string
): number {
  const rate = DEFAULT_COMMISSION_RATES[productType as keyof typeof DEFAULT_COMMISSION_RATES] || 0.05;
  return Math.round(bookingAmount * rate * 100) / 100; // Round to 2 decimal places
}

interface CreateReferralParams {
  refereeEmail: string;
  referralCode: string;
}

interface ProcessBookingParams {
  bookingId: string;
  userId: string;
  bookingAmount: number;      // Total booking value (for display/records)
  commissionAmount: number;   // Fly2Any's commission - REWARDS ARE CALCULATED FROM THIS
  currency: string;
  productType: string;
  tripStartDate: Date;
  tripEndDate: Date;
  productData?: any;
}

/**
 * STEP 1: Create referral relationship when new user signs up
 * This is called during signup when a referral code is present
 */
export async function createReferralRelationship({
  refereeEmail,
  referralCode,
}: CreateReferralParams) {
  try {
    // Find referrer by code
    const referrer = await prisma!.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        referralLevel: true,
        referredBy: true,
      },
    });

    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Find referee (the new user signing up)
    const referee = await prisma!.user.findUnique({
      where: { email: refereeEmail },
    });

    if (!referee) {
      throw new Error('User not found');
    }

    // Prevent self-referral
    if (referrer.id === referee.id) {
      throw new Error('Cannot refer yourself');
    }

    // Check if already referred by someone
    if (referee.referredBy) {
      throw new Error('User already has a referrer');
    }

    // Calculate referee's level (one deeper than referrer)
    const refereeLevel = referrer.referralLevel + 1;

    // Update referee with referral info
    await prisma!.user.update({
      where: { id: referee.id },
      data: {
        referredBy: referrer.id,
        referralLevel: refereeLevel,
        referralCode: await generateUniqueReferralCode(),
      },
    });

    // Create Level 1 relationship (direct referral)
    await prisma!.referralNetworkRelationship.create({
      data: {
        referrerId: referrer.id,
        refereeId: referee.id,
        level: 1,
        status: 'signed_up',
        signupCompletedAt: new Date(),
      },
    });

    // Update referrer's stats
    await prisma!.user.update({
      where: { id: referrer.id },
      data: {
        directReferralsCount: { increment: 1 },
        totalNetworkSize: { increment: 1 },
      },
    });

    // CRITICAL: Build upstream network (Level 2 and Level 3)
    await buildUpstreamNetwork(referrer.id, referee.id, referrer.referredBy);

    console.log(`✅ Referral created: ${referrer.id} → ${referee.id} (Level 1)`);

    return {
      success: true,
      referrerId: referrer.id,
      refereeId: referee.id,
      level: refereeLevel,
    };
  } catch (error) {
    console.error('Error creating referral relationship:', error);
    throw error;
  }
}

/**
 * Build Level 2 and Level 3 relationships
 * This creates the network tree structure
 */
async function buildUpstreamNetwork(
  directReferrerId: string,
  newUserId: string,
  grandparentReferrerId: string | null
) {
  try {
    // Level 2: Grandparent referrer (if exists)
    if (grandparentReferrerId) {
      const grandparent = await prisma!.user.findUnique({
        where: { id: grandparentReferrerId },
        select: { id: true, referredBy: true },
      });

      if (grandparent) {
        // Create Level 2 relationship
        await prisma!.referralNetworkRelationship.create({
          data: {
            referrerId: grandparent.id,
            refereeId: newUserId,
            level: 2,
            status: 'signed_up',
            signupCompletedAt: new Date(),
          },
        });

        // Update grandparent's network size
        await prisma!.user.update({
          where: { id: grandparent.id },
          data: { totalNetworkSize: { increment: 1 } },
        });

        console.log(`✅ Level 2 relationship: ${grandparent.id} → ${newUserId}`);

        // Level 3: Great-grandparent referrer (if exists)
        if (grandparent.referredBy) {
          const greatGrandparent = await prisma!.user.findUnique({
            where: { id: grandparent.referredBy },
          });

          if (greatGrandparent) {
            // Create Level 3 relationship
            await prisma!.referralNetworkRelationship.create({
              data: {
                referrerId: greatGrandparent.id,
                refereeId: newUserId,
                level: 3,
                status: 'signed_up',
                signupCompletedAt: new Date(),
              },
            });

            // Update great-grandparent's network size
            await prisma!.user.update({
              where: { id: greatGrandparent.id },
              data: { totalNetworkSize: { increment: 1 } },
            });

            console.log(`✅ Level 3 relationship: ${greatGrandparent.id} → ${newUserId}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error building upstream network:', error);
    // Don't throw - Level 1 already created, this is bonus
  }
}

/**
 * STEP 2: Process booking and create locked points transactions
 * Called when a user completes a booking
 *
 * IMPORTANT: Points are calculated from COMMISSION, not booking amount!
 * This ensures profitability on every booking.
 *
 * Example: $500 flight, 5% commission = $25 commission
 * - Level 1: ($25/100) * 50 * 1.0 = 12.5 → 12 points = $1.20 reward
 * - Level 2: ($25/100) * 20 * 1.0 = 5 points = $0.50 reward
 * - Level 3: ($25/100) * 10 * 1.0 = 2.5 → 2 points = $0.20 reward
 * - Total: 19 points = $1.90 (7.6% of $25 commission = profitable!)
 */
export async function processBookingForReferralPoints({
  bookingId,
  userId,
  bookingAmount,
  commissionAmount,
  currency,
  productType,
  tripStartDate,
  tripEndDate,
  productData,
}: ProcessBookingParams) {
  try {
    console.log(`🎯 Processing booking ${bookingId} for referral points...`);
    console.log(`📊 Booking: $${bookingAmount} | Commission: $${commissionAmount} (${((commissionAmount/bookingAmount)*100).toFixed(1)}%)`);

    // IDEMPOTENCY CHECK: Prevent duplicate points processing
    const existingTransactions = await prisma!.referralPointsTransaction.findMany({
      where: { bookingId },
      select: { id: true, earnerId: true, level: true, pointsAwarded: true },
    });

    if (existingTransactions.length > 0) {
      const totalExisting = existingTransactions.reduce((sum, t) => sum + t.pointsAwarded, 0);
      console.log(`⚠️ IDEMPOTENCY: Booking ${bookingId} already has ${existingTransactions.length} transactions (${totalExisting} points). Skipping duplicate processing.`);
      return {
        success: true,
        transactions: existingTransactions,
        totalPointsAwarded: totalExisting,
        skipped: true,
        reason: 'duplicate_booking',
      };
    }

    // Convert commission to USD if needed (simplified - you may want currency conversion API)
    const commissionUSD = currency === 'USD' ? commissionAmount : commissionAmount; // TODO: Add currency conversion
    const bookingUSD = currency === 'USD' ? bookingAmount : bookingAmount;

    // Safety check: Don't process if no commission
    if (commissionUSD <= 0) {
      console.log(`⚠️ No commission on booking ${bookingId}, skipping rewards`);
      return { success: true, transactions: [], totalPointsAwarded: 0 };
    }

    // Get product multiplier
    const multiplier = PRODUCT_MULTIPLIERS[productType as keyof typeof PRODUCT_MULTIPLIERS] || 1.0;

    // Find all people who should earn points from this booking
    const referralRelationships = await prisma!.referralNetworkRelationship.findMany({
      where: {
        refereeId: userId,
        status: { in: ['signed_up', 'first_booking', 'active'] },
      },
    });

    console.log(`📊 Found ${referralRelationships.length} referrers to reward`);

    // Create points transaction for each level
    const transactions = [];
    for (const relationship of referralRelationships) {
      const level = relationship.level;

      // Only process Level 1, 2, 3
      if (level > 3) continue;

      const pointsRate = POINTS_RATES[level as keyof typeof POINTS_RATES];
      if (!pointsRate) continue;

      // CRITICAL: Calculate points from COMMISSION, not booking amount!
      // Formula: (commission / 100) * pointsRate * multiplier
      const basePoints = Math.floor((commissionUSD / 100) * pointsRate);
      const pointsAwarded = Math.floor(basePoints * multiplier);

      // Skip if no points to award (very small commissions)
      if (pointsAwarded <= 0) continue;

      // Create LOCKED points transaction
      const transaction = await prisma!.referralPointsTransaction.create({
        data: {
          bookingId,
          bookingAmount: bookingUSD, // Store booking amount for display
          productType,
          productData: {
            ...productData,
            commissionAmount: commissionUSD, // Store commission for audit
            commissionPercent: ((commissionUSD / bookingUSD) * 100).toFixed(2),
          },
          earnerId: relationship.referrerId,
          customerId: userId,
          level,
          pointsRate,
          productMultiplier: multiplier,
          pointsCalculated: basePoints,
          pointsAwarded,
          status: 'locked', // LOCKED until trip completes
          tripStartDate,
          tripEndDate,
          pointsExpireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      });

      transactions.push(transaction);

      // Increment LOCKED points for the earner
      await prisma!.user.update({
        where: { id: relationship.referrerId },
        data: {
          fly2anyPointsLocked: { increment: pointsAwarded },
          fly2anyPointsLifetime: { increment: pointsAwarded },
        },
      });

      // Update relationship stats (still track booking revenue for display)
      await prisma!.referralNetworkRelationship.update({
        where: { id: relationship.id },
        data: {
          totalBookings: { increment: 1 },
          totalRevenue: { increment: bookingUSD },
          totalPointsEarned: { increment: pointsAwarded },
          lastActivityAt: new Date(),
          status: relationship.status === 'signed_up' ? 'first_booking' : 'active',
          firstBookingAt: relationship.firstBookingAt || new Date(),
        },
      });

      const rewardValue = (pointsAwarded / 10).toFixed(2);
      console.log(
        `💰 Level ${level}: ${relationship.referrerId} earns ${pointsAwarded} LOCKED points ($${rewardValue} value) from $${commissionUSD} commission`
      );
    }

    const totalPoints = transactions.reduce((sum, t) => sum + t.pointsAwarded, 0);
    const totalRewardValue = (totalPoints / 10).toFixed(2);
    console.log(`✅ Total rewards: ${totalPoints} points ($${totalRewardValue}) from $${commissionUSD} commission (${((totalPoints/10/commissionUSD)*100).toFixed(1)}% of commission)`);

    return {
      success: true,
      transactions,
      totalPointsAwarded: totalPoints,
      rewardValue: totalRewardValue,
      commissionUsed: commissionUSD,
    };
  } catch (error) {
    console.error('Error processing booking for referral points:', error);
    throw error;
  }
}

/**
 * STEP 3: Unlock points when trip completes successfully
 * Called by cron job after trip end date + grace period
 */
export async function unlockPointsForCompletedTrip(bookingId: string) {
  try {
    console.log(`🔓 Unlocking points for booking ${bookingId}...`);

    // Find all locked transactions for this booking
    const transactions = await prisma!.referralPointsTransaction.findMany({
      where: {
        bookingId,
        status: 'locked',
        tripCancelled: false,
        tripRefunded: false,
      },
    });

    if (transactions.length === 0) {
      console.log(`⚠️ No locked transactions found for booking ${bookingId}`);
      return { success: true, unlockedCount: 0 };
    }

    let unlockedCount = 0;
    for (const transaction of transactions) {
      // Update transaction status to unlocked
      await prisma!.referralPointsTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'unlocked',
          tripCompletedAt: new Date(),
          pointsUnlockedAt: new Date(),
        },
      });

      // Move points from locked to available
      await prisma!.user.update({
        where: { id: transaction.earnerId },
        data: {
          fly2anyPointsLocked: { decrement: transaction.pointsAwarded },
          fly2anyPoints: { increment: transaction.pointsAwarded },
        },
      });

      unlockedCount++;
      console.log(`✅ Unlocked ${transaction.pointsAwarded} points for user ${transaction.earnerId}`);
    }

    return { success: true, unlockedCount };
  } catch (error) {
    console.error('Error unlocking points:', error);
    throw error;
  }
}

/**
 * STEP 4: Forfeit points if trip cancelled or refunded
 * Called when booking is cancelled or refunded
 */
export async function forfeitPointsForCancelledTrip(
  bookingId: string,
  reason: 'cancelled' | 'refunded'
) {
  try {
    console.log(`❌ Forfeiting points for ${reason} booking ${bookingId}...`);

    // Find all locked transactions for this booking
    const transactions = await prisma!.referralPointsTransaction.findMany({
      where: {
        bookingId,
        status: { in: ['locked', 'trip_in_progress'] },
      },
    });

    if (transactions.length === 0) {
      console.log(`⚠️ No transactions to forfeit for booking ${bookingId}`);
      return { success: true, forfeitedCount: 0 };
    }

    let forfeitedCount = 0;
    let totalPointsForfeited = 0;

    for (const transaction of transactions) {
      // Update transaction status
      await prisma!.referralPointsTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'expired',
          tripCancelled: reason === 'cancelled',
          tripCancelledAt: reason === 'cancelled' ? new Date() : transaction.tripCancelledAt,
          tripRefunded: reason === 'refunded',
        },
      });

      // Remove locked points (NOT available points - these were never unlocked)
      await prisma!.user.update({
        where: { id: transaction.earnerId },
        data: {
          fly2anyPointsLocked: { decrement: transaction.pointsAwarded },
          fly2anyPointsLifetime: { decrement: transaction.pointsAwarded },
        },
      });

      forfeitedCount++;
      totalPointsForfeited += transaction.pointsAwarded;
      console.log(`💔 Forfeited ${transaction.pointsAwarded} points from user ${transaction.earnerId}`);
    }

    return {
      success: true,
      forfeitedCount,
      totalPointsForfeited,
    };
  } catch (error) {
    console.error('Error forfeiting points:', error);
    throw error;
  }
}

/**
 * Get referral network tree for a user
 * Shows all their referrals across all 3 levels
 */
export async function getReferralNetworkTree(userId: string) {
  try {
    const relationships = await prisma!.referralNetworkRelationship.findMany({
      where: { referrerId: userId },
      orderBy: [
        { level: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Get referee details
    const refereeIds = relationships.map((r) => r.refereeId);
    const referees = await prisma!.user.findMany({
      where: { id: { in: refereeIds } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        fly2anyPoints: true,
        fly2anyPointsLocked: true,
      },
    });

    // Combine data
    const networkTree = relationships.map((rel) => {
      const referee = referees.find((r) => r.id === rel.refereeId);
      return {
        ...rel,
        referee,
      };
    });

    // Group by level
    const byLevel = {
      level1: networkTree.filter((r) => r.level === 1),
      level2: networkTree.filter((r) => r.level === 2),
      level3: networkTree.filter((r) => r.level === 3),
    };

    return {
      total: relationships.length,
      byLevel,
      networkTree,
    };
  } catch (error) {
    console.error('Error getting referral network tree:', error);
    throw error;
  }
}

/**
 * Get user's points summary
 */
export async function getUserPointsSummary(userId: string) {
  try {
    const user = await prisma!.user.findUnique({
      where: { id: userId },
      select: {
        fly2anyPoints: true,
        fly2anyPointsLocked: true,
        fly2anyPointsLifetime: true,
        fly2anyPointsRedeemed: true,
        referralCode: true,
        directReferralsCount: true,
        totalNetworkSize: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get pending transactions
    const pendingTransactions = await prisma!.referralPointsTransaction.findMany({
      where: {
        earnerId: userId,
        status: { in: ['locked', 'trip_in_progress'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      available: user.fly2anyPoints,
      locked: user.fly2anyPointsLocked,
      lifetime: user.fly2anyPointsLifetime,
      redeemed: user.fly2anyPointsRedeemed,
      referralCode: user.referralCode,
      directReferrals: user.directReferralsCount,
      totalNetwork: user.totalNetworkSize,
      pendingTransactions: pendingTransactions.length,
      pendingAmount: pendingTransactions.reduce((sum, t) => sum + t.pointsAwarded, 0),
    };
  } catch (error) {
    console.error('Error getting points summary:', error);
    throw error;
  }
}

/**
 * Generate unique referral code for user
 */
async function generateUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode();
  let attempts = 0;

  while (attempts < 10) {
    const exists = await prisma!.user.findUnique({
      where: { referralCode: code },
    });

    if (!exists) {
      return code;
    }

    code = generateReferralCode();
    attempts++;
  }

  // Fallback: add timestamp
  return `${code}${Date.now().toString(36).slice(-3)}`;
}
