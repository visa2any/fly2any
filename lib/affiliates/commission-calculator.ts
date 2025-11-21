/**
 * Affiliate Commission Calculator
 *
 * Handles commission calculation for both commission-based and markup-based revenue models
 */

import { sql } from '@/lib/db/connection';

export interface BookingData {
  bookingId: string;
  customerTotalPaid: number;
  supplierCost: number;
  revenueModel: 'commission' | 'markup';
  markup?: number; // For markup model
  bookingDate: Date;
  travelDate: Date;
  userId?: string; // The customer who booked
}

export interface CommissionResult {
  success: boolean;
  commissionId?: string;
  commissionAmount?: number;
  affiliateId?: string;
  error?: string;
}

/**
 * Calculate and create commission record for a booking
 *
 * This is called when a booking is created and we need to attribute
 * commission to an affiliate (if the user came through affiliate link)
 */
export async function calculateAndCreateCommission(
  bookingData: BookingData
): Promise<CommissionResult> {
  try {
    if (!sql) {
      return { success: false, error: 'Database not configured' };
    }

    const { bookingId, customerTotalPaid, supplierCost, revenueModel, markup, userId } = bookingData;

    // Step 1: Find affiliate referral for this user
    let referral = null;

    if (userId) {
      // Find the most recent non-expired referral for this user
      const referralResult = await sql`
        SELECT * FROM affiliate_referrals
        WHERE user_id = ${userId}
          AND cookie_expiry > NOW()
          AND status IN ('click', 'signed_up')
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (referralResult.length > 0) {
        referral = referralResult[0];
      }
    }

    // If no referral found, this booking is not attributed to any affiliate
    if (!referral) {
      return { success: true, error: 'No affiliate attribution' };
    }

    // Step 2: Get affiliate info
    const affiliateResult = await sql`
      SELECT * FROM affiliates
      WHERE id = ${referral.affiliate_id}
        AND status = 'active'
    `;

    if (affiliateResult.length === 0) {
      return { success: false, error: 'Affiliate not found or inactive' };
    }

    const affiliate = affiliateResult[0];

    // Step 3: Calculate Fly2Any's gross profit
    let yourGrossProfit: number;

    if (revenueModel === 'commission') {
      // Commission model: profit = total - supplier cost
      yourGrossProfit = customerTotalPaid - supplierCost;
    } else if (revenueModel === 'markup') {
      // Markup model: profit = the markup amount
      yourGrossProfit = markup || 0;
    } else {
      return { success: false, error: 'Invalid revenue model' };
    }

    // Step 4: Calculate affiliate commission based on tier
    const commissionRate = getTierCommissionRate(affiliate.tier);
    let commissionAmount = yourGrossProfit * commissionRate;

    // Step 5: Apply min/max caps (configurable)
    const minCommission = 0.50; // Minimum $0.50
    const maxCommission = 500.00; // Maximum $500 per booking

    commissionAmount = Math.max(minCommission, Math.min(commissionAmount, maxCommission));

    // Round to 2 decimal places
    commissionAmount = Math.round(commissionAmount * 100) / 100;

    // Step 6: Create commission record
    const commissionResult = await sql`
      INSERT INTO commissions (
        affiliate_id,
        referral_id,
        booking_id,
        revenue_model,
        customer_total_paid,
        supplier_cost,
        your_gross_profit,
        affiliate_tier_at_booking,
        commission_rate,
        commission_amount,
        booking_date,
        travel_date,
        status,
        hold_period_days,
        created_at,
        updated_at
      ) VALUES (
        ${affiliate.id},
        ${referral.id},
        ${bookingId},
        ${revenueModel},
        ${customerTotalPaid},
        ${supplierCost},
        ${yourGrossProfit},
        ${affiliate.tier},
        ${commissionRate},
        ${commissionAmount},
        ${bookingData.bookingDate.toISOString()},
        ${bookingData.travelDate.toISOString()},
        'pending',
        30,
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    const commissionId = commissionResult[0].id;

    // Step 7: Update affiliate referral status to 'booked'
    await sql`
      UPDATE affiliate_referrals
      SET
        booking_id = ${bookingId},
        status = 'booked',
        updated_at = NOW()
      WHERE id = ${referral.id}
    `;

    // Step 8: Update affiliate stats
    await sql`
      UPDATE affiliates
      SET
        pending_balance = pending_balance + ${commissionAmount},
        updated_at = NOW()
      WHERE id = ${affiliate.id}
    `;

    // Step 9: Log activity
    await sql`
      INSERT INTO affiliate_activity_logs (
        affiliate_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${affiliate.id},
        'commission_created',
        ${`Commission created: $${commissionAmount.toFixed(2)} (${(commissionRate * 100).toFixed(0)}% of $${yourGrossProfit.toFixed(2)} profit)`},
        ${JSON.stringify({
          commissionId,
          bookingId,
          revenueModel,
          yourGrossProfit,
          commissionRate,
          commissionAmount,
        })},
        NOW()
      )
    `;

    return {
      success: true,
      commissionId,
      commissionAmount,
      affiliateId: affiliate.id,
    };

  } catch (error: any) {
    console.error('❌ Error calculating commission:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Mark commission as completed after trip completion
 *
 * This moves the commission from 'booked' to 'completed' status
 * and starts the 30-day hold period before payout
 */
export async function markCommissionCompleted(bookingId: string): Promise<boolean> {
  try {
    if (!sql) {
      return false;
    }

    // Find commission for this booking
    const commissionResult = await sql`
      SELECT * FROM commissions
      WHERE booking_id = ${bookingId}
        AND status IN ('pending', 'booked')
    `;

    if (commissionResult.length === 0) {
      console.log('No commission found for booking:', bookingId);
      return false;
    }

    const commission = commissionResult[0];
    const completionDate = new Date();
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + commission.hold_period_days);

    // Update commission status
    await sql`
      UPDATE commissions
      SET
        status = 'completed',
        completion_date = ${completionDate.toISOString()},
        hold_until = ${holdUntil.toISOString()},
        updated_at = NOW()
      WHERE id = ${commission.id}
    `;

    // Update referral status
    await sql`
      UPDATE affiliate_referrals
      SET
        status = 'completed',
        updated_at = NOW()
      WHERE booking_id = ${bookingId}
    `;

    // Update affiliate stats
    await sql`
      UPDATE affiliates
      SET
        completed_trips = completed_trips + 1,
        monthly_completed_trips = monthly_completed_trips + 1,
        monthly_revenue = monthly_revenue + ${commission.commission_amount},
        total_customer_spend = total_customer_spend + ${commission.customer_total_paid},
        total_your_profit = total_your_profit + ${commission.your_gross_profit},
        total_commissions_earned = total_commissions_earned + ${commission.commission_amount},
        updated_at = NOW()
      WHERE id = ${commission.affiliate_id}
    `;

    // Check if affiliate should be upgraded to next tier
    await checkAndUpgradeTier(commission.affiliate_id);

    // Log activity
    await sql`
      INSERT INTO affiliate_activity_logs (
        affiliate_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${commission.affiliate_id},
        'commission_completed',
        ${`Trip completed - Commission $${commission.commission_amount} now in hold period until ${holdUntil.toISOString().split('T')[0]}`},
        ${JSON.stringify({
          commissionId: commission.id,
          bookingId,
          completionDate,
          holdUntil,
        })},
        NOW()
      )
    `;

    return true;

  } catch (error: any) {
    console.error('❌ Error marking commission completed:', error);
    return false;
  }
}

/**
 * Reverse a commission (for cancellations/refunds)
 */
export async function reverseCommission(
  bookingId: string,
  reason: string
): Promise<boolean> {
  try {
    if (!sql) {
      return false;
    }

    // Find commission
    const commissionResult = await sql`
      SELECT * FROM commissions
      WHERE booking_id = ${bookingId}
        AND reversed = false
    `;

    if (commissionResult.length === 0) {
      return false;
    }

    const commission = commissionResult[0];

    // Mark as reversed
    await sql`
      UPDATE commissions
      SET
        reversed = true,
        reversal_reason = ${reason},
        reversal_amount = ${commission.commission_amount},
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = ${commission.id}
    `;

    // Deduct from affiliate balance (can go negative)
    await sql`
      UPDATE affiliates
      SET
        current_balance = current_balance - ${commission.commission_amount},
        pending_balance = pending_balance - ${commission.commission_amount},
        updated_at = NOW()
      WHERE id = ${commission.affiliate_id}
    `;

    // Log activity
    await sql`
      INSERT INTO affiliate_activity_logs (
        affiliate_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${commission.affiliate_id},
        'commission_reversed',
        ${`Commission reversed: -$${commission.commission_amount} (${reason})`},
        ${JSON.stringify({
          commissionId: commission.id,
          bookingId,
          reason,
          amount: commission.commission_amount,
        })},
        NOW()
      )
    `;

    return true;

  } catch (error: any) {
    console.error('❌ Error reversing commission:', error);
    return false;
  }
}

/**
 * Helper: Get commission rate for tier
 */
function getTierCommissionRate(tier: string): number {
  const rates: Record<string, number> = {
    starter: 0.15,   // 15%
    bronze: 0.20,    // 20%
    silver: 0.25,    // 25%
    gold: 0.30,      // 30%
    platinum: 0.35,  // 35%
  };
  return rates[tier] || 0.15;
}

/**
 * Helper: Check if affiliate should be upgraded to next tier
 */
async function checkAndUpgradeTier(affiliateId: string): Promise<void> {
  try {
    if (!sql) {
      return;
    }

    const affiliateResult = await sql`
      SELECT * FROM affiliates
      WHERE id = ${affiliateId}
    `;

    if (affiliateResult.length === 0) {
      return;
    }

    const affiliate = affiliateResult[0];
    const monthlyTrips = affiliate.monthly_completed_trips;

    // Tier thresholds
    let newTier = affiliate.tier;

    if (monthlyTrips >= 50 && affiliate.tier !== 'platinum') {
      newTier = 'platinum';
    } else if (monthlyTrips >= 30 && !['gold', 'platinum'].includes(affiliate.tier)) {
      newTier = 'gold';
    } else if (monthlyTrips >= 15 && !['silver', 'gold', 'platinum'].includes(affiliate.tier)) {
      newTier = 'silver';
    } else if (monthlyTrips >= 5 && !['bronze', 'silver', 'gold', 'platinum'].includes(affiliate.tier)) {
      newTier = 'bronze';
    }

    // Upgrade if needed
    if (newTier !== affiliate.tier) {
      await sql`
        UPDATE affiliates
        SET
          tier = ${newTier},
          updated_at = NOW()
        WHERE id = ${affiliateId}
      `;

      // Log tier upgrade
      await sql`
        INSERT INTO affiliate_activity_logs (
          affiliate_id,
          activity_type,
          description,
          metadata,
          created_at
        ) VALUES (
          ${affiliateId},
          'tier_upgraded',
          ${`Upgraded from ${affiliate.tier} to ${newTier}`},
          ${JSON.stringify({
            oldTier: affiliate.tier,
            newTier,
            monthlyTrips,
          })},
          NOW()
        )
      `;

      console.log(`✅ Affiliate ${affiliateId} upgraded from ${affiliate.tier} to ${newTier}`);
    }

  } catch (error: any) {
    console.error('❌ Error checking tier upgrade:', error);
  }
}
