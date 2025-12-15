import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET - Get all newsletter subscribers with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);

    const source = searchParams.get('source');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build filter
    const where: any = {};
    if (source) where.source = { contains: source };
    if (status) where.status = status;

    // Get subscribers
    const [subscribers, total, bySource] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.groupBy({
        by: ['source'],
        _count: true,
      }),
    ]);

    // Get stats
    const stats = {
      total,
      active: await prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
      unsubscribed: await prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
      exitIntent: await prisma.newsletterSubscriber.count({ where: { source: { contains: 'exit_intent' } } }),
      mobileScroll: await prisma.newsletterSubscriber.count({ where: { source: { contains: 'mobile_scroll' } } }),
      footer: await prisma.newsletterSubscriber.count({ where: { source: { contains: 'footer' } } }),
      website: await prisma.newsletterSubscriber.count({ where: { source: 'website' } }),
    };

    return NextResponse.json({
      subscribers,
      total,
      stats,
      bySource: bySource.map(s => ({ source: s.source, count: s._count })),
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[ADMIN_SUBSCRIBERS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subscriber
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 });
    }

    await prisma.newsletterSubscriber.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_SUBSCRIBERS] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
