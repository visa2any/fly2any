/**
 * Admin Affiliates API
 *
 * GET /api/admin/affiliates - List all affiliates with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { requireAdmin } from '@/lib/admin/middleware';

/**
 * GET /api/admin/affiliates
 *
 * List all affiliates (admin only)
 *
 * Query params:
 * - status: 'pending' | 'active' | 'suspended' | 'banned'
 * - tier: 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum'
 * - search: string (search by name, email, referral code)
 * - sortBy: 'created' | 'earnings' | 'trips' | 'balance'
 * - sortOrder: 'asc' | 'desc'
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // SECURITY: Admin auth already enforced by requireAdmin() above

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build WHERE clause
    const conditions: string[] = ['1=1'];

    if (status) {
      conditions.push(`a.status = '${status}'`);
    }
    if (tier) {
      conditions.push(`a.tier = '${tier}'`);
    }
    if (search) {
      const searchTerm = search.replace(/'/g, "''");
      conditions.push(`(
        a.business_name ILIKE '%${searchTerm}%'
        OR a.referral_code ILIKE '%${searchTerm}%'
        OR u.email ILIKE '%${searchTerm}%'
        OR u.name ILIKE '%${searchTerm}%'
      )`);
    }

    // Build ORDER BY clause
    let orderByClause = 'a.created_at DESC';
    if (sortBy === 'earnings') {
      orderByClause = `a.total_commissions_earned ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'trips') {
      orderByClause = `a.completed_trips ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'balance') {
      orderByClause = `a.current_balance ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'created') {
      orderByClause = `a.created_at ${sortOrder.toUpperCase()}`;
    }

    // Execute query
    const affiliates = await sql.unsafe(`
      SELECT
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.created_at as user_joined,
        (
          SELECT COUNT(*)
          FROM affiliate_referrals ar
          WHERE ar.affiliate_id = a.id
        ) as total_referrals,
        (
          SELECT COUNT(*)
          FROM commissions c
          WHERE c.affiliate_id = a.id
            AND c.status IN ('completed', 'approved', 'paid')
        ) as successful_commissions
      FROM affiliates a
      JOIN users u ON a.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderByClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Get total count
    const countResult = await sql.unsafe(`
      SELECT COUNT(*) as total
      FROM affiliates a
      JOIN users u ON a.user_id = u.id
      WHERE ${conditions.join(' AND ')}
    `);

    const total = parseInt((countResult as any)[0].total);

    // Get summary stats
    const statsResult = await sql`
      SELECT
        COUNT(*) as total_affiliates,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        SUM(total_commissions_earned) as total_commissions,
        SUM(total_commissions_paid) as total_paid,
        SUM(current_balance) as total_balance_owed
      FROM affiliates
    `;

    return NextResponse.json({
      success: true,
      data: {
        affiliates: (affiliates as unknown as any[]).map((a: any) => ({
          id: a.id,
          userId: a.user_id,
          userName: a.user_name,
          userEmail: a.user_email,
          businessName: a.business_name,
          website: a.website,

          tier: a.tier,
          status: a.status,

          referralCode: a.referral_code,
          trackingId: a.tracking_id,

          metrics: {
            totalClicks: a.total_clicks,
            totalReferrals: parseInt(a.total_referrals),
            completedTrips: a.completed_trips,
            successfulCommissions: parseInt(a.successful_commissions),
            monthlyTrips: a.monthly_completed_trips,
          },

          financials: {
            totalCustomerSpend: parseFloat(a.total_customer_spend),
            totalYourProfit: parseFloat(a.total_your_profit),
            commissionsEarned: parseFloat(a.total_commissions_earned),
            commissionsPaid: parseFloat(a.total_commissions_paid),
            currentBalance: parseFloat(a.current_balance),
            pendingBalance: parseFloat(a.pending_balance),
          },

          payoutSettings: {
            method: a.payout_method,
            email: a.payout_email,
            minThreshold: parseFloat(a.min_payout_threshold),
          },

          createdAt: a.created_at,
          updatedAt: a.updated_at,
        })),

        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },

        summary: {
          totalAffiliates: parseInt(statsResult[0].total_affiliates),
          activeCount: parseInt(statsResult[0].active_count),
          pendingCount: parseInt(statsResult[0].pending_count),
          totalCommissionsEarned: parseFloat(statsResult[0].total_commissions || 0),
          totalCommissionsPaid: parseFloat(statsResult[0].total_paid || 0),
          totalBalanceOwed: parseFloat(statsResult[0].total_balance_owed || 0),
        },
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching affiliates:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch affiliates',
      message: error.message,
    }, { status: 500 });
  }
}
