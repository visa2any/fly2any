import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  postToTwitter,
  postToTelegram,
  postToInstagram,
  postToFacebook,
  postToLinkedIn,
  postToReddit,
  formatForPlatform,
  type PostContent,
  type PostResult
} from '@/lib/growth/distribution-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function distributeContent(contentItem: any): Promise<PostResult[]> {
  const content: PostContent = {
    text: contentItem.content,
    link: contentItem.link || undefined,
    hashtags: contentItem.hashtags || []
  }

  const results: PostResult[] = []
  const platforms = contentItem.platforms || []

  // Distribute to each platform
  for (const platform of platforms) {
    let result: PostResult

    try {
      switch (platform.toLowerCase()) {
        case 'twitter':
          result = await postToTwitter(content)
          break
        case 'telegram':
          result = await postToTelegram(content)
          break
        case 'instagram':
          result = await postToInstagram(content)
          break
        case 'facebook':
          result = await postToFacebook(content)
          break
        case 'linkedin':
          result = await postToLinkedIn(content)
          break
        case 'reddit':
          result = await postToReddit(content)
          break
        default:
          result = {
            platform,
            success: false,
            error: `Platform ${platform} not yet implemented`
          }
      }

      // Log result to SocialPostLog
      await prisma!.socialPostLog.create({
        data: {
          contentQueueId: contentItem.id,
          platform,
          platformPostId: result.postId,
          platformUrl: result.url,
          status: result.success ? 'posted' : 'failed',
          content: formatForPlatform(content, platform as any),
          link: content.link,
          error: result.error,
          postedAt: result.success ? new Date() : null
        }
      })

      results.push(result)
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error)
      results.push({
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

export async function POST() {
  try {
    // Get pending content scheduled for now or earlier
    const pendingContent = await prisma!.contentQueue.findMany({
      where: {
        status: 'pending',
        scheduledAt: {
          lte: new Date()
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' }
      ],
      take: 10 // Process up to 10 items at a time
    })

    if (pendingContent.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No content to distribute',
        processed: 0
      })
    }

    const allResults: any[] = []

    // Process each content item
    for (const item of pendingContent) {
      try {
        // Mark as processing
        await prisma!.contentQueue.update({
          where: { id: item.id },
          data: { status: 'processing' }
        })

        // Distribute
        const results = await distributeContent(item)
        const successCount = results.filter(r => r.success).length
        const failedCount = results.filter(r => !r.success).length

        // Update status
        if (successCount > 0) {
          await prisma!.contentQueue.update({
            where: { id: item.id },
            data: {
              status: failedCount === 0 ? 'posted' : 'partial',
              postedAt: new Date(),
              results: results
            }
          })
        } else {
          // All failed - retry or mark as failed
          const newRetryCount = item.retryCount + 1
          await prisma!.contentQueue.update({
            where: { id: item.id },
            data: {
              status: newRetryCount >= item.maxRetries ? 'failed' : 'pending',
              retryCount: newRetryCount,
              error: results.map(r => r.error).filter(Boolean).join('; ')
            }
          })
        }

        allResults.push({
          id: item.id,
          title: item.title,
          results
        })
      } catch (error) {
        console.error(`Error processing content ${item.id}:`, error)

        // Mark as failed
        await prisma!.contentQueue.update({
          where: { id: item.id },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Processing failed'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingContent.length,
      results: allResults
    })
  } catch (error) {
    console.error('Distribution cron error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Distribution failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
