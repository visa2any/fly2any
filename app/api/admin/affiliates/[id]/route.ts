/**
 * Admin Individual Affiliate API
 *
 * GET   /api/admin/affiliates/[id] - Get affiliate details
 * PATCH /api/admin/affiliates/[id] - Update affiliate (approve/suspend/etc)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { requireAdmin, logAdminAction } from '@/lib/admin/middleware';

/**
 * GET /api/admin/affiliates/[id]
 *
 * Get detailed affiliate information (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY: Enforce admin authentication - fail closed
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id: affiliateId } = params;

    // Get affiliate with user info
    const affiliateResult = await sql`
      SELECT a.*, u.name, u.email, u.created_at as user_joined
      FROM affiliates a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ${affiliateId}
    `;

    if (affiliateResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate not found',
      }, { status: 404 });
    }

    const affiliate = affiliateResult[0];

    // Get recent activity logs
    const activityLogs = await sql`
      SELECT * FROM affiliate_activity_logs
      WHERE affiliate_id = ${affiliateId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Get commission summary
    const commissionSummary = await sql`
      SELECT
        status,
        COUNT(*) as count,
        SUM(commission_amount) as total
      FROM commissions
      WHERE affiliate_id = ${affiliateId}
      GROUP BY status
    `;

    // Get payout summary
    const payoutSummary = await sql`
      SELECT
        status,
        COUNT(*) as count,
        SUM(amount) as total
      FROM payouts
      WHERE affiliate_id = ${affiliateId}
      GROUP BY status
    `;

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          userId: affiliate.user_id,
          userName: affiliate.name,
          userEmail: affiliate.email,
          userJoined: affiliate.user_joined,

          businessName: affiliate.business_name,
          website: affiliate.website,
          taxId: affiliate.tax_id,

          tier: affiliate.tier,
          status: affiliate.status,

          referralCode: affiliate.referral_code,
          trackingId: affiliate.tracking_id,

          metrics: {
            totalClicks: affiliate.total_clicks,
            completedTrips: affiliate.completed_trips,
            monthlyCompletedTrips: affiliate.monthly_completed_trips,
            monthlyRevenue: parseFloat(affiliate.monthly_revenue),
          },

          financials: {
            totalCustomerSpend: parseFloat(affiliate.total_customer_spend),
            totalYourProfit: parseFloat(affiliate.total_your_profit),
            totalCommissionsEarned: parseFloat(affiliate.total_commissions_earned),
            totalCommissionsPaid: parseFloat(affiliate.total_commissions_paid),
            currentBalance: parseFloat(affiliate.current_balance),
            pendingBalance: parseFloat(affiliate.pending_balance),
          },

          payoutSettings: {
            method: affiliate.payout_method,
            email: affiliate.payout_email,
            minThreshold: parseFloat(affiliate.min_payout_threshold),
          },

          createdAt: affiliate.created_at,
          updatedAt: affiliate.updated_at,
        },

        commissionSummary: commissionSummary.map((c: any) => ({
          status: c.status,
          count: parseInt(c.count),
          total: parseFloat(c.total || 0),
        })),

        payoutSummary: payoutSummary.map((p: any) => ({
          status: p.status,
          count: parseInt(p.count),
          total: parseFloat(p.total || 0),
        })),

        recentActivity: activityLogs.map((log: any) => ({
          id: log.id,
          activityType: log.activity_type,
          description: log.description,
          metadata: log.metadata,
          createdAt: log.created_at,
        })),
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching affiliate:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch affiliate',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/affiliates/[id]
 *
 * Update affiliate status or settings (admin only)
 *
 * Request body:
 * {
 *   status?: 'pending' | 'active' | 'suspended' | 'banned';
 *   tier?: 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum';
 *   minPayoutThreshold?: number;
 *   notes?: string; // Admin notes about the action
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY: Enforce admin authentication - fail closed
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const adminUserId = authResult.userId;

    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id: affiliateId } = params;
    const body = await request.json();

    // Check if affiliate exists
    const existing = await sql`
      SELECT * FROM affiliates
      WHERE id = ${affiliateId}
    `;

    if (existing.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Affiliate not found',
      }, { status: 404 });
    }

    // Build update query
    const updates: string[] = [];

    if (body.status && ['pending', 'active', 'suspended', 'banned'].includes(body.status)) {
      updates.push(`status = '${body.status}'`);
    }

    if (body.tier && ['starter', 'bronze', 'silver', 'gold', 'platinum'].includes(body.tier)) {
      updates.push(`tier = '${body.tier}'`);
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
       WHERE id = '${affiliateId}'
       RETURNING *`
    ) as any;

    // Log admin action
    await sql`
      INSERT INTO affiliate_activity_logs (
        affiliate_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${affiliateId},
        'admin_update',
        ${body.notes || 'Admin updated affiliate settings'},
        ${JSON.stringify({
          adminUserId,
          updates: body,
          timestamp: new Date().toISOString(),
        })},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Affiliate updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error updating affiliate:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update affiliate',
      message: error.message,
    }, { status: 500 });
  }
}
