/**
 * Affiliate Payout Request API
 *
 * POST /api/affiliates/me/payouts/request - Request payout of available commissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

const prisma = getPrismaClient()

/**
 * POST /api/affiliates/me/payouts/request
 *
 * Request payout for all available commissions
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

    // Get affiliate account
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      select: {
        id: true,
        referralCode: true,
        status: true,
        currentBalance: true,
        minPayoutThreshold: true,
        payoutMethod: true,
        payoutEmail: true,
      },
    })

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate account not found' },
        { status: 404 }
      )
    }

    // Check affiliate status
    if (affiliate.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Affiliate account must be active to request payouts',
          status: affiliate.status,
        },
        { status: 403 }
      )
    }

    // Check minimum balance
    if (affiliate.currentBalance < affiliate.minPayoutThreshold) {
      return NextResponse.json(
        {
          error: `Minimum payout amount is $${affiliate.minPayoutThreshold}`,
          currentBalance: affiliate.currentBalance,
          minimumRequired: affiliate.minPayoutThreshold,
        },
        { status: 400 }
      )
    }

    // Get all available commissions (not yet paid out)
    const availableCommissions = await prisma.commission.findMany({
      where: {
        affiliateId: affiliate.id,
        status: 'available', // Commissions that have passed hold period
        payoutId: null, // Not yet included in a payout
      },
      orderBy: { createdAt: 'asc' },
    })

    if (availableCommissions.length === 0) {
      return NextResponse.json(
        { error: 'No available commissions for payout' },
        { status: 400 }
      )
    }

    // Calculate amounts
    const totalAmount = availableCommissions.reduce(
      (sum, c) => sum + c.commissionAmount,
      0
    )

    // Calculate processing fee
    let processingFee = 0
    if (affiliate.payoutMethod === 'paypal') {
      processingFee = totalAmount * 0.02 // 2%
    } else if (affiliate.payoutMethod === 'stripe') {
      processingFee = totalAmount * 0.025 // 2.5%
    }

    const netAmount = totalAmount - processingFee

    // Generate invoice number
    const invoiceNumber = `INV-${affiliate.referralCode}-${Date.now()}`

    // Get period dates
    const periodStart = availableCommissions[0].createdAt
    const periodEnd = availableCommissions[availableCommissions.length - 1].createdAt

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        affiliateId: affiliate.id,
        amount: totalAmount,
        processingFee,
        netAmount,
        currency: 'USD',
        method: affiliate.payoutMethod,
        status: 'pending',
        invoiceNumber,
        periodStart,
        periodEnd,
        commissionCount: availableCommissions.length,
        paymentEmail: affiliate.payoutEmail || '',
      },
    })

    // Link commissions to this payout
    await prisma.commission.updateMany({
      where: {
        id: { in: availableCommissions.map(c => c.id) },
      },
      data: {
        payoutId: payout.id,
        status: 'paid_out',
      },
    })

    // Update affiliate balance
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        currentBalance: { decrement: totalAmount },
        lifetimePaid: { increment: netAmount },
        totalCommissionsPaid: { increment: totalAmount },
      },
    })

    console.log(`✅ Payout requested: ${affiliate.referralCode} → $${netAmount} net`)

    return NextResponse.json({
      success: true,
      data: {
        payoutId: payout.id,
        invoiceNumber,
        amount: totalAmount,
        processingFee,
        netAmount,
        commissionCount: availableCommissions.length,
        method: affiliate.payoutMethod,
        payoutEmail: affiliate.payoutEmail,
        status: 'pending',
        expectedProcessingTime: getExpectedProcessingTime(affiliate.payoutMethod),
      },
      message: 'Payout request submitted successfully!',
    })
  } catch (error: any) {
    console.error('❌ Error requesting payout:', error)

    return NextResponse.json(
      {
        error: 'Failed to request payout',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get expected processing time
 */
function getExpectedProcessingTime(method: string): string {
  switch (method) {
    case 'paypal':
      return '1-3 business days'
    case 'stripe':
      return '2-5 business days'
    case 'bank_transfer':
      return '5-7 business days'
    default:
      return '5-7 business days'
  }
}
