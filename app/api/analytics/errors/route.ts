import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler'

const prisma = getPrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
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

// Get error metrics for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Require admin access
    if (!session?.user?.email?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '24h'
    
    // Calculate time range
    let hours = 24
    switch (range) {
      case '1h': hours = 1; break
      case '24h': hours = 24; break
      case '7d': hours = 24 * 7; break
      case '30d': hours = 24 * 30; break
    }
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    // Fetch errors in time range
    const errors = await prisma.errorLog.findMany({
      where: {
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    })

    // Calculate total errors
    const totalErrors = errors.length

    // Calculate error rate (errors per hour)
    const errorRate = hours > 0 ? totalErrors / hours : 0

    // Group errors by category
    const categoryCounts = errors.reduce((acc, error) => {
      // Map errorType to ErrorCategory
      let category = ErrorCategory.UNKNOWN
      const errorType = error.errorType?.toLowerCase() || ''
      
      if (errorType.includes('validation')) category = ErrorCategory.VALIDATION
      else if (errorType.includes('payment')) category = ErrorCategory.PAYMENT
      else if (errorType.includes('booking')) category = ErrorCategory.BOOKING
      else if (errorType.includes('database') || errorType.includes('prisma')) category = ErrorCategory.DATABASE
      else if (errorType.includes('api') || errorType.includes('fetch')) category = ErrorCategory.EXTERNAL_API
      else if (errorType.includes('auth')) category = ErrorCategory.AUTHENTICATION
      else if (errorType.includes('network')) category = ErrorCategory.NETWORK
      
      acc[category] = (acc[category] || 0) + error.count
      return acc
    }, {} as Record<string, number>)

    // Get top categories
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Group errors by endpoint/URL
    const endpointCounts = errors.reduce((acc, error) => {
      const endpoint = error.url || 'Unknown'
      acc[endpoint] = (acc[endpoint] || 0) + error.count
      return acc
    }, {} as Record<string, number>)

    // Get top endpoints
    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({
        endpoint,
        count,
        errorRate: count / (hours || 1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Prepare recent errors (last 50)
    const recentErrors = errors.slice(0, 50).map(error => ({
      id: error.id,
      timestamp: error.timestamp.toISOString(),
      category: (() => {
        const errorType = error.errorType?.toLowerCase() || ''
        if (errorType.includes('validation')) return ErrorCategory.VALIDATION
        else if (errorType.includes('payment')) return ErrorCategory.PAYMENT
        else if (errorType.includes('booking')) return ErrorCategory.BOOKING
        else if (errorType.includes('database') || errorType.includes('prisma')) return ErrorCategory.DATABASE
        else if (errorType.includes('api') || errorType.includes('fetch')) return ErrorCategory.EXTERNAL_API
        else if (errorType.includes('auth')) return ErrorCategory.AUTHENTICATION
        else if (errorType.includes('network')) return ErrorCategory.NETWORK
        return ErrorCategory.UNKNOWN
      })(),
      severity: (() => {
        const sev = error.severity?.toLowerCase()
        if (sev === 'critical') return ErrorSeverity.CRITICAL
        if (sev === 'high') return ErrorSeverity.HIGH
        if (sev === 'normal') return ErrorSeverity.NORMAL
        if (sev === 'low') return ErrorSeverity.LOW
        return ErrorSeverity.NORMAL
      })(),
      message: error.message,
      endpoint: error.url || 'Unknown',
      userAgent: error.userAgent,
      userId: error.userId
    }))

    // Calculate hourly trend (last 24 hours if range is 24h, otherwise daily/weekly)
    const hourlyTrend = []
    const now = new Date()
    
    if (range === '1h' || range === '24h') {
      // Hourly trend for 1h or 24h
      const hoursToShow = range === '1h' ? 1 : 24
      for (let i = hoursToShow - 1; i >= 0; i--) {
        const hourStart = new Date(now)
        hourStart.setHours(now.getHours() - i - 1)
        hourStart.setMinutes(0, 0, 0)
        
        const hourEnd = new Date(hourStart)
        hourEnd.setHours(hourStart.getHours() + 1)
        
        const hourErrors = errors.filter(e => 
          e.timestamp >= hourStart && e.timestamp < hourEnd
        )
        
        hourlyTrend.push({
          hour: hourStart.toLocaleTimeString([], { hour: '2-digit' }),
          errors: hourErrors.reduce((sum, e) => sum + e.count, 0),
          responseTime: 0 // Mock response time - would need actual data
        })
      }
    } else {
      // Daily trend for 7d or 30d
      const daysToShow = range === '7d' ? 7 : 30
      for (let i = daysToShow - 1; i >= 0; i--) {
        const dayStart = new Date(now)
        dayStart.setDate(now.getDate() - i - 1)
        dayStart.setHours(0, 0, 0, 0)
        
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayStart.getDate() + 1)
        
        const dayErrors = errors.filter(e => 
          e.timestamp >= dayStart && e.timestamp < dayEnd
        )
        
        hourlyTrend.push({
          hour: dayStart.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          errors: dayErrors.reduce((sum, e) => sum + e.count, 0),
          responseTime: 0
        })
      }
    }

    // Mock system health (in a real app, this would come from health checks)
    const systemHealth = {
      api: 'healthy' as const,
      database: 'healthy' as const,
      externalApis: 'healthy' as const,
      queue: 0
    }

    // Mock average response time (would need actual metrics)
    const avgResponseTime = 145 // ms

    // Return formatted metrics
    return NextResponse.json({
      totalErrors,
      errorRate,
      avgResponseTime,
      topCategories,
      topEndpoints,
      recentErrors,
      hourlyTrend,
      systemHealth
    })
  } catch (error) {
    console.error('Error fetching error metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch error metrics' },
      { status: 500 }
    )
  }
}
