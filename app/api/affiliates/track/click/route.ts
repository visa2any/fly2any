export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { trackReferralClick } from '@/lib/services/referralTrackingService'

/**
 * POST /api/affiliates/track/click
 *
 * Track affiliate referral click
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get IP address from headers
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Track click
    const result = await trackReferralClick({
      referralCode: body.referralCode,
      ipAddress,
      userAgent,
      referrerUrl: body.referrerUrl,
      landingPage: body.landingPage,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      clickId: result.clickId,
    })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}
