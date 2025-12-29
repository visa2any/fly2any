/**
 * Affiliate Integration Helpers
 *
 * These functions make it easy to integrate affiliate tracking throughout the app
 */

import { getSql } from '@/lib/db/connection';
import { calculateAndCreateCommission, markCommissionCompleted, reverseCommission } from './commission-calculator';

/**
 * Link a user signup to an affiliate referral (if exists)
 *
 * Call this when a new user signs up
 */
export async function linkUserSignupToReferral(
  userId: string,
  clickId?: string
): Promise<boolean> {
  try {
    if (!sql) {
      return false;
    }

    // Find referral by click ID (from cookie)
    if (!clickId) {
      return false;
    }

    const referralResult = await sql`
      SELECT * FROM affiliate_referrals
      WHERE click_id = ${clickId}
        AND cookie_expiry > NOW()
        AND status = 'click'
    `;

    if (referralResult.length === 0) {
      return false;
    }

    const referral = referralResult[0];

    // Update referral to link user and change status
    await sql`
      UPDATE affiliate_referrals
      SET
        user_id = ${userId},
        status = 'signed_up',
        updated_at = NOW()
      WHERE id = ${referral.id}
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
        ${referral.affiliate_id},
        'user_signup',
        'Referred user signed up',
        ${JSON.stringify({
          userId,
          referralId: referral.id,
          clickId,
        })},
        NOW()
      )
    `;

    console.log(`✅ Linked user ${userId} to affiliate referral ${referral.id}`);
    return true;

  } catch (error: any) {
    console.error('❌ Error linking user signup to referral:', error);
    return false;
  }
}

/**
 * Process affiliate commission when a booking is created
 *
 * Call this in your booking creation flow AFTER payment is confirmed
 *
 * @param bookingData - Booking information
 * @returns Commission result with commissionId if successful
 */
export async function processAffiliateCommissionForBooking(bookingData: {
  bookingId: string;
  userId?: string;
  customerTotalPaid: number;
  supplierCost: number;
  revenueModel: 'commission' | 'markup';
  markup?: number;
  bookingDate: Date;
  travelDate: Date;
}) {
  try {
    const result = await calculateAndCreateCommission(bookingData);

    if (result.success && result.commissionId) {
      console.log(
        `✅ Affiliate commission created: $${result.commissionAmount} for booking ${bookingData.bookingId}`
      );
    }

    return result;

  } catch (error: any) {
    console.error('❌ Error processing affiliate commission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark trip as completed and process commission hold period
 *
 * Call this when a trip is successfully completed (after travel date)
 */
export async function markTripCompletedForAffiliate(bookingId: string): Promise<boolean> {
  try {
    const success = await markCommissionCompleted(bookingId);

    if (success) {
      console.log(`✅ Trip completion processed for booking ${bookingId}`);
    }

    return success;

  } catch (error: any) {
    console.error('❌ Error marking trip completed:', error);
    return false;
  }
}

/**
 * Reverse commission for cancelled/refunded booking
 *
 * Call this when a booking is cancelled or refunded
 */
export async function handleBookingCancellationForAffiliate(
  bookingId: string,
  reason: 'cancelled' | 'refunded' | 'chargeback'
): Promise<boolean> {
  try {
    const reasonText = reason === 'cancelled'
      ? 'Booking cancelled by customer'
      : reason === 'refunded'
      ? 'Booking refunded'
      : 'Payment disputed/chargeback';

    const success = await reverseCommission(bookingId, reasonText);

    if (success) {
      console.log(`✅ Commission reversed for booking ${bookingId} (${reason})`);
    }

    return success;

  } catch (error: any) {
    console.error('❌ Error reversing commission:', error);
    return false;
  }
}

/**
 * Get affiliate tracking data from cookie
 *
 * Call this to check if current user has affiliate attribution
 */
export function getAffiliateTrackingFromCookie(
  cookieValue: string | undefined
): { clickId: string; affiliateCode: string } | null {
  try {
    if (!cookieValue) {
      return null;
    }

    // Parse cookie format: "clickId|affiliateCode"
    const [clickId, affiliateCode] = cookieValue.split('|');

    if (!clickId || !affiliateCode) {
      return null;
    }

    return { clickId, affiliateCode };

  } catch (error) {
    return null;
  }
}

/**
 * Set affiliate tracking cookie (client-side helper)
 *
 * Returns cookie value string to be set
 */
export function createAffiliateTrackingCookie(
  clickId: string,
  affiliateCode: string,
  expiryDate: Date
): string {
  return `${clickId}|${affiliateCode}`;
}

/**
 * Check if user has pending affiliate balance and send notification
 *
 * Useful for showing in-app notifications about available payouts
 */
export async function checkAffiliatePayoutEligibility(
  affiliateId: string
): Promise<{
  eligible: boolean;
  availableAmount: number;
  minThreshold: number;
  approvedCommissionCount: number;
}> {
  try {
    if (!sql) {
      return {
        eligible: false,
        availableAmount: 0,
        minThreshold: 50,
        approvedCommissionCount: 0,
      };
    }

    // Get affiliate info
    const affiliateResult = await sql`
      SELECT * FROM affiliates
      WHERE id = ${affiliateId}
    `;

    if (affiliateResult.length === 0) {
      return {
        eligible: false,
        availableAmount: 0,
        minThreshold: 50,
        approvedCommissionCount: 0,
      };
    }

    const affiliate = affiliateResult[0];

    // Count approved commissions
    const approvedCommissions = await sql`
      SELECT
        COUNT(*) as count,
        SUM(commission_amount) as total
      FROM commissions
      WHERE affiliate_id = ${affiliateId}
        AND status = 'completed'
        AND hold_until <= NOW()
        AND reversed = false
    `;

    const count = parseInt(approvedCommissions[0].count || 0);
    const total = parseFloat(approvedCommissions[0].total || 0);
    const minThreshold = parseFloat(affiliate.min_payout_threshold || 50);

    return {
      eligible: total >= minThreshold && count > 0,
      availableAmount: total,
      minThreshold,
      approvedCommissionCount: count,
    };

  } catch (error: any) {
    console.error('❌ Error checking payout eligibility:', error);
    return {
      eligible: false,
      availableAmount: 0,
      minThreshold: 50,
      approvedCommissionCount: 0,
    };
  }
}
