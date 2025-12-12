import { NextRequest, NextResponse } from 'next/server'
import {
  generateDealPost,
  generateDestinationGuide,
  generateSocialPosts,
  generateBlogOutline,
  type ContentPiece
} from '@/lib/growth/content-factory'

export async function POST(request: NextRequest) {
  try {
    const { type = 'auto' } = await request.json()

    let content: ContentPiece | { title: string; outline: string[]; keywords: string[] } | null = null

    switch (type) {
      case 'deal':
        content = await generateDealPost({
          origin: 'JFK',
          destination: 'LHR',
          price: 299,
          previousPrice: 599,
          airline: 'British Airways'
        })
        break
      case 'guide':
        content = await generateDestinationGuide('Bali')
        break
      case 'blog':
        content = await generateBlogOutline('Best Travel Hacks for 2025')
        break
      case 'twitter':
      case 'instagram':
        const posts = await generateSocialPosts(1)
        content = posts[0] || null
        break
      default:
        content = await generateDealPost({
          origin: 'LAX',
          destination: 'CDG',
          price: 449,
          previousPrice: 899,
          airline: 'Air France'
        })
    }

    return NextResponse.json({
      success: true,
      content: {
        id: crypto.randomUUID(),
        type,
        ...content,
        status: 'draft',
        views: 0,
        engagement: 0,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 })
  }
}
