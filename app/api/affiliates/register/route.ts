/**
 * Affiliate Registration API
 *
 * POST /api/affiliates/register - Register as an affiliate partner
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { sendAffiliateWelcomeEmail, sendAdminAffiliateNotification } from '@/lib/email/affiliate-notifications'
import crypto from 'crypto'

const prisma = getPrismaClient()

/**
 * POST /api/affiliates/register
 *
 * Register current user as an affiliate partner
 *
 * Request body:
 * {
 *   businessName?: string;
 *   website?: string;
 *   taxId?: string;
 *   description?: string;
 *   payoutEmail: string;
 *   payoutMethod?: 'paypal' | 'stripe' | 'bank_transfer';
 *   referralCode: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()

    // Validate required fields
    if (!body.payoutEmail) {
      return NextResponse.json(
        { error: 'Payout email is required' },
        { status: 400 }
      )
    }

    if (!body.referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Validate referral code format (4-20 uppercase alphanumeric)
    const referralCode = body.referralCode.toUpperCase().trim()
    if (!/^[A-Z0-9]{4,20}$/.test(referralCode)) {
      return NextResponse.json(
        { error: 'Referral code must be 4-20 uppercase letters and numbers only' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.payoutEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already has affiliate account
    const existingAffiliate = await prisma!.affiliate.findUnique({
      where: { userId },
    })

    if (existingAffiliate) {
      return NextResponse.json(
        {
          error: 'You already have an affiliate account',
          affiliateId: existingAffiliate.id,
        },
        { status: 400 }
      )
    }

    // Check if referral code is already taken
    const codeExists = await prisma!.affiliate.findUnique({
      where: { referralCode },
    })

    if (codeExists) {
      return NextResponse.json(
        { error: 'Referral code already taken. Please choose another.' },
        { status: 400 }
      )
    }

    // Generate unique tracking ID
    const trackingId = crypto.randomUUID()

    // Create affiliate account with Prisma
    const affiliate = await prisma!.affiliate.create({
      data: {
        userId,
        businessName: body.businessName?.trim() || null,
        website: body.website?.trim() || null,
        taxId: body.taxId?.trim() || null,
        description: body.description?.trim() || null,
        tier: 'starter',
        status: 'pending', // Requires admin approval
        referralCode,
        trackingId,
        payoutEmail: body.payoutEmail.trim(),
        payoutMethod: body.payoutMethod || 'paypal',
        emailNotifications: true,
        weeklyReports: true,
        monthlyStatements: true,
        minPayoutThreshold: 50,
        currentBalance: 0,
        pendingBalance: 0,
        lifetimeEarnings: 0,
        lifetimePaid: 0,
        totalClicks: 0,
        totalReferrals: 0,
        completedTrips: 0,
        canceledBookings: 0,
        refundedBookings: 0,
        totalCustomerSpend: 0,
        totalYourProfit: 0,
        totalCommissionsEarned: 0,
        totalCommissionsPaid: 0,
        monthlyCompletedTrips: 0,
        monthlyRevenue: 0,
        monthlyCommissions: 0,
        monthStatsLastReset: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log registration activity
    console.log(`✅ Affiliate registered: ${affiliate.id} (User: ${userId}, Code: ${referralCode})`)

    // Generate tracking URL
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${referralCode}`

    // Send welcome email to affiliate (async, don't wait)
    sendAffiliateWelcomeEmail({
      name: affiliate.user.name || 'Partner',
      email: affiliate.user.email,
      businessName: affiliate.businessName || undefined,
      website: affiliate.website || undefined,
      referralCode: affiliate.referralCode,
      trackingUrl,
    }).catch(error => {
      console.error('Failed to send welcome email:', error)
    })

    // Send notification to admin (async, don't wait)
    sendAdminAffiliateNotification({
      name: affiliate.user.name || 'Partner',
      email: affiliate.user.email,
      businessName: affiliate.businessName || undefined,
      website: affiliate.website || undefined,
      referralCode: affiliate.referralCode,
      trackingUrl,
    }).catch(error => {
      console.error('Failed to send admin notification:', error)
    })

    // Send success response
    return NextResponse.json({
      success: true,
      data: {
        id: affiliate.id,
        userId: affiliate.userId,
        businessName: affiliate.businessName,
        website: affiliate.website,
        tier: affiliate.tier,
        status: affiliate.status,
        referralCode: affiliate.referralCode,
        trackingId: affiliate.trackingId,
        payoutEmail: affiliate.payoutEmail,
        payoutMethod: affiliate.payoutMethod,
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${referralCode}`,
        createdAt: affiliate.createdAt,
      },
      message: 'Affiliate application submitted successfully! Pending admin approval.',
    })
  } catch (error: any) {
    console.error('❌ Error registering affiliate:', error)

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'referralCode') {
        return NextResponse.json(
          { error: 'Referral code already taken. Please choose another.' },
          { status: 400 }
        )
      }
      if (field === 'userId') {
        return NextResponse.json(
          { error: 'You already have an affiliate account.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to register affiliate account',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
