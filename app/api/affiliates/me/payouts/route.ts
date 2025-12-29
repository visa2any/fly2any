export const dynamic = 'force-dynamic';

/**
 * Affiliate Payouts API
 *
 * GET /api/affiliates/me/payouts - Get affiliate's payout history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';

/**
 * GET /api/affiliates/me/payouts
 *
 * Get authenticated affiliate's payout history
 *
 * Query params:
 * - status: 'pending' | 'processing' | 'paid' | 'failed'
 * - limit: number (default 20)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    const sql = getSql();

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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query;
    if (status) {
      query = sql`
        SELECT * FROM payouts
        WHERE affiliate_id = ${affiliate.id}
          AND status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT * FROM payouts
        WHERE affiliate_id = ${affiliate.id}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const payouts = await query;

    // Get total count
    const countQuery = status
      ? sql`
          SELECT COUNT(*) as total
          FROM payouts
          WHERE affiliate_id = ${affiliate.id}
            AND status = ${status}
        `
      : sql`
          SELECT COUNT(*) as total
          FROM payouts
          WHERE affiliate_id = ${affiliate.id}
        `;

    const countResult = await countQuery;
    const total = parseInt(countResult[0].total);

    // Calculate totals by status
    const statusTotals = await sql`
      SELECT
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(net_amount) as total_net
      FROM payouts
      WHERE affiliate_id = ${affiliate.id}
      GROUP BY status
    `;

    return NextResponse.json({
      success: true,
      data: {
        payouts: payouts.map((p: any) => ({
          id: p.id,
          invoiceNumber: p.invoice_number,

          // Amounts
          amount: parseFloat(p.amount),
          processingFee: parseFloat(p.processing_fee || 0),
          netAmount: parseFloat(p.net_amount),

          // Details
          commissionCount: p.commission_count,
          method: p.method,
          status: p.status,

          // Period
          periodStart: p.period_start,
          periodEnd: p.period_end,

          // Receipt
          receiptUrl: p.receipt_url,

          // Timestamps
          createdAt: p.created_at,
          processingAt: p.processing_at,
          paidAt: p.paid_at,
          failedAt: p.failed_at,
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
            totalNet: parseFloat(s.total_net || 0),
          })),
          lifetimePaid: parseFloat(affiliate.total_commissions_paid),
        },
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching payouts:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch payouts',
      message: error.message,
    }, { status: 500 });
  }
}
