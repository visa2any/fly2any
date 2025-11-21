/**
 * Affiliate Dashboard API
 *
 * GET /api/affiliates/me/dashboard - Get comprehensive dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';

/**
 * GET /api/affiliates/me/dashboard
 *
 * Get comprehensive dashboard data for affiliate
 */
export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // TODO: Get user ID from auth
    const userId = 'demo-user-001';

    // Get affiliate account
    const affiliateResult = await sql`
      SELECT * FROM affiliates
      WHERE user_id = ${userId}
    `;

    if (affiliateResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate account not found',
      }, { status: 404 });
    }

    const affiliate = affiliateResult[0];

    // Get click stats (last 30 days)
    const clickStats = await sql`
      SELECT
        COUNT(*) as total_clicks,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        COUNT(CASE WHEN status = 'signed_up' THEN 1 END) as signups,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) as bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM affiliate_referrals
      WHERE affiliate_id = ${affiliate.id}
        AND created_at >= NOW() - INTERVAL '30 days'
    `;

    // Get commission breakdown by status
    const commissionBreakdown = await sql`
      SELECT
        status,
        COUNT(*) as count,
        SUM(commission_amount) as total_amount
      FROM commissions
      WHERE affiliate_id = ${affiliate.id}
      GROUP BY status
      ORDER BY
        CASE status
          WHEN 'paid' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'hold' THEN 3
          WHEN 'completed' THEN 4
          WHEN 'booked' THEN 5
          WHEN 'pending' THEN 6
          ELSE 7
        END
    `;

    // Get recent commissions (last 10)
    const recentCommissions = await sql`
      SELECT
        c.*,
        ar.user_id as referred_user_id
      FROM commissions c
      LEFT JOIN affiliate_referrals ar ON c.referral_id = ar.id
      WHERE c.affiliate_id = ${affiliate.id}
      ORDER BY c.created_at DESC
      LIMIT 10
    `;

    // Get payout history (last 5)
    const payoutHistory = await sql`
      SELECT * FROM payouts
      WHERE affiliate_id = ${affiliate.id}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // Get performance over time (last 12 months)
    const monthlyPerformance = await sql`
      SELECT
        DATE_TRUNC('month', booking_date) as month,
        COUNT(*) as trip_count,
        SUM(commission_amount) as total_commission,
        SUM(customer_total_paid) as total_revenue
      FROM commissions
      WHERE affiliate_id = ${affiliate.id}
        AND booking_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', booking_date)
      ORDER BY month DESC
    `;

    // Calculate conversion funnel
    const totalClicks = parseInt(clickStats[0].total_clicks);
    const totalSignups = parseInt(clickStats[0].signups);
    const totalBookings = parseInt(clickStats[0].bookings);
    const totalCompleted = parseInt(clickStats[0].completed);

    const conversionRates = {
      clickToSignup: totalClicks > 0 ? (totalSignups / totalClicks * 100).toFixed(2) : '0.00',
      signupToBooking: totalSignups > 0 ? (totalBookings / totalSignups * 100).toFixed(2) : '0.00',
      bookingToCompleted: totalBookings > 0 ? (totalCompleted / totalBookings * 100).toFixed(2) : '0.00',
      clickToCompleted: totalClicks > 0 ? (totalCompleted / totalClicks * 100).toFixed(2) : '0.00',
    };

    // Calculate next tier progress
    const nextTierInfo = getNextTierInfo(
      affiliate.tier,
      affiliate.monthly_completed_trips
    );

    // Get top performing referral sources (UTM tracking)
    const topSources = await sql`
      SELECT
        COALESCE(utm_source, 'Direct') as source,
        COUNT(*) as clicks,
        COUNT(CASE WHEN status IN ('booked', 'completed') THEN 1 END) as conversions
      FROM affiliate_referrals
      WHERE affiliate_id = ${affiliate.id}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY utm_source
      ORDER BY conversions DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      data: {
        // Overview
        overview: {
          tier: affiliate.tier,
          status: affiliate.status,
          currentBalance: parseFloat(affiliate.current_balance),
          pendingBalance: parseFloat(affiliate.pending_balance),
          lifetimeEarnings: parseFloat(affiliate.total_commissions_earned),
          lifetimePaid: parseFloat(affiliate.total_commissions_paid),
        },

        // Performance (Last 30 Days)
        last30Days: {
          clicks: totalClicks,
          signups: totalSignups,
          bookings: totalBookings,
          completedTrips: totalCompleted,
          activeDays: parseInt(clickStats[0].active_days),
          conversionRates,
        },

        // Commission Breakdown
        commissions: {
          byStatus: commissionBreakdown.map((c: any) => ({
            status: c.status,
            count: parseInt(c.count),
            totalAmount: parseFloat(c.total_amount || 0),
          })),
          recent: recentCommissions.map((c: any) => ({
            id: c.id,
            bookingId: c.booking_id,
            referredUserId: c.referred_user_id,
            revenueModel: c.revenue_model,
            customerPaid: parseFloat(c.customer_total_paid),
            yourProfit: parseFloat(c.your_gross_profit),
            commissionRate: parseFloat(c.commission_rate),
            commissionAmount: parseFloat(c.commission_amount),
            status: c.status,
            bookingDate: c.booking_date,
            travelDate: c.travel_date,
            completionDate: c.completion_date,
            holdUntil: c.hold_until,
          })),
        },

        // Payout History
        payouts: payoutHistory.map((p: any) => ({
          id: p.id,
          amount: parseFloat(p.amount),
          commissionCount: p.commission_count,
          method: p.method,
          status: p.status,
          periodStart: p.period_start,
          periodEnd: p.period_end,
          processingFee: parseFloat(p.processing_fee || 0),
          netAmount: parseFloat(p.net_amount),
          createdAt: p.created_at,
          paidAt: p.paid_at,
        })),

        // Monthly Performance (Last 12 Months)
        monthlyPerformance: monthlyPerformance.map((m: any) => ({
          month: m.month,
          tripCount: parseInt(m.trip_count),
          totalCommission: parseFloat(m.total_commission),
          totalRevenue: parseFloat(m.total_revenue),
        })),

        // Tier Progress
        tierProgress: {
          currentTier: affiliate.tier,
          monthlyCompletedTrips: affiliate.monthly_completed_trips,
          nextTier: nextTierInfo.nextTier,
          tripsNeeded: nextTierInfo.tripsNeeded,
          progressPercentage: nextTierInfo.progressPercentage,
          nextTierCommissionRate: nextTierInfo.nextTierCommissionRate,
        },

        // Top Performing Sources (UTM Tracking)
        topSources: topSources.map((s: any) => ({
          source: s.source,
          clicks: parseInt(s.clicks),
          conversions: parseInt(s.conversions),
          conversionRate: parseInt(s.clicks) > 0
            ? ((parseInt(s.conversions) / parseInt(s.clicks)) * 100).toFixed(2)
            : '0.00',
        })),
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching affiliate dashboard:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch affiliate dashboard',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * Helper: Calculate next tier progress
 */
function getNextTierInfo(currentTier: string, monthlyTrips: number) {
  const tiers = [
    { name: 'starter', requiredTrips: 0, commissionRate: 0.15 },
    { name: 'bronze', requiredTrips: 5, commissionRate: 0.20 },
    { name: 'silver', requiredTrips: 15, commissionRate: 0.25 },
    { name: 'gold', requiredTrips: 30, commissionRate: 0.30 },
    { name: 'platinum', requiredTrips: 50, commissionRate: 0.35 },
  ];

  const currentIndex = tiers.findIndex(t => t.name === currentTier);
  const nextTier = tiers[currentIndex + 1];

  if (!nextTier) {
    return {
      nextTier: null,
      tripsNeeded: 0,
      progressPercentage: 100,
      nextTierCommissionRate: tiers[currentIndex].commissionRate,
    };
  }

  const currentRequired = tiers[currentIndex].requiredTrips;
  const nextRequired = nextTier.requiredTrips;
  const tripsNeeded = Math.max(0, nextRequired - monthlyTrips);
  const progressPercentage = Math.min(
    100,
    ((monthlyTrips - currentRequired) / (nextRequired - currentRequired) * 100)
  );

  return {
    nextTier: nextTier.name,
    tripsNeeded,
    progressPercentage: progressPercentage.toFixed(0),
    nextTierCommissionRate: nextTier.commissionRate,
  };
}
