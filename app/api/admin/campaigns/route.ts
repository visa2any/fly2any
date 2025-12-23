/**
 * Email Campaigns CRUD API
 *
 * Full campaign management for email marketing
 * - List all campaigns with stats
 * - Create new campaigns
 * - Update campaign content/settings
 * - Delete campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Types for our campaign (since Prisma types might not be generated yet)
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

// GET - List all campaigns with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build filter
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    // Get campaigns using raw query (since model might not be in generated client yet)
    const campaigns = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns"
      ${status ? prisma.$queryRaw`WHERE "status" = ${status}` : prisma.$queryRaw``}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "email_campaigns"
      ${status ? prisma.$queryRaw`WHERE "status" = ${status}` : prisma.$queryRaw``}
    `;
    const total = Number(countResult[0]?.count || 0);

    // Get aggregate stats
    const statsResult = await prisma.$queryRaw<[{
      total_sent: bigint;
      total_delivered: bigint;
      total_opened: bigint;
      total_clicked: bigint;
      total_bounced: bigint;
    }]>`
      SELECT
        COALESCE(SUM("sent"), 0) as total_sent,
        COALESCE(SUM("delivered"), 0) as total_delivered,
        COALESCE(SUM("opened"), 0) as total_opened,
        COALESCE(SUM("clicked"), 0) as total_clicked,
        COALESCE(SUM("bounced"), 0) as total_bounced
      FROM "email_campaigns"
    `;

    const stats = {
      totalCampaigns: total,
      totalSent: Number(statsResult[0]?.total_sent || 0),
      totalDelivered: Number(statsResult[0]?.total_delivered || 0),
      totalOpened: Number(statsResult[0]?.total_opened || 0),
      totalClicked: Number(statsResult[0]?.total_clicked || 0),
      totalBounced: Number(statsResult[0]?.total_bounced || 0),
      avgOpenRate: statsResult[0]?.total_delivered
        ? ((Number(statsResult[0].total_opened) / Number(statsResult[0].total_delivered)) * 100).toFixed(1)
        : '0.0',
      avgClickRate: statsResult[0]?.total_opened
        ? ((Number(statsResult[0].total_clicked) / Number(statsResult[0].total_opened)) * 100).toFixed(1)
        : '0.0',
    };

    return NextResponse.json({
      success: true,
      campaigns,
      total,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[ADMIN_CAMPAIGNS] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const body = await request.json();

    // Validate required fields
    const { name, subject, body: htmlBody } = body;
    if (!name || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, body' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create campaign
    await prisma.$executeRaw`
      INSERT INTO "email_campaigns" (
        "id", "name", "type", "status", "subject", "preheader", "body", "plainText",
        "templateId", "targetAudience", "customFilter", "excludeList", "scheduledAt",
        "totalRecipients", "sent", "delivered", "opened", "clicked", "bounced",
        "unsubscribed", "complained", "createdBy", "tags", "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${name},
        ${body.type || 'promotional'},
        ${body.status || 'draft'},
        ${subject},
        ${body.preheader || null},
        ${htmlBody},
        ${body.plainText || null},
        ${body.templateId || null},
        ${body.targetAudience || 'all'},
        ${body.customFilter ? JSON.stringify(body.customFilter) : null}::jsonb,
        ${body.excludeList || []}::text[],
        ${body.scheduledAt ? new Date(body.scheduledAt) : null},
        0, 0, 0, 0, 0, 0, 0, 0,
        ${session.user.email},
        ${body.tags || []}::text[],
        NOW(),
        NOW()
      )
    `;

    // Fetch the created campaign
    const [campaign] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    console.log(`✅ [CAMPAIGNS] Created campaign: ${name} (${id})`);

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully',
    });
  } catch (error) {
    console.error('[ADMIN_CAMPAIGNS] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update an existing campaign
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Check campaign exists
    const [existing] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Don't allow editing sent campaigns
    if (existing.status === 'sent' || existing.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot edit a campaign that has been sent or is sending' },
        { status: 400 }
      );
    }

    // Build dynamic update
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      updateFields.push(`"name" = $${values.length + 1}`);
      values.push(updates.name);
    }
    if (updates.subject !== undefined) {
      updateFields.push(`"subject" = $${values.length + 1}`);
      values.push(updates.subject);
    }
    if (updates.preheader !== undefined) {
      updateFields.push(`"preheader" = $${values.length + 1}`);
      values.push(updates.preheader);
    }
    if (updates.body !== undefined) {
      updateFields.push(`"body" = $${values.length + 1}`);
      values.push(updates.body);
    }
    if (updates.plainText !== undefined) {
      updateFields.push(`"plainText" = $${values.length + 1}`);
      values.push(updates.plainText);
    }
    if (updates.type !== undefined) {
      updateFields.push(`"type" = $${values.length + 1}`);
      values.push(updates.type);
    }
    if (updates.status !== undefined) {
      updateFields.push(`"status" = $${values.length + 1}`);
      values.push(updates.status);
    }
    if (updates.targetAudience !== undefined) {
      updateFields.push(`"targetAudience" = $${values.length + 1}`);
      values.push(updates.targetAudience);
    }
    if (updates.scheduledAt !== undefined) {
      updateFields.push(`"scheduledAt" = $${values.length + 1}`);
      values.push(updates.scheduledAt ? new Date(updates.scheduledAt) : null);
    }
    if (updates.tags !== undefined) {
      updateFields.push(`"tags" = $${values.length + 1}::text[]`);
      values.push(updates.tags);
    }

    // Always update updatedAt
    updateFields.push(`"updatedAt" = NOW()`);

    if (updateFields.length === 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Execute update using raw SQL
    await prisma.$executeRawUnsafe(
      `UPDATE "email_campaigns" SET ${updateFields.join(', ')} WHERE "id" = $${values.length + 1}`,
      ...values,
      id
    );

    // Fetch updated campaign
    const [campaign] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    console.log(`✅ [CAMPAIGNS] Updated campaign: ${campaign.name} (${id})`);

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully',
    });
  } catch (error) {
    console.error('[ADMIN_CAMPAIGNS] PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a campaign
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
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Check campaign exists
    const [existing] = await prisma.$queryRaw<EmailCampaign[]>`
      SELECT * FROM "email_campaigns" WHERE "id" = ${id}
    `;

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Don't allow deleting campaigns that are currently sending
    if (existing.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete a campaign that is currently sending' },
        { status: 400 }
      );
    }

    // Delete associated sends first
    await prisma.$executeRaw`
      DELETE FROM "email_campaign_sends" WHERE "campaignId" = ${id}
    `;

    // Delete campaign
    await prisma.$executeRaw`
      DELETE FROM "email_campaigns" WHERE "id" = ${id}
    `;

    console.log(`🗑️ [CAMPAIGNS] Deleted campaign: ${existing.name} (${id})`);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('[ADMIN_CAMPAIGNS] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign', details: String(error) },
      { status: 500 }
    );
  }
}
