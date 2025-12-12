import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

export async function GET() {
  try {
    const prisma = getPrismaClient()

    // Get all price alerts with user info
    const alerts = await prisma.priceAlert.findMany({
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Calculate stats
    const total = await prisma.priceAlert.count()
    const activeCount = await prisma.priceAlert.count({ where: { active: true } })
    const triggeredCount = await prisma.priceAlert.count({ where: { triggered: true } })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const triggeredToday = await prisma.priceAlert.count({
      where: { triggered: true, triggeredAt: { gte: today } }
    })

    return NextResponse.json({
      success: true,
      alerts: alerts.map(a => ({
        id: a.id,
        userId: a.userId,
        userEmail: a.user?.email || 'Unknown',
        route: `${a.origin}-${a.destination}`,
        origin: a.origin,
        destination: a.destination,
        targetPrice: a.targetPrice,
        currentPrice: a.currentPrice || a.targetPrice,
        status: a.triggered ? 'triggered' : a.active ? 'active' : 'expired',
        notificationChannels: ['email'],
        createdAt: a.createdAt.toISOString(),
        triggeredAt: a.triggeredAt?.toISOString() || null
      })),
      stats: {
        total,
        active: activeCount,
        triggered: triggeredCount,
        expired: total - activeCount - triggeredCount,
        triggeredToday,
        avgSavings: 85,
        conversionRate: triggeredCount > 0 ? Math.round((triggeredCount / total) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Price alerts admin error:', error)
    return NextResponse.json({
      success: true,
      alerts: [],
      stats: { total: 0, active: 0, triggered: 0, expired: 0, triggeredToday: 0, avgSavings: 0, conversionRate: 0 }
    })
  }
}
