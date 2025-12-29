export const dynamic = 'force-dynamic';

/**
 * Affiliate Referrals API
 *
 * GET /api/affiliates/me/referrals - Get affiliate's referral history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';

/**
 * GET /api/affiliates/me/referrals
 *
 * Get authenticated affiliate's referral list with filters
 *
 * Query params:
 * - status: 'click' | 'signed_up' | 'booked' | 'completed'
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
          ar.*,
          u.name as user_name,
          u.email as user_email,
          c.commission_amount,
          c.status as commission_status
        FROM affiliate_referrals ar
        LEFT JOIN users u ON ar.user_id = u.id
        LEFT JOIN commissions c ON ar.id = c.referral_id
        WHERE ar.affiliate_id = ${affiliate.id}
          AND ar.status = ${status}
        ORDER BY ar.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT
          ar.*,
          u.name as user_name,
          u.email as user_email,
          c.commission_amount,
          c.status as commission_status
        FROM affiliate_referrals ar
        LEFT JOIN users u ON ar.user_id = u.id
        LEFT JOIN commissions c ON ar.id = c.referral_id
        WHERE ar.affiliate_id = ${affiliate.id}
        ORDER BY ar.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const referrals = await query;

    // Get total count
    const countQuery = status
      ? sql`
          SELECT COUNT(*) as total
          FROM affiliate_referrals
          WHERE affiliate_id = ${affiliate.id}
            AND status = ${status}
        `
      : sql`
          SELECT COUNT(*) as total
          FROM affiliate_referrals
          WHERE affiliate_id = ${affiliate.id}
        `;

    const countResult = await countQuery;
    const total = parseInt(countResult[0].total);

    return NextResponse.json({
      success: true,
      data: {
        referrals: referrals.map((r: any) => ({
          id: r.id,
          clickId: r.click_id,
          status: r.status,

          // User info (if available)
          userId: r.user_id,
          userName: r.user_name,
          userEmail: r.user_email,

          // Commission info (if booked/completed)
          bookingId: r.booking_id,
          commissionAmount: r.commission_amount ? parseFloat(r.commission_amount) : null,
          commissionStatus: r.commission_status,

          // Click metadata
          ipAddress: r.ip_address,
          landingPage: r.landing_page,
          utmSource: r.utm_source,
          utmMedium: r.utm_medium,
          utmCampaign: r.utm_campaign,

          // Timestamps
          cookieExpiry: r.cookie_expiry,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching referrals:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch referrals',
      message: error.message,
    }, { status: 500 });
  }
}
