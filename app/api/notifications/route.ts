/**
 * Notification API Routes
 * GET /api/notifications - List notifications
 * POST /api/notifications - Create notification
 * PATCH /api/notifications - Bulk update notifications
 * DELETE /api/notifications - Delete notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  getNotifications,
  createNotification,
  markAllAsRead,
  deleteAllRead,
  deleteAllNotifications,
  getUnreadCount,
} from '@/lib/services/notifications';
import {
  NotificationFilters,
  NotificationListParams,
  CreateNotificationData,
} from '@/lib/types/notifications';

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all';
    const read = searchParams.get('read');
    const priority = searchParams.get('priority') || 'all';
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'priority' | 'read';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build filters
    const filters: NotificationFilters = {
      type: type as any,
    };

    if (read !== null && read !== 'all') {
      filters.read = read === 'true';
    }

    if (priority !== 'all') {
      filters.priority = priority as any;
    }

    // Build params
    const params: NotificationListParams = {
      page,
      limit,
      filters,
      sortBy,
      sortOrder,
    };

    // Get notifications
    const result = await getNotifications(session.user.id, params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    const notificationData: CreateNotificationData = {
      userId: session.user.id,
      type: body.type,
      title: body.title,
      message: body.message,
      priority: body.priority,
      actionUrl: body.actionUrl,
      metadata: body.metadata,
    };

    const notification = await createNotification(notificationData);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Bulk update notifications (mark all as read)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'mark-all-read') {
      const count = await markAllAsRead(session.user.id);
      return NextResponse.json({ success: true, count });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications (all or read-only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'read'; // 'read' or 'all'

    let count = 0;

    if (scope === 'all') {
      count = await deleteAllNotifications(session.user.id);
    } else {
      count = await deleteAllRead(session.user.id);
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
