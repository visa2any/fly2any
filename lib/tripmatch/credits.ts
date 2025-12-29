/**
 * TripMatch Credit Reward System
 * Handles all credit calculations, awards, and spending logic
 */

import { getSql } from '@/lib/db/connection';
import type {
  CreditRewardConfig,
  CreditCalculation,
  CreditTransaction,
  UserCredits,
} from './types';

// =====================================================
// CREDIT CONFIGURATION
// =====================================================

export const DEFAULT_CREDIT_CONFIG: CreditRewardConfig = {
  // Base rewards (in credits, 1 credit = $0.10)
  perMemberBonus: 50, // $5 per member
  firstTimerBonus: 25, // $2.50 extra for new users

  // Group size multipliers
  multipliers: {
    small: { minMembers: 4, multiplier: 1.0 },
    medium: { minMembers: 8, multiplier: 1.5 },
    large: { minMembers: 12, multiplier: 2.0 },
  },

  // Completion & quality bonuses
  tripCompletedBonus: 100, // $10
  fiveStarReviewBonus: 50, // $5
  repeatGroupBonus: 75, // $7.50

  // Achievement bonuses
  firstTripBonus: 100, // $10
  powerCreatorBonus: { tripsRequired: 10, reward: 500 }, // $50
  ambassadorBonus: { tripsRequired: 50, reward: 1000 }, // $100

  // Spending rules
  creditValue: 0.10, // $0.10 per credit
  maxDiscountPercent: 50, // Max 50% off
  minRedemption: 50, // Minimum 50 credits ($5)
};

// =====================================================
// CREDIT CALCULATION FUNCTIONS
// =====================================================

/**
 * Calculate credits earned for creating a trip and recruiting members
 */
export function calculateCreatorCredits(
  memberCount: number,
  firstTimerCount: number = 0,
  isCompleted: boolean = false,
  avgRating: number = 0,
  config: CreditRewardConfig = DEFAULT_CREDIT_CONFIG
): CreditCalculation {
  // Base credits from members
  const perMemberReward = memberCount * config.perMemberBonus;

  // First-timer bonus
  const firstTimerReward = firstTimerCount * config.firstTimerBonus;

  // Group size multiplier
  let multiplier = 1.0;
  if (memberCount >= config.multipliers.large.minMembers) {
    multiplier = config.multipliers.large.multiplier;
  } else if (memberCount >= config.multipliers.medium.minMembers) {
    multiplier = config.multipliers.medium.multiplier;
  } else if (memberCount >= config.multipliers.small.minMembers) {
    multiplier = config.multipliers.small.multiplier;
  }

  const baseCredits = perMemberReward + firstTimerReward;
  const groupSizeBonus = Math.floor(baseCredits * (multiplier - 1.0));

  // Completion bonus
  let completionBonus = 0;
  if (isCompleted) {
    completionBonus += config.tripCompletedBonus;

    // Five-star review bonus
    if (avgRating >= 4.8) {
      completionBonus += config.fiveStarReviewBonus;
    }
  }

  const totalBeforeMultiplier = baseCredits + completionBonus;
  const totalCredits = Math.floor(totalBeforeMultiplier * multiplier);
  const dollarValue = totalCredits * config.creditValue;

  return {
    baseCredits,
    multiplier,
    bonusCredits: groupSizeBonus + completionBonus,
    totalCredits,
    dollarValue,
    breakdown: {
      memberCount,
      perMemberReward,
      firstTimerCount,
      firstTimerReward,
      groupSizeBonus,
      completionBonus,
    },
  };
}

/**
 * Calculate maximum credits that can be applied to a booking
 */
export function calculateMaxCreditsApplicable(
  bookingAmount: number,
  userCreditBalance: number,
  config: CreditRewardConfig = DEFAULT_CREDIT_CONFIG
): {
  maxCredits: number;
  maxDiscount: number;
  percentOff: number;
} {
  // Max discount is 50% of booking
  const maxDiscountCents = Math.floor(bookingAmount * (config.maxDiscountPercent / 100));
  const maxCreditsFromDiscount = Math.floor(maxDiscountCents / (config.creditValue * 100));

  // Can't spend more credits than user has
  const maxCredits = Math.min(maxCreditsFromDiscount, userCreditBalance);

  // Calculate actual discount
  const maxDiscount = maxCredits * config.creditValue * 100;
  const percentOff = (maxDiscount / bookingAmount) * 100;

  return {
    maxCredits,
    maxDiscount,
    percentOff,
  };
}

/**
 * Convert credits to dollar value
 */
export function creditsToDollars(
  credits: number,
  config: CreditRewardConfig = DEFAULT_CREDIT_CONFIG
): number {
  return credits * config.creditValue;
}

/**
 * Convert dollar amount to credits
 */
export function dollarsToCredits(
  dollars: number,
  config: CreditRewardConfig = DEFAULT_CREDIT_CONFIG
): number {
  return Math.floor(dollars / config.creditValue);
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    const result = await sql`
      SELECT *
      FROM user_credits
      WHERE user_id = ${userId}
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].id,
      userId: result[0].user_id,
      balance: result[0].balance,
      lifetimeEarned: result[0].lifetime_earned,
      lifetimeSpent: result[0].lifetime_spent,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
    };
  } catch (error) {
    console.error('Error getting user credits:', error);
    return null;
  }
}

/**
 * Award credits to a user
 */
export async function awardCredits(
  userId: string,
  amount: number,
  type: string,
  source: string,
  options: {
    tripId?: string;
    bookingId?: string;
    description?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<CreditTransaction | null> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    // Insert transaction (trigger will update balance)
    const result = await sql`
      INSERT INTO credit_transactions (
        user_id,
        amount,
        type,
        source,
        trip_id,
        booking_id,
        description,
        metadata
      ) VALUES (
        ${userId},
        ${amount},
        ${type},
        ${source},
        ${options.tripId || null},
        ${options.bookingId || null},
        ${options.description || null},
        ${options.metadata ? JSON.stringify(options.metadata) : null}
      )
      RETURNING *
    `;

    console.log(`💰 Awarded ${amount} credits to user ${userId} (${source})`);

    return {
      id: result[0].id,
      userId: result[0].user_id,
      amount: result[0].amount,
      type: result[0].type,
      source: result[0].source,
      tripId: result[0].trip_id,
      bookingId: result[0].booking_id,
      description: result[0].description,
      metadata: result[0].metadata,
      createdAt: result[0].created_at,
    };
  } catch (error) {
    console.error('Error awarding credits:', error);
    return null;
  }
}

/**
 * Spend credits (subtract from balance)
 */
export async function spendCredits(
  userId: string,
  amount: number,
  type: string,
  options: {
    tripId?: string;
    bookingId?: string;
    description?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<CreditTransaction | null> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    // Check if user has enough credits
    const userCredits = await getUserCredits(userId);
    if (!userCredits || userCredits.balance < amount) {
      throw new Error(`Insufficient credits. Has: ${userCredits?.balance || 0}, Needs: ${amount}`);
    }

    // Insert negative transaction (trigger will update balance)
    const result = await sql`
      INSERT INTO credit_transactions (
        user_id,
        amount,
        type,
        source,
        trip_id,
        booking_id,
        description,
        metadata
      ) VALUES (
        ${userId},
        ${-amount}, -- Negative for spending
        ${type},
        ${'booking'},
        ${options.tripId || null},
        ${options.bookingId || null},
        ${options.description || null},
        ${options.metadata ? JSON.stringify(options.metadata) : null}
      )
      RETURNING *
    `;

    console.log(`💸 User ${userId} spent ${amount} credits on ${type}`);

    return {
      id: result[0].id,
      userId: result[0].user_id,
      amount: result[0].amount,
      type: result[0].type,
      source: result[0].source,
      tripId: result[0].trip_id,
      bookingId: result[0].booking_id,
      description: result[0].description,
      metadata: result[0].metadata,
      createdAt: result[0].created_at,
    };
  } catch (error) {
    console.error('Error spending credits:', error);
    return null;
  }
}

/**
 * Get credit transaction history for a user
 */
export async function getCreditHistory(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return [];
    }

    const result = await sql`
      SELECT *
      FROM credit_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      type: row.type,
      source: row.source,
      tripId: row.trip_id,
      bookingId: row.booking_id,
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting credit history:', error);
    return [];
  }
}

// =====================================================
// TRIP-SPECIFIC CREDIT OPERATIONS
// =====================================================

/**
 * Award credits to trip creator when members join
 */
export async function awardCreatorCreditsForMember(
  tripId: string,
  creatorId: string,
  newMemberId: string,
  isFirstTimer: boolean = false
): Promise<void> {
  try {
    // Base reward per member
    let creditsToAward = DEFAULT_CREDIT_CONFIG.perMemberBonus;

    // First-timer bonus
    if (isFirstTimer) {
      creditsToAward += DEFAULT_CREDIT_CONFIG.firstTimerBonus;
    }

    // Award credits
    await awardCredits(
      creatorId,
      creditsToAward,
      'earned_member_join',
      'member_join',
      {
        tripId,
        description: `Member joined your trip`,
        metadata: {
          newMemberId,
          isFirstTimer,
          perMemberBonus: DEFAULT_CREDIT_CONFIG.perMemberBonus,
          firstTimerBonus: isFirstTimer ? DEFAULT_CREDIT_CONFIG.firstTimerBonus : 0,
        },
      }
    );
  } catch (error) {
    console.error('Error awarding creator credits:', error);
  }
}

/**
 * Award group size bonus when trip reaches milestone
 */
export async function awardGroupSizeMilestoneBonus(
  tripId: string,
  creatorId: string,
  memberCount: number
): Promise<void> {
  try {
    const config = DEFAULT_CREDIT_CONFIG;
    let milestoneReached = false;
    let bonusMultiplier = 0;

    if (memberCount === config.multipliers.medium.minMembers) {
      milestoneReached = true;
      bonusMultiplier = config.multipliers.medium.multiplier;
    } else if (memberCount === config.multipliers.large.minMembers) {
      milestoneReached = true;
      bonusMultiplier = config.multipliers.large.multiplier;
    }

    if (milestoneReached) {
      // Calculate bonus (50% of base * multiplier difference)
      const baseCreditsEarned = memberCount * config.perMemberBonus;
      const bonusCredits = Math.floor(baseCreditsEarned * (bonusMultiplier - 1.0) * 0.5);

      await awardCredits(
        creatorId,
        bonusCredits,
        'earned_achievement',
        'trip_creation',
        {
          tripId,
          description: `Group size milestone: ${memberCount} members!`,
          metadata: {
            memberCount,
            bonusMultiplier,
            achievement: `${memberCount}_members`,
          },
        }
      );

      console.log(`🎉 Milestone bonus: ${bonusCredits} credits for ${memberCount} members`);
    }
  } catch (error) {
    console.error('Error awarding milestone bonus:', error);
  }
}

/**
 * Award completion bonus after trip ends
 */
export async function awardTripCompletionBonus(
  tripId: string,
  creatorId: string,
  avgRating: number
): Promise<void> {
  try {
    let totalBonus = DEFAULT_CREDIT_CONFIG.tripCompletedBonus;

    // Five-star review bonus
    if (avgRating >= 4.8) {
      totalBonus += DEFAULT_CREDIT_CONFIG.fiveStarReviewBonus;
    }

    await awardCredits(
      creatorId,
      totalBonus,
      'earned_completion_bonus',
      'trip_completion',
      {
        tripId,
        description: `Trip completed with ${avgRating.toFixed(1)}⭐ rating`,
        metadata: {
          avgRating,
          completionBonus: DEFAULT_CREDIT_CONFIG.tripCompletedBonus,
          ratingBonus: avgRating >= 4.8 ? DEFAULT_CREDIT_CONFIG.fiveStarReviewBonus : 0,
        },
      }
    );

    console.log(`✨ Trip completion bonus: ${totalBonus} credits (${avgRating}⭐)`);
  } catch (error) {
    console.error('Error awarding completion bonus:', error);
  }
}

/**
 * Check and award creator achievements (10 trips, 50 trips, etc.)
 */
export async function checkAndAwardCreatorAchievements(
  creatorId: string
): Promise<void> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return;
    }

    // Get creator's trip count
    const result = await sql`
      SELECT COUNT(*) as trip_count
      FROM trip_groups
      WHERE creator_id = ${creatorId}
        AND status IN ('completed', 'confirmed')
    `;

    const tripCount = parseInt(result[0]?.trip_count || '0');

    // Check for power creator (10 trips)
    if (tripCount === DEFAULT_CREDIT_CONFIG.powerCreatorBonus.tripsRequired) {
      await awardCredits(
        creatorId,
        DEFAULT_CREDIT_CONFIG.powerCreatorBonus.reward,
        'earned_achievement',
        'trip_creation',
        {
          description: `🏆 Power Creator Achievement: ${tripCount} trips!`,
          metadata: {
            achievement: 'power_creator',
            tripCount,
          },
        }
      );

      console.log(`🏆 Power Creator achievement unlocked: ${DEFAULT_CREDIT_CONFIG.powerCreatorBonus.reward} credits`);
    }

    // Check for ambassador (50 trips)
    if (tripCount === DEFAULT_CREDIT_CONFIG.ambassadorBonus.tripsRequired) {
      await awardCredits(
        creatorId,
        DEFAULT_CREDIT_CONFIG.ambassadorBonus.reward,
        'earned_achievement',
        'trip_creation',
        {
          description: `👑 Ambassador Achievement: ${tripCount} trips!`,
          metadata: {
            achievement: 'ambassador',
            tripCount,
          },
        }
      );

      console.log(`👑 Ambassador achievement unlocked: ${DEFAULT_CREDIT_CONFIG.ambassadorBonus.reward} credits`);
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// =====================================================
// LEADERBOARD & STATS
// =====================================================

/**
 * Get top credit earners (leaderboard)
 */
export async function getTopCreditEarners(limit: number = 10): Promise<
  Array<{
    userId: string;
    lifetimeEarned: number;
    dollarValue: number;
    tripsCreated: number;
  }>
> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return [];
    }

    const result = await sql`
      SELECT
        uc.user_id,
        uc.lifetime_earned,
        COUNT(DISTINCT tg.id) as trips_created
      FROM user_credits uc
      LEFT JOIN trip_groups tg ON tg.creator_id = uc.user_id
      WHERE uc.lifetime_earned > 0
      GROUP BY uc.user_id, uc.lifetime_earned
      ORDER BY uc.lifetime_earned DESC
      LIMIT ${limit}
    `;

    return result.map((row: any) => ({
      userId: row.user_id,
      lifetimeEarned: row.lifetime_earned,
      dollarValue: creditsToDollars(row.lifetime_earned),
      tripsCreated: parseInt(row.trips_created || '0'),
    }));
  } catch (error) {
    console.error('Error getting top earners:', error);
    return [];
  }
}

/**
 * Get credit statistics for dashboard
 */
export async function getCreditStats(): Promise<{
  totalCreditsAwarded: number;
  totalCreditsSpent: number;
  activeUsers: number;
  avgCreditsPerUser: number;
}> {
  try {
    const sql = getSql();

    if (!sql) {
      console.warn('Database not configured');
      return {
        totalCreditsAwarded: 0,
        totalCreditsSpent: 0,
        activeUsers: 0,
        avgCreditsPerUser: 0,
      };
    }

    const result = await sql`
      SELECT
        SUM(lifetime_earned) as total_earned,
        SUM(lifetime_spent) as total_spent,
        COUNT(*) as active_users,
        AVG(balance) as avg_balance
      FROM user_credits
      WHERE balance > 0 OR lifetime_earned > 0
    `;

    return {
      totalCreditsAwarded: parseInt(result[0]?.total_earned || '0'),
      totalCreditsSpent: parseInt(result[0]?.total_spent || '0'),
      activeUsers: parseInt(result[0]?.active_users || '0'),
      avgCreditsPerUser: parseFloat(result[0]?.avg_balance || '0'),
    };
  } catch (error) {
    console.error('Error getting credit stats:', error);
    return {
      totalCreditsAwarded: 0,
      totalCreditsSpent: 0,
      activeUsers: 0,
      avgCreditsPerUser: 0,
    };
  }
}

// =====================================================
// HELPER FUNCTIONS FOR MEMBER MANAGEMENT
// =====================================================

/**
 * Calculate reward for a new member joining
 */
export function calculateMemberReward(groupSize: number): number {
  const config = DEFAULT_CREDIT_CONFIG;
  let multiplier = config.multipliers.small.multiplier;

  if (groupSize >= config.multipliers.large.minMembers) {
    multiplier = config.multipliers.large.multiplier;
  } else if (groupSize >= config.multipliers.medium.minMembers) {
    multiplier = config.multipliers.medium.multiplier;
  }

  return Math.floor(config.perMemberBonus * multiplier);
}

/**
 * Generate a unique invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) {
      code += '-';
    } else {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return code; // Format: ABC-123-XYZ
}
