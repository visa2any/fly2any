/**
 * Affiliate Commission Processing Cron Job
 *
 * Runs daily to:
 * 1. Approve commissions that have passed hold period
 * 2. Reset monthly stats (on 1st of month)
 * 3. Check and update affiliate tiers
 * 4. Send notifications for payouts available
 *
 * Trigger: Daily at 2:00 AM UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

/**
 * Verify Vercel cron or manual authentication
 */
function isAuthorized(request: NextRequest): boolean {
  // Method 1: Vercel cron (automatic) - sends x-vercel-cron: "1"
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) return true;

  // Method 2: Manual trigger - uses Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isManualAuth = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);

  return isManualAuth;
}

/**
 * GET /api/cron/process-affiliate-commissions
 * Vercel cron uses GET by default
 */
export async function GET(request: NextRequest) {
  return handleCronJob(request);
}

/**
 * POST /api/cron/process-affiliate-commissions
 * Support manual triggers via POST
 */
export async function POST(request: NextRequest) {
  return handleCronJob(request);
}

/**
 * Main cron job handler
 */
async function handleCronJob(request: NextRequest) {
  try {
    // Verify authentication (Vercel cron or manual)
    if (!isAuthorized(request)) {
      console.warn('⚠️ Unauthorized cron request for affiliate commissions');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    console.log('🚀 Starting affiliate commission processing...');

    const results = {
      commissionsApproved: 0,
      monthlyStatsReset: 0,
      tiersUpdated: 0,
      errors: [] as string[],
    };

    // ========================================
    // TASK 1: Approve commissions past hold period
    // ========================================
    try {
      const commissionsToApprove = await sql`
        SELECT * FROM commissions
        WHERE status = 'completed'
          AND hold_until <= NOW()
          AND reversed = false
      `;

      console.log(`📊 Found ${commissionsToApprove.length} commissions ready for approval`);

      for (const commission of commissionsToApprove) {
        try {
          // Update commission status to approved
          await sql`
            UPDATE commissions
            SET
              status = 'approved',
              updated_at = NOW()
            WHERE id = ${commission.id}
          `;

          // Move from pending_balance to current_balance
          await sql`
            UPDATE affiliates
            SET
              pending_balance = pending_balance - ${commission.commission_amount},
              current_balance = current_balance + ${commission.commission_amount},
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
              'commission_approved',
              ${`Commission approved: $${commission.commission_amount} now available for payout`},
              ${JSON.stringify({
                commissionId: commission.id,
                bookingId: commission.booking_id,
                amount: commission.commission_amount,
              })},
              NOW()
            )
          `;

          results.commissionsApproved++;

        } catch (error: any) {
          console.error(`❌ Error approving commission ${commission.id}:`, error);
          results.errors.push(`Commission ${commission.id}: ${error.message}`);
        }
      }

      console.log(`✅ Approved ${results.commissionsApproved} commissions`);

    } catch (error: any) {
      console.error('❌ Error in commission approval task:', error);
      results.errors.push(`Commission approval: ${error.message}`);
    }

    // ========================================
    // TASK 2: Reset monthly stats (on 1st of month)
    // ========================================
    try {
      const today = new Date();
      const isFirstOfMonth = today.getDate() === 1;

      if (isFirstOfMonth) {
        console.log('📅 First of month - resetting monthly stats...');

        const affiliates = await sql`
          SELECT * FROM affiliates
          WHERE status = 'active'
        `;

        for (const affiliate of affiliates) {
          try {
            // Check if last reset was more than 30 days ago
            const lastReset = new Date(affiliate.month_stats_last_reset);
            const daysSinceReset = Math.floor((today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceReset >= 28) {
              // Store old tier for comparison
              const oldTier = affiliate.tier;

              // Check if tier should be downgraded based on monthly performance
              const newTier = calculateTierFromMonthlyTrips(affiliate.monthly_completed_trips);

              // Reset monthly stats
              await sql`
                UPDATE affiliates
                SET
                  monthly_completed_trips = 0,
                  monthly_revenue = 0,
                  month_stats_last_reset = NOW(),
                  tier = ${newTier},
                  updated_at = NOW()
                WHERE id = ${affiliate.id}
              `;

              // Log if tier changed
              if (oldTier !== newTier) {
                await sql`
                  INSERT INTO affiliate_activity_logs (
                    affiliate_id,
                    activity_type,
                    description,
                    metadata,
                    created_at
                  ) VALUES (
                    ${affiliate.id},
                    'tier_updated',
                    ${`Tier ${oldTier === newTier ? 'maintained' : 'changed'} from ${oldTier} to ${newTier} based on monthly performance`},
                    ${JSON.stringify({
                      oldTier,
                      newTier,
                      monthlyTrips: affiliate.monthly_completed_trips,
                    })},
                    NOW()
                  )
                `;

                results.tiersUpdated++;
              }

              results.monthlyStatsReset++;
            }

          } catch (error: any) {
            console.error(`❌ Error resetting stats for affiliate ${affiliate.id}:`, error);
            results.errors.push(`Affiliate ${affiliate.id}: ${error.message}`);
          }
        }

        console.log(`✅ Reset monthly stats for ${results.monthlyStatsReset} affiliates`);
        console.log(`✅ Updated ${results.tiersUpdated} affiliate tiers`);
      }

    } catch (error: any) {
      console.error('❌ Error in monthly stats reset task:', error);
      results.errors.push(`Monthly stats reset: ${error.message}`);
    }

    // ========================================
    // TASK 3: Clean up expired referral cookies
    // ========================================
    try {
      const deletedCount = await sql`
        DELETE FROM affiliate_referrals
        WHERE status = 'click'
          AND cookie_expiry < NOW() - INTERVAL '90 days'
      `;

      console.log(`🧹 Cleaned up ${deletedCount.length} expired referral cookies`);

    } catch (error: any) {
      console.error('❌ Error cleaning up referrals:', error);
      results.errors.push(`Cleanup: ${error.message}`);
    }

    // ========================================
    // Return summary
    // ========================================
    console.log('✅ Affiliate commission processing complete');

    return NextResponse.json({
      success: true,
      message: 'Affiliate commission processing completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Fatal error in affiliate commission processing:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process affiliate commissions',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * Helper: Calculate tier based on monthly completed trips
 */
function calculateTierFromMonthlyTrips(monthlyTrips: number): string {
  if (monthlyTrips >= 50) return 'platinum';
  if (monthlyTrips >= 30) return 'gold';
  if (monthlyTrips >= 15) return 'silver';
  if (monthlyTrips >= 5) return 'bronze';
  return 'starter';
}
