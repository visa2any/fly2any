import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * Admin API - Verify (Approve/Reject) Card Authorization
 * POST /api/admin/authorizations/[id]/verify
 */

export const dynamic = 'force-dynamic';

interface VerifyRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: VerifyRequest = await request.json();

    // Get current user (admin)
    const session = await auth();
    const adminUserId = session?.user?.id || 'system';

    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'INVALID_ACTION', message: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (body.action === 'reject' && !body.reason?.trim()) {
      return NextResponse.json(
        { error: 'REASON_REQUIRED', message: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Get the authorization
    const authorization = await prisma.cardAuthorization.findUnique({
      where: { id },
    });

    if (!authorization) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Authorization not found' },
        { status: 404 }
      );
    }

    if (authorization.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'ALREADY_PROCESSED', message: 'Authorization has already been processed' },
        { status: 400 }
      );
    }

    // Update authorization
    const updatedAuth = await prisma.cardAuthorization.update({
      where: { id },
      data: {
        status: body.action === 'approve' ? 'VERIFIED' : 'REJECTED',
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
        rejectionReason: body.action === 'reject' ? body.reason : null,
      },
    });

    console.log(`✅ [Card Auth] Authorization ${id} ${body.action}d by ${adminUserId}`);

    // Send notification to customer
    try {
      const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');

      if (body.action === 'approve') {
        // Notify via Telegram that authorization is approved
        const message = `
✅ *Authorization Approved*

📋 *Booking:* ${authorization.bookingReference}
💳 *Card:* ${authorization.cardBrand.toUpperCase()} ****${authorization.cardLast4}
💰 *Amount:* ${authorization.currency} ${authorization.amount.toLocaleString()}

Ready for manual processing.
        `.trim();

        await notifyTelegramAdmins(message);

        // TODO: Send email to customer confirming authorization
      } else {
        // Notify via Telegram that authorization is rejected
        const message = `
❌ *Authorization Rejected*

📋 *Booking:* ${authorization.bookingReference}
💳 *Card:* ${authorization.cardBrand.toUpperCase()} ****${authorization.cardLast4}
💰 *Amount:* ${authorization.currency} ${authorization.amount.toLocaleString()}

❗ *Reason:* ${body.reason}

Customer needs to resubmit.
        `.trim();

        await notifyTelegramAdmins(message);

        // TODO: Send email to customer about rejection
      }
    } catch (notifyError) {
      console.error('⚠️ Failed to send verification notification:', notifyError);
    }

    return NextResponse.json({
      success: true,
      authorization: {
        id: updatedAuth.id,
        bookingReference: updatedAuth.bookingReference,
        status: updatedAuth.status,
        verifiedAt: updatedAuth.verifiedAt,
      },
      message: `Authorization ${body.action}d successfully`,
    });
  } catch (error: any) {
    console.error('❌ [Admin Auth] Error verifying authorization:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to process authorization' },
      { status: 500 }
    );
  }
}
