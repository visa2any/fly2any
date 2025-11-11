import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { flagId, flagKey, variantId, sessionId, userId } = body

    if (!flagId || !variantId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use authenticated user ID if available, otherwise use provided userId
    const effectiveUserId = session?.user?.id || userId || null

    // Check if already participated
    const existing = await prisma.experimentParticipation.findFirst({
      where: {
        flagId,
        ...(effectiveUserId ? { userId: effectiveUserId } : { sessionId })
      }
    })

    if (existing) {
      return NextResponse.json({ success: true, existing: true })
    }

    // Create participation record
    await prisma.experimentParticipation.create({
      data: {
        flagId,
        userId: effectiveUserId,
        sessionId,
        variant: variantId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking participation:', error)
    return NextResponse.json(
      { error: 'Failed to track participation' },
      { status: 500 }
    )
  }
}
