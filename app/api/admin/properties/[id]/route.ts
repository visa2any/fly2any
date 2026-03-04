/**
 * Admin Property Detail + Actions API
 * GET   /api/admin/properties/[id] — Get full property detail
 * PATCH /api/admin/properties/[id] — Update property (approve/reject/feature) with RBAC + Audit + Telegram
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { hasPermission, Role, Resource, Action } from '@/lib/admin/rbac';
import { logAdminAction } from '@/lib/admin/audit-logger';

export const dynamic = 'force-dynamic';

// ─── Telegram Alert Helper ─────────────────────────────────────
async function sendTelegramAlert(message: string): Promise<void> {
  try {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });
  } catch { /* fire-and-forget */ }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // RBAC check
    if (!hasPermission(adminUser.role as Role, Resource.PROPERTIES, Action.READ)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        rooms: { orderBy: { sortOrder: 'asc' } },
        owner: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, createdAt: true },
            },
          },
        },
        _count: { select: { bookings: true, rooms: true, images: true, availability: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const qualityScore = calculateQualityScore(property);
    return NextResponse.json({ success: true, data: { ...property, qualityScore } });
  } catch (error: any) {
    console.error('Admin property detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: session.user.id },
    });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // RBAC check — require UPDATE permission on PROPERTIES
    if (!hasPermission(adminUser.role as Role, Resource.PROPERTIES, Action.UPDATE)) {
      return NextResponse.json({ error: 'Insufficient permissions to update properties' }, { status: 403 });
    }

    const body = await request.json();
    const { action, rejectionReason, featuredDays } = body;

    // Capture before state for audit
    const beforeProp = await prisma.property.findUnique({
      where: { id: params.id },
      select: { status: true, verified: true, featuredUntil: true, name: true },
    });

    const updateData: any = {};

    switch (action) {
      case 'approve':
        updateData.status = 'active';
        updateData.publishedAt = new Date();
        updateData.verified = true;
        updateData.verifiedAt = new Date();
        updateData.rejectionReason = null;
        break;

      case 'reject':
        updateData.status = 'rejected';
        updateData.rejectionReason = rejectionReason || 'Does not meet quality standards';
        updateData.publishedAt = null;
        break;

      case 'feature':
        const days = featuredDays || 30;
        updateData.featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        break;

      case 'unfeature':
        updateData.featuredUntil = null;
        break;

      case 'suspend':
        updateData.status = 'suspended';
        break;

      case 'reactivate':
        updateData.status = 'active';
        break;

      default:
        const allowedFields = ['status', 'verified', 'aiQualityScore'];
        for (const field of allowedFields) {
          if (body[field] !== undefined) updateData[field] = body[field];
        }
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Create notification for property owner on approve/reject
    if (action === 'approve' || action === 'reject') {
      try {
        await prisma.notification.create({
          data: {
            userId: property.owner.userId,
            type: action === 'approve' ? 'property_approved' : 'property_rejected',
            title: action === 'approve'
              ? '🎉 Property Approved!'
              : '❌ Property Not Approved',
            message: action === 'approve'
              ? `Your property "${property.name}" has been approved and is now live!`
              : `Your property "${property.name}" was not approved. Reason: ${updateData.rejectionReason}`,
            priority: 'high',
            actionUrl: `/host/properties`,
            metadata: { propertyId: property.id, propertyName: property.name },
          },
        });
      } catch (notifError) {
        console.error('Failed to create host notification:', notifError);
      }

      // Telegram alert for admin team audit trail
      sendTelegramAlert(
        `${action === 'approve' ? '✅' : '❌'} <b>Property ${action === 'approve' ? 'Approved' : 'Rejected'}</b>\n\n` +
        `<b>Property:</b> ${property.name}\n` +
        `<b>Host:</b> ${property.owner?.user?.name || 'N/A'}\n` +
        `<b>By Admin:</b> ${session.user.email || session.user.id}\n` +
        (action === 'reject' ? `<b>Reason:</b> ${updateData.rejectionReason}\n` : '') +
        `<b>Time:</b> ${new Date().toISOString()}`
      );
    }

    // Audit logging
    logAdminAction({
      adminUserId: session.user.id,
      adminEmail: session.user.email || undefined,
      action: action || Object.keys(updateData).join(', '),
      resource: 'properties',
      resourceId: params.id,
      details: { propertyName: property.name, hostName: property.owner?.user?.name },
      before: beforeProp || {},
      after: updateData,
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error: any) {
    console.error('Admin property update error:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// Quality score calculation (0-100)
function calculateQualityScore(property: any): number {
  let score = 0;

  // Photos (25 pts)
  const imageCount = property._count?.images || property.images?.length || 0;
  if (imageCount >= 10) score += 25;
  else if (imageCount >= 5) score += 20;
  else if (imageCount >= 3) score += 15;
  else if (imageCount >= 1) score += 5;

  // Cover image (5 pts)
  if (property.coverImageUrl || property.images?.some((i: any) => i.isPrimary)) score += 5;

  // Description (15 pts)
  const descLen = property.description?.length || 0;
  if (descLen >= 500) score += 15;
  else if (descLen >= 200) score += 10;
  else if (descLen >= 50) score += 5;

  // Short description (5 pts)
  if (property.shortDescription && property.shortDescription.length > 20) score += 5;

  // Pricing (15 pts)
  if (property.basePricePerNight && property.basePricePerNight > 0) score += 15;

  // Amenities (10 pts)
  const amenityCount = property.amenities?.length || 0;
  if (amenityCount >= 10) score += 10;
  else if (amenityCount >= 5) score += 7;
  else if (amenityCount >= 1) score += 3;

  // Location (10 pts)
  if (property.latitude && property.longitude && property.city && property.country) score += 10;

  // Rooms (10 pts)
  const roomCount = property._count?.rooms || property.rooms?.length || 0;
  if (roomCount >= 1) score += 10;

  // Policies (5 pts)
  if (property.checkInTime && property.checkOutTime) score += 3;
  if (property.cancellationPolicy && property.cancellationPolicy !== 'flexible') score += 2;

  return Math.min(100, score);
}
