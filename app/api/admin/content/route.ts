export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma!.contentQueue.findMany({
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'desc' },
      ],
      take: 50,
      include: {
        posts: {
          select: {
            platform: true,
            status: true,
            impressions: true,
            engagements: true,
            clicks: true,
          },
        },
      },
    });

    // Compute stats
    const total = items.length;
    const posted = items.filter(i => i.status === 'posted').length;
    const pending = items.filter(i => ['pending', 'scheduled'].includes(i.status)).length;
    const failed = items.filter(i => i.status === 'failed').length;
    const totalImpressions = items.reduce((sum, i) =>
      sum + (i.posts?.reduce((a, p) => a + (p.impressions || 0), 0) || 0), 0);
    const totalEngagements = items.reduce((sum, i) =>
      sum + (i.posts?.reduce((a, p) => a + (p.engagements || 0), 0) || 0), 0);

    const stats = {
      total,
      published: posted,
      scheduled: items.filter(i => i.status === 'scheduled').length,
      drafts: pending,
      totalViews: totalImpressions,
      avgEngagement: total > 0 ? Math.round((totalEngagements / Math.max(total, 1)) * 100) / 100 : 0,
    };

    // Map items to include computed fields the frontend expects
    const content = items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      excerpt: item.content.slice(0, 120),
      platforms: item.platforms,
      status: item.status,
      views: item.posts?.reduce((a, p) => a + (p.impressions || 0), 0) || 0,
      engagement: item.posts?.reduce((a, p) => a + (p.engagements || 0), 0) || 0,
      posts: item.posts,
      hashtags: item.hashtags,
      imageUrl: item.imageUrl,
      link: item.link,
      scheduledAt: item.scheduledAt?.toISOString(),
      postedAt: item.postedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      error: item.error,
    }));

    return NextResponse.json({ success: true, content, stats });
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await prisma!.contentQueue.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
