// app/api/seo/indexnow-submit/route.ts
// IndexNow batch submission — call after new content is published
// Secured with API secret header
import { NextRequest, NextResponse } from 'next/server'
import { submitUrls } from '@/lib/seo/indexnow'
import { seoEngine } from '@/lib/seo/programmatic-seo'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'

export async function POST(req: NextRequest) {
  // Secure this endpoint
  const secret = req.headers.get('x-api-secret')
  if (secret !== process.env.SEO_API_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const mode = body.mode || 'core' // 'core' | 'routes' | 'all'

    const urls: string[] = []

    // Core pages — always submit
    const corePages = [
      '/', '/flights', '/hotels', '/cars', '/tours', '/activities',
      '/transfers', '/deals', '/destinations', '/travel-guide', '/blog',
      '/faq', '/travel-insurance', '/world-cup-2026',
    ]
    urls.push(...corePages.map(p => `${SITE_URL}${p}`))

    // Programmatic pages
    if (mode === 'routes' || mode === 'all') {
      const entries = seoEngine.generateSitemapEntries()
      const routeUrls = entries
        .filter(e => e.priority >= 0.8)
        .map(e => `${SITE_URL}${e.url}`)
        .slice(0, 9000) // IndexNow max 10,000 per batch
      urls.push(...routeUrls)
    }

    // Remove duplicates
    const unique = [...new Set(urls)].slice(0, 10000)

    // Submit in batches of 500
    const batchSize = 500
    const batches: string[][] = []
    for (let i = 0; i < unique.length; i += batchSize) {
      batches.push(unique.slice(i, i + batchSize))
    }

    let totalSubmitted = 0
    let totalFailed = 0

    for (const batch of batches) {
      const result = await submitUrls(batch)
      totalSubmitted += result.submitted
      totalFailed += result.failed
    }

    console.log(`[IndexNow] Submitted ${totalSubmitted} URLs, ${totalFailed} failed`)

    return NextResponse.json({
      success: true,
      submitted: totalSubmitted,
      failed: totalFailed,
      batches: batches.length,
      mode,
    })
  } catch (err: any) {
    console.error('[IndexNow] Submission error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET: status check
export async function GET() {
  const count = seoEngine.generateSitemapEntries().length
  return NextResponse.json({
    status: 'ready',
    totalProgrammaticPages: count,
    endpoints: ['api.indexnow.org', 'bing.com/indexnow', 'yandex.com/indexnow'],
  })
}
