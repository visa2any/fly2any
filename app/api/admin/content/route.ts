import { NextResponse } from 'next/server'

// Content storage (in production, use database)
const contentStore: any[] = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      content: contentStore.slice(0, 50),
      stats: {
        total: contentStore.length,
        published: contentStore.filter(c => c.status === 'published').length,
        scheduled: contentStore.filter(c => c.status === 'scheduled').length,
        drafts: contentStore.filter(c => c.status === 'draft').length,
        totalViews: contentStore.reduce((sum, c) => sum + (c.views || 0), 0),
        avgEngagement: contentStore.length > 0
          ? Math.round(contentStore.reduce((sum, c) => sum + (c.engagement || 0), 0) / contentStore.length)
          : 0
      }
    })
  } catch (error) {
    console.error('Content admin error:', error)
    return NextResponse.json({ success: false, content: [], stats: {} })
  }
}
