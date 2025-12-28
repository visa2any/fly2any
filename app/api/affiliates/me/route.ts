export const dynamic = 'force-dynamic';

/**
 * Affiliate Profile API
 *
 * GET   /api/affiliates/me - Get current affiliate profile
 * PATCH /api/affiliates/me - Update affiliate profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';

/**
 * GET /api/affiliates/me
 *
 * Get authenticated user's affiliate profile and stats
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
    const result = await sql`
      SELECT a.*, u.email, u.name
      FROM affiliates a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ${userId}
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate account not found',
        hint: 'Register as an affiliate first at /api/affiliates/register',
      }, { status: 404 });
    }

    const affiliate = result[0];

    // Get tier configuration
    const tierConfig = getTierConfig(affiliate.tier);

    return NextResponse.json({
      success: true,
      data: {
        id: affiliate.id,
        userId: affiliate.user_id,
        userName: affiliate.name,
        userEmail: affiliate.email,
        businessName: affiliate.business_name,
        website: affiliate.website,
        taxId: affiliate.tax_id,

        // Status & Tier
        tier: affiliate.tier,
        status: affiliate.status,
        tierConfig,

        // Performance Metrics
        metrics: {
          totalClicks: affiliate.total_clicks,
          completedTrips: affiliate.completed_trips,
          totalCustomerSpend: parseFloat(affiliate.total_customer_spend),
          totalYourProfit: parseFloat(affiliate.total_your_profit),
          totalCommissionsEarned: parseFloat(affiliate.total_commissions_earned),
          totalCommissionsPaid: parseFloat(affiliate.total_commissions_paid),
        },

        // Monthly Stats
        monthly: {
          completedTrips: affiliate.monthly_completed_trips,
          revenue: parseFloat(affiliate.monthly_revenue),
          lastReset: affiliate.month_stats_last_reset,
        },

        // Balance
        balance: {
          current: parseFloat(affiliate.current_balance),
          pending: parseFloat(affiliate.pending_balance),
          minPayoutThreshold: parseFloat(affiliate.min_payout_threshold),
        },

        // Payout Settings
        payout: {
          method: affiliate.payout_method,
          email: affiliate.payout_email,
        },

        // Tracking
        referralCode: affiliate.referral_code,
        trackingId: affiliate.tracking_id,
        trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${affiliate.referral_code}`,

        // Timestamps
        createdAt: affiliate.created_at,
        updatedAt: affiliate.updated_at,
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching affiliate profile:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch affiliate profile',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/affiliates/me
 *
 * Update affiliate profile settings
 *
 * Request body:
 * {
 *   businessName?: string;
 *   website?: string;
 *   taxId?: string;
 *   payoutEmail?: string;
 *   payoutMethod?: 'paypal' | 'stripe' | 'bank_transfer';
 *   minPayoutThreshold?: number;
 * }
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    // Check if affiliate exists
    const existing = await sql`
      SELECT * FROM affiliates
      WHERE user_id = ${userId}
    `;

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate account not found',
      }, { status: 404 });
    }

    // Build update query conditionally
    const updates: string[] = [];

    if (body.businessName !== undefined) {
      updates.push(`business_name = '${String(body.businessName || '').replace(/'/g, "''")}'`);
    }
    if (body.website !== undefined) {
      updates.push(`website = '${String(body.website || '').replace(/'/g, "''")}'`);
    }
    if (body.taxId !== undefined) {
      updates.push(`tax_id = '${String(body.taxId || '').replace(/'/g, "''")}'`);
    }
    if (body.payoutEmail !== undefined) {
      updates.push(`payout_email = '${String(body.payoutEmail).replace(/'/g, "''")}'`);
    }
    if (body.payoutMethod !== undefined && ['paypal', 'stripe', 'bank_transfer'].includes(body.payoutMethod)) {
      updates.push(`payout_method = '${body.payoutMethod}'`);
    }
    if (body.minPayoutThreshold !== undefined && body.minPayoutThreshold >= 10) {
      updates.push(`min_payout_threshold = ${body.minPayoutThreshold}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update',
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    const result = await sql.unsafe(
      `UPDATE affiliates
       SET ${updates.join(', ')}
       WHERE user_id = '${userId}'
       RETURNING *`
    ) as any;

    // Log activity
    await sql`
      INSERT INTO affiliate_activity_logs (
        affiliate_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${result[0].id},
        'profile_updated',
        'Affiliate profile updated',
        ${JSON.stringify({ updatedFields: Object.keys(body) })},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Affiliate profile updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error updating affiliate profile:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update affiliate profile',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * Helper: Get tier configuration
 */
function getTierConfig(tier: string) {
  const tiers: Record<string, any> = {
    starter: {
      name: 'Starter',
      commissionRate: 0.15, // 15% of Fly2Any profit
      requiredMonthlyTrips: 0,
      color: '#94a3b8', // slate-400
      benefits: [
        '15% commission on completed trips',
        'Access to marketing materials',
        'Monthly performance reports',
      ],
    },
    bronze: {
      name: 'Bronze',
      commissionRate: 0.20, // 20% of Fly2Any profit
      requiredMonthlyTrips: 5,
      color: '#cd7f32',
      benefits: [
        '20% commission on completed trips',
        'Priority support',
        'Custom tracking dashboard',
        'Early access to promotions',
      ],
    },
    silver: {
      name: 'Silver',
      commissionRate: 0.25, // 25% of Fly2Any profit
      requiredMonthlyTrips: 15,
      color: '#c0c0c0',
      benefits: [
        '25% commission on completed trips',
        'Dedicated account manager',
        'Custom promotional codes',
        'Quarterly bonus opportunities',
      ],
    },
    gold: {
      name: 'Gold',
      commissionRate: 0.30, // 30% of Fly2Any profit
      requiredMonthlyTrips: 30,
      color: '#ffd700',
      benefits: [
        '30% commission on completed trips',
        'Premium support 24/7',
        'Co-branded marketing materials',
        'Revenue share on referrals',
      ],
    },
    platinum: {
      name: 'Platinum',
      commissionRate: 0.35, // 35% of Fly2Any profit
      requiredMonthlyTrips: 50,
      color: '#e5e4e2',
      benefits: [
        '35% commission on completed trips',
        'VIP account management',
        'Custom integration options',
        'Exclusive high-value deals',
        'Annual performance bonus',
      ],
    },
  };

  return tiers[tier] || tiers.starter;
}
