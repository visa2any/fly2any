import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const prisma = getPrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const {
      sessionId,
      metricName,
      value,
      rating,
      url,
      deviceType,
      browser,
      browserVersion,
      os,
      connectionType
    } = body

    if (!sessionId || !metricName || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await prisma.performanceMetric.create({
      data: {
        userId: session?.user?.id || null,
        sessionId,
        metricName,
        value,
        rating,
        url,
        deviceType,
        browser,
        browserVersion,
        os,
        connectionType
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking performance metric:', error)
    return NextResponse.json(
      { error: 'Failed to track performance metric' },
      { status: 500 }
    )
  }
}

// Get performance metrics for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Require admin access
    if (!session?.user?.email?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const metricName = searchParams.get('metricName')
    const hours = parseInt(searchParams.get('hours') || '24', 10)

    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        ...(metricName ? { metricName } : {}),
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' },
      take: 1000
    })

    // Calculate averages by metric
    const metricAverages: Record<string, { avg: number, p50: number, p75: number, p95: number, count: number }> = {}

    for (const metric of metrics) {
      if (!metricAverages[metric.metricName]) {
        const values = metrics
          .filter(m => m.metricName === metric.metricName)
          .map(m => m.value)
          .sort((a, b) => a - b)

        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const p50 = values[Math.floor(values.length * 0.5)]
        const p75 = values[Math.floor(values.length * 0.75)]
        const p95 = values[Math.floor(values.length * 0.95)]

        metricAverages[metric.metricName] = { avg, p50, p75, p95, count: values.length }
      }
    }

    return NextResponse.json({
      metrics,
      averages: metricAverages,
      timeRange: { since: since.toISOString(), until: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
