import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

const prisma = getPrismaClient()

/**
 * PATCH /api/admin/payouts/[id]
 *
 * Approve, reject, or mark payout as paid
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, notes } = body // action: 'approve', 'reject', 'mark_paid'

    // Get payout
    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: {
        affiliate: {
          select: {
            id: true,
            referralCode: true,
            currentBalance: true,
          },
        },
      },
    })

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    let updatedPayout

    if (action === 'approve') {
      // Approve payout
      updatedPayout = await prisma.payout.update({
        where: { id: params.id },
        data: {
          status: 'processing',
          processedBy: session.user.id,
          processedAt: new Date(),
          adminNotes: notes,
        },
      })

      console.log(`✅ Payout approved: ${payout.invoiceNumber}`)
    } else if (action === 'reject') {
      // Reject payout and return commission to available balance
      updatedPayout = await prisma.payout.update({
        where: { id: params.id },
        data: {
          status: 'canceled',
          processedBy: session.user.id,
          processedAt: new Date(),
          failedAt: new Date(),
          failureReason: notes || 'Payout rejected by admin',
          adminNotes: notes || 'Payout rejected by admin',
        },
      })

      // Return commissions to available status
      await prisma.commission.updateMany({
        where: { payoutId: params.id },
        data: {
          status: 'available',
          payoutId: null,
        },
      })

      // Return funds to affiliate balance
      await prisma.affiliate.update({
        where: { id: payout.affiliateId },
        data: {
          currentBalance: { increment: payout.amount },
        },
      })

      console.log(`❌ Payout rejected: ${payout.invoiceNumber}`)
    } else if (action === 'mark_paid') {
      // Mark as paid
      updatedPayout = await prisma.payout.update({
        where: { id: params.id },
        data: {
          status: 'completed',
          processedBy: session.user.id,
          processedAt: new Date(),
          completedAt: new Date(),
          adminNotes: notes,
        },
      })

      console.log(`💰 Payout marked paid: ${payout.invoiceNumber}`)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: updatedPayout,
      message: `Payout ${action}d successfully`,
    })
  } catch (error) {
    console.error('Error updating payout:', error)
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    )
  }
}
