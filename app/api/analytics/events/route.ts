import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const prisma = getPrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()

    const { sessionId, events } = body

    if (!sessionId || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Get client metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const referer = request.headers.get('referer') || undefined

    // Batch insert events
    const analyticsEvents = events.map((event: any) => ({
      userId: session?.user?.id || null,
      sessionId,
      eventType: event.eventType,
      eventData: event.eventData || {},
      url: event.eventData?.url || referer,
      referrer: event.eventData?.referrer || referer,
      userAgent,
      ipAddress,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
    }))

    await prisma.analyticsEvent.createMany({
      data: analyticsEvents
    })

    // Track funnel events separately
    const funnelEvents = events.filter((e: any) => e.eventType === 'funnel')
    if (funnelEvents.length > 0) {
      await prisma.conversionFunnel.createMany({
        data: funnelEvents.map((event: any) => ({
          userId: session?.user?.id || null,
          sessionId,
          stage: event.eventData.stage,
          action: event.eventData.action,
          metadata: event.eventData.metadata || {},
          duration: event.eventData.duration || null,
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
        }))
      })
    }

    return NextResponse.json({ success: true, eventsReceived: events.length })
  } catch (error) {
    console.error('Error tracking analytics events:', error)
    return NextResponse.json(
      { error: 'Failed to track events' },
      { status: 500 }
    )
  }
}
