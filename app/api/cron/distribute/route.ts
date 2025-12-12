import { NextResponse } from 'next/server'
import {
  postToTwitter,
  postToTelegram,
  createDealPost,
  type PostContent,
  type PostResult
} from '@/lib/growth/distribution-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST() {
  try {
    // Sample content to distribute
    const content: PostContent = createDealPost({
      origin: 'NYC',
      destination: 'Paris',
      price: 399,
      savings: 200,
      url: 'https://fly2any.com'
    })

    const results: PostResult[] = []

    // Post to Twitter
    const twitterResult = await postToTwitter(content)
    results.push(twitterResult)

    // Post to Telegram
    const telegramResult = await postToTelegram(content)
    results.push(telegramResult)

    return NextResponse.json({
      success: true,
      distributed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
  } catch (error) {
    console.error('Distribution cron error:', error)
    return NextResponse.json({ success: false, error: 'Distribution failed' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
