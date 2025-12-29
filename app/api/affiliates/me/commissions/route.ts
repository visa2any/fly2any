export const dynamic = 'force-dynamic';

/**
 * Affiliate Commissions API
 *
 * GET /api/affiliates/me/commissions - Get affiliate's commission history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';

/**
 * GET /api/affiliates/me/commissions
 *
 * Get authenticated affiliate's commission history with filters
 *
 * Query params:
 * - status: 'pending' | 'booked' | 'completed' | 'hold' | 'approved' | 'paid' | 'cancelled'
 * - limit: number (default 50)
 * - offset: number (default 0)
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query;
    if (status) {
      query = sql`
        SELECT
          c.*,
          ar.click_id,
          ar.utm_source,
          u.name as user_name,
          u.email as user_email
        FROM commissions c
        LEFT JOIN affiliate_referrals ar ON c.referral_id = ar.id
        LEFT JOIN users u ON ar.user_id = u.id
        WHERE c.affiliate_id = ${affiliate.id}
          AND c.status = ${status}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT
          c.*,
          ar.click_id,
          ar.utm_source,
          u.name as user_name,
          u.email as user_email
        FROM commissions c
        LEFT JOIN affiliate_referrals ar ON c.referral_id = ar.id
        LEFT JOIN users u ON ar.user_id = u.id
        WHERE c.affiliate_id = ${affiliate.id}
        ORDER BY c.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const commissions = await query;

    // Get total count
    const countQuery = status
      ? sql`
          SELECT COUNT(*) as total
          FROM commissions
          WHERE affiliate_id = ${affiliate.id}
            AND status = ${status}
        `
      : sql`
          SELECT COUNT(*) as total
          FROM commissions
          WHERE affiliate_id = ${affiliate.id}
        `;

    const countResult = await countQuery;
    const total = parseInt(countResult[0].total);

    // Calculate totals by status
    const statusTotals = await sql`
      SELECT
        status,
        COUNT(*) as count,
        SUM(commission_amount) as total_amount
      FROM commissions
      WHERE affiliate_id = ${affiliate.id}
      GROUP BY status
    `;

    return NextResponse.json({
      success: true,
      data: {
        commissions: commissions.map((c: any) => ({
          id: c.id,
          bookingId: c.booking_id,
          referralId: c.referral_id,

          // Customer info
          userName: c.user_name,
          userEmail: c.user_email,

          // Revenue breakdown
          revenueModel: c.revenue_model,
          customerTotalPaid: parseFloat(c.customer_total_paid),
          supplierCost: parseFloat(c.supplier_cost),
          yourGrossProfit: parseFloat(c.your_gross_profit),

          // Commission details
          affiliateTierAtBooking: c.affiliate_tier_at_booking,
          commissionRate: parseFloat(c.commission_rate),
          commissionAmount: parseFloat(c.commission_amount),

          // Status & lifecycle
          status: c.status,
          bookingDate: c.booking_date,
          travelDate: c.travel_date,
          completionDate: c.completion_date,
          holdUntil: c.hold_until,
          holdPeriodDays: c.hold_period_days,

          // Reversal info
          reversed: c.reversed,
          reversalReason: c.reversal_reason,
          reversalAmount: c.reversal_amount ? parseFloat(c.reversal_amount) : null,

          // UTM tracking
          utmSource: c.utm_source,
          clickId: c.click_id,

          // Timestamps
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),

        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },

        summary: {
          byStatus: statusTotals.map((s: any) => ({
            status: s.status,
            count: parseInt(s.count),
            totalAmount: parseFloat(s.total_amount || 0),
          })),
        },
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching commissions:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commissions',
      message: error.message,
    }, { status: 500 });
  }
}
