export const dynamic = 'force-dynamic';

/**
 * Affiliate Click Tracking API
 *
 * POST /api/affiliates/track-click - Track affiliate referral click
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';
import crypto from 'crypto';

/**
 * POST /api/affiliates/track-click
 *
 * Track an affiliate referral click and set tracking cookie
 *
 * Request body:
 * {
 *   referralCode: string; // The affiliate's referral code from URL param
 *   landingPage: string;  // The page user landed on
 *   utmSource?: string;
 *   utmMedium?: string;
 *   utmCampaign?: string;
 * }
 *
 * Response includes clickId to be stored in cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const referralCode = body.referralCode?.toUpperCase();

    // Validate required fields
    if (!referralCode) {
      return NextResponse.json({
        success: false,
        error: 'Referral code is required',
      }, { status: 400 });
    }

    // Find affiliate by referral code
    const affiliateResult = await sql`
      SELECT * FROM affiliates
      WHERE referral_code = ${referralCode}
        AND status = 'active'
    `;

    if (affiliateResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or inactive referral code',
      }, { status: 404 });
    }

    const affiliate = affiliateResult[0];

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate unique click ID
    const clickId = crypto.randomUUID();

    // Calculate cookie expiry (30 days from now)
    const cookieExpiry = new Date();
    cookieExpiry.setDate(cookieExpiry.getDate() + 30);

    // Create referral tracking record
    const result = await sql`
      INSERT INTO affiliate_referrals (
        affiliate_id,
        click_id,
        ip_address,
        user_agent,
        landing_page,
        utm_source,
        utm_medium,
        utm_campaign,
        cookie_expiry,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${affiliate.id},
        ${clickId},
        ${ipAddress},
        ${userAgent},
        ${body.landingPage || '/'},
        ${body.utmSource || null},
        ${body.utmMedium || null},
        ${body.utmCampaign || null},
        ${cookieExpiry.toISOString()},
        'click',
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Update affiliate click count
    await sql`
      UPDATE affiliates
      SET
        total_clicks = total_clicks + 1,
        updated_at = NOW()
      WHERE id = ${affiliate.id}
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
        ${affiliate.id},
        'click_tracked',
        'New referral click tracked',
        ${JSON.stringify({
          clickId,
          landingPage: body.landingPage,
          utmSource: body.utmSource,
        })},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: {
        clickId,
        referralId: result[0].id,
        affiliateId: affiliate.id,
        cookieExpiry: cookieExpiry.toISOString(),
        expiresInDays: 30,
      },
      message: 'Click tracked successfully',
    });

  } catch (error: any) {
    console.error('❌ Error tracking affiliate click:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to track click',
      message: error.message,
    }, { status: 500 });
  }
}
