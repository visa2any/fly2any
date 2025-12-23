import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient()

/**
 * GET /api/admin/payouts
 *
 * Get all payout requests with filters
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma!.adminUser.findUnique({
      where: { userId: session.user.id },
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all payouts with affiliate details
    const payouts = await prisma!.payout.findMany({
      include: {
        affiliate: {
          select: {
            id: true,
            referralCode: true,
            businessName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get summary stats
    const stats = await prisma!.payout.groupBy({
      by: ['status'],
      _sum: {
        netAmount: true,
      },
      _count: {
        id: true,
      },
    })

    const summary = {
      pending: {
        count: 0,
        amount: 0,
      },
      approved: {
        count: 0,
        amount: 0,
      },
      paid: {
        count: 0,
        amount: 0,
      },
      rejected: {
        count: 0,
        amount: 0,
      },
    }

    stats.forEach((stat) => {
      const status = stat.status as keyof typeof summary
      if (status in summary) {
        summary[status] = {
          count: stat._count.id,
          amount: stat._sum.netAmount || 0,
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        payouts,
        summary,
      },
    })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}
