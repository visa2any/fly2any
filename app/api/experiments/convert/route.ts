import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { flagKey, variantId, sessionId, userId, value } = body

    if (!flagKey || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the flag
    const flag = await prisma.featureFlag.findUnique({
      where: { key: flagKey }
    })

    if (!flag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    const effectiveUserId = session?.user?.id || userId || null

    // Find participation record
    const participation = await prisma.experimentParticipation.findFirst({
      where: {
        flagId: flag.id,
        ...(effectiveUserId ? { userId: effectiveUserId } : { sessionId })
      }
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'No participation record found' },
        { status: 404 }
      )
    }

    // Update participation with conversion
    await prisma.experimentParticipation.update({
      where: { id: participation.id },
      data: {
        converted: true,
        convertedAt: new Date(),
        conversionValue: value
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking conversion:', error)
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    )
  }
}
