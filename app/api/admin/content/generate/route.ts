export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateDealPost,
  generateDestinationGuide,
  generateSocialPosts,
  generateBlogOutline,
  type ContentPiece,
  type DealData
} from '@/lib/growth/content-factory'

export async function POST(request: NextRequest) {
  try {
    const { type = 'auto', dealData, destination, topic, platforms = ['twitter', 'telegram'], scheduledAt } = await request.json()

    let contentPiece: ContentPiece | { title: string; outline: string[]; keywords: string[] } | null = null

    switch (type) {
      case 'deal':
        const deal: DealData = dealData || {
          origin: 'JFK',
          destination: 'LHR',
          price: 299,
          previousPrice: 599,
          airline: 'British Airways'
        }
        contentPiece = await generateDealPost(deal)
        break
      case 'guide':
        contentPiece = await generateDestinationGuide(destination || 'Bali')
        break
      case 'blog':
        contentPiece = await generateBlogOutline(topic || 'Best Travel Hacks for 2025')
        break
      case 'twitter':
      case 'instagram':
        const posts = await generateSocialPosts(1)
        contentPiece = posts[0] || null
        break
      default:
        contentPiece = await generateDealPost({
          origin: 'LAX',
          destination: 'CDG',
          price: 449,
          previousPrice: 899,
          airline: 'Air France'
        })
    }

    if (!contentPiece) {
      throw new Error('Failed to generate content')
    }

    // Save to ContentQueue
    const content = await prisma!.contentQueue.create({
      data: {
        type: 'type' in contentPiece ? contentPiece.type : type,
        title: contentPiece.title,
        content: contentPiece.content || JSON.stringify(contentPiece),
        platforms: platforms,
        hashtags: 'metadata' in contentPiece ? contentPiece.metadata.keywords : [],
        link: 'https://fly2any.com',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 3600000), // Default 1 hour from now
        status: 'pending',
        priority: type === 'deal' ? 1 : 0
      }
    })

    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        type: content.type,
        title: content.title,
        content: content.content,
        platforms: content.platforms,
        scheduledAt: content.scheduledAt,
        status: content.status,
        createdAt: content.createdAt
      }
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed'
    }, { status: 500 })
  }
}
