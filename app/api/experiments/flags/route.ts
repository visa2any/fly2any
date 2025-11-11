import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const flags = await prisma.featureFlag.findMany({
      where: {
        enabled: true
      },
      select: {
        id: true,
        key: true,
        name: true,
        enabled: true,
        rolloutPercentage: true,
        variants: true,
        isExperiment: true
      }
    })

    return NextResponse.json({ flags })
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

// Admin endpoint to create/update feature flags
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      key,
      name,
      description,
      enabled,
      rolloutPercentage,
      variants,
      isExperiment,
      successMetric,
      minimumSampleSize
    } = body

    if (!key || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key,
        name,
        description,
        enabled: enabled ?? false,
        rolloutPercentage: rolloutPercentage ?? 0,
        variants: variants || [],
        isExperiment: isExperiment ?? false,
        experimentStatus: isExperiment ? 'draft' : null,
        successMetric,
        minimumSampleSize,
        startedAt: enabled && isExperiment ? new Date() : null
      }
    })

    return NextResponse.json({ flag })
  } catch (error) {
    console.error('Error creating feature flag:', error)
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    )
  }
}
