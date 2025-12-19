/**
 * Content Queue Admin API - Fly2Any Marketing OS
 * Manage social content queue
 *
 * @route GET /api/admin/content-queue - Get queue items
 * @route POST /api/admin/content-queue - Add new item
 * @route DELETE /api/admin/content-queue - Cancel item
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { contentQueueManager } from '@/lib/social/content-queue-manager';
import { schedulerAgent } from '@/lib/social/scheduler-agent';
import { handleApiError, ErrorCategory } from '@/lib/monitoring/global-error-handler';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }
    if (platform) {
      where.platforms = { has: platform };
    }

    // Get queue items
    const items = await prisma.contentQueue.findMany({
      where,
      orderBy: [{ scheduledAt: 'asc' }],
      take: limit,
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

    // Get stats
    const stats = await contentQueueManager.getStats();

    // Get scheduling summary
    const scheduling = await schedulerAgent.getSchedulingSummary();

    return NextResponse.json({
      success: true,
      items,
      stats,
      scheduling,
    });

  }, { category: ErrorCategory.DATABASE });
}

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      content,
      platforms,
      imageUrl,
      imagePrompt,
      link,
      hashtags,
      productType,
      productData,
      scheduledAt,
      priority,
    } = body;

    if (!type || !title || !content || !platforms?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, content, platforms' },
        { status: 400 }
      );
    }

    const id = await contentQueueManager.enqueue({
      type,
      title,
      content,
      platforms,
      imageUrl,
      imagePrompt,
      link,
      hashtags,
      productType,
      productData,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      priority,
      createdBy: session.user.email || 'admin',
    });

    const item = await prisma.contentQueue.findUnique({ where: { id } });

    return NextResponse.json({
      success: true,
      id,
      item,
    });

  }, { category: ErrorCategory.DATABASE });
}

export async function DELETE(request: NextRequest) {
  return handleApiError(request, async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const success = await contentQueueManager.cancel(id);

    return NextResponse.json({ success });

  }, { category: ErrorCategory.DATABASE });
}
