export const dynamic = 'force-dynamic';

/**
 * Individual Campaign API
 *
 * Get, update, or delete a specific campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

interface EmailCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  subject: string;
  preheader?: string | null;
  body: string;
  plainText?: string | null;
  templateId?: string | null;
  targetAudience: string;
  customFilter?: any;
  excludeList: string[];
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  createdBy?: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignSend {
  id: string;
  email: string;
  status: string;
  sentAt?: Date | null;
  openedAt?: Date | null;
  clickedAt?: Date | null;
}

// GET - Get a specific campaign with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const prisma = getPrismaClient();

    // Fetch campaign
    const [campaign] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get send details if campaign has been sent
    let sends: CampaignSend[] = [];
    if (campaign.status === 'sent' || campaign.status === 'sending') {
      sends = await prisma.$queryRaw<CampaignSend[]>`
        SELECT "id", "email", "status", "sentAt", "openedAt", "clickedAt"
        FROM "email_campaign_sends"
        WHERE "campaignId" = ${id}
        ORDER BY "sentAt" DESC
        LIMIT 100
      `;
    }

    // Calculate rates
    const stats = {
      totalRecipients: campaign.totalRecipients,
      sent: campaign.sent,
      delivered: campaign.delivered,
      opened: campaign.opened,
      clicked: campaign.clicked,
      bounced: campaign.bounced,
      unsubscribed: campaign.unsubscribed,
      complained: campaign.complained,
      deliveryRate: campaign.sent > 0
        ? ((campaign.delivered / campaign.sent) * 100).toFixed(1)
        : '0.0',
      openRate: campaign.delivered > 0
        ? ((campaign.opened / campaign.delivered) * 100).toFixed(1)
        : '0.0',
      clickRate: campaign.opened > 0
        ? ((campaign.clicked / campaign.opened) * 100).toFixed(1)
        : '0.0',
      bounceRate: campaign.sent > 0
        ? ((campaign.bounced / campaign.sent) * 100).toFixed(1)
        : '0.0',
    };

    return NextResponse.json({
      success: true,
      campaign,
      stats,
      sends: sends.length > 0 ? sends : undefined,
    });
  } catch (error) {
    console.error('[CAMPAIGN_GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign', details: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Quick status update for a campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const prisma = getPrismaClient();
    const body = await request.json();

    // Check campaign exists
    const [existing] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Only allow status updates via PATCH
    if (body.status) {
      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        draft: ['scheduled', 'cancelled'],
        scheduled: ['draft', 'cancelled'],
        paused: ['draft', 'scheduled'],
        cancelled: ['draft'],
      };

      if (
        validTransitions[existing.status] &&
        !validTransitions[existing.status].includes(body.status)
      ) {
        return NextResponse.json(
          {
            error: `Cannot change status from '${existing.status}' to '${body.status}'`,
          },
          { status: 400 }
        );
      }

      await prisma.$executeRaw`
        UPDATE "email_campaigns"
        SET "status" = ${body.status}, "updatedAt" = NOW()
        WHERE "id" = ${id}
      `;
    }

    // Fetch updated campaign
    const [campaign] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('[CAMPAIGN_PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const prisma = getPrismaClient();

    // Check campaign exists
    const [existing] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Don't allow deleting active campaigns
    if (existing.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete a campaign that is currently sending' },
        { status: 400 }
      );
    }

    // Delete sends first
    await prisma.$executeRaw`
      DELETE FROM "email_campaign_sends" WHERE "campaignId" = ${id}
    `;

    // Delete campaign
    await prisma.$executeRaw`
      DELETE FROM "email_campaigns" WHERE "id" = ${id}
    `;

    console.log(`🗑️ [CAMPAIGN] Deleted campaign: ${existing.name} (${id})`);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('[CAMPAIGN_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign', details: String(error) },
      { status: 500 }
    );
  }
}
