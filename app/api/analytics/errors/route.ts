import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      sessionId,
      message,
      stack,
      errorType,
      url,
      severity,
      fingerprint,
      metadata
    } = body

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userAgent = request.headers.get('user-agent') || undefined

    // Check if error with same fingerprint exists recently (last hour)
    if (fingerprint) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const existingError = await prisma.errorLog.findFirst({
        where: {
          fingerprint,
          timestamp: { gte: hourAgo }
        }
      })

      if (existingError) {
        // Increment count instead of creating new error
        await prisma.errorLog.update({
          where: { id: existingError.id },
          data: { count: { increment: 1 } }
        })

        return NextResponse.json({ success: true, grouped: true })
      }
    }

    // Parse browser and OS from user agent
    const browser = userAgent?.includes('Chrome') ? 'Chrome' :
                    userAgent?.includes('Firefox') ? 'Firefox' :
                    userAgent?.includes('Safari') ? 'Safari' :
                    userAgent?.includes('Edge') ? 'Edge' : 'Unknown'

    const os = userAgent?.includes('Windows') ? 'Windows' :
               userAgent?.includes('Mac') ? 'macOS' :
               userAgent?.includes('Linux') ? 'Linux' :
               userAgent?.includes('Android') ? 'Android' :
               userAgent?.includes('iOS') ? 'iOS' : 'Unknown'

    // Create new error log
    await prisma.errorLog.create({
      data: {
        userId: session?.user?.id || null,
        sessionId,
        message,
        stack,
        errorType,
        url,
        severity: severity || 'error',
        fingerprint,
        userAgent,
        browser,
        os,
        count: 1
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

// Get errors for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Require admin access
    if (!session?.user?.email?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved') === 'true'
    const hours = parseInt(searchParams.get('hours') || '24', 10)

    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const errors = await prisma.errorLog.findMany({
      where: {
        ...(severity ? { severity } : {}),
        resolved,
        timestamp: { gte: since }
      },
      orderBy: [
        { count: 'desc' },
        { timestamp: 'desc' }
      ],
      take: 100
    })

    // Group by fingerprint
    const grouped = errors.reduce((acc, error) => {
      const key = error.fingerprint || error.id
      if (!acc[key]) {
        acc[key] = { ...error, occurrences: error.count }
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      errors: Object.values(grouped),
      total: errors.length,
      timeRange: { since: since.toISOString(), until: new Date().toISOString() }
    })
  } catch (error) {
    console.error('Error fetching error logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    )
  }
}
