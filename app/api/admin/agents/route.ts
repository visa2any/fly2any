// app/api/admin/agents/route.ts
// Admin Agents Management API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma!.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma!.travelAgent.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { quotes: true, bookings: true, clients: true, commissions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma!.travelAgent.count({ where }),
    ]);

    // Stats
    const stats = await prisma!.travelAgent.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const totalCommissions = await prisma!.agentCommission.aggregate({
      _sum: { agentEarnings: true, platformFee: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        agents,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        stats: {
          byStatus: Object.fromEntries(stats.map(s => [s.status, s._count.id])),
          totalCommissions: totalCommissions._sum.agentEarnings || 0,
          platformFees: totalCommissions._sum.platformFee || 0,
        },
      },
    });
  } catch (error) {
    console.error('Admin agents error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma!.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { agentId, status, commissionRate, notes, rejectionReason } = await req.json();

    const updated = await prisma!.travelAgent.update({
      where: { id: agentId },
      data: {
        ...(status && { status }),
        ...(commissionRate !== undefined && { defaultCommission: commissionRate / 100 }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: updated.id,
        activityType: status === 'ACTIVE' ? 'agent_approved' :
                     status === 'REJECTED' ? 'agent_rejected' :
                     status === 'SUSPENDED' ? 'agent_suspended' : 'status_changed',
        description: status === 'REJECTED' ? `Application rejected: ${rejectionReason}` :
                    status === 'ACTIVE' ? 'Application approved' :
                    status === 'SUSPENDED' ? 'Agent suspended' : `Status changed to ${status}`,
        metadata: {
          status,
          rejectionReason: rejectionReason || null,
          changedBy: user.name || session.user.id,
        },
      },
    });

    // Send email notification (async, don't block response)
    sendAgentStatusEmail(updated, status, rejectionReason).catch(err => {
      console.error('[AGENT_EMAIL] Failed to send:', err);
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin agent update error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// Send email notification for agent status changes
async function sendAgentStatusEmail(
  agent: { id: string; agencyName?: string | null; user: { name: string | null; email: string } },
  status: string,
  rejectionReason?: string
) {
  const { mailgunClient, MAILGUN_CONFIG } = await import('@/lib/email/mailgun-client');

  const agentName = agent.user.name || 'Travel Agent';
  const businessName = agent.agencyName || agentName;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  let subject = '';
  let html = '';

  if (status === 'ACTIVE') {
    subject = '🎉 Welcome to Fly2Any - Your Application is Approved!';
    html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">🎉 Congratulations!</h1>
          <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">Your application has been approved</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi ${agentName},</p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Great news! Your travel agent application for <strong>${businessName}</strong> has been reviewed and approved.</p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 30px;">You now have full access to the Fly2Any agent dashboard where you can:</p>
          <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 30px;padding-left:20px;">
            <li>Create and manage client quotes</li>
            <li>Book flights, hotels, and activities</li>
            <li>Track your commissions and earnings</li>
            <li>Access exclusive agent-only deals</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${baseUrl}/agent" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Go to Dashboard</a>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:30px 0 0;">Welcome to the team!<br><strong>The Fly2Any Team</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  } else if (status === 'REJECTED') {
    subject = 'Update on Your Fly2Any Agent Application';
    html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">Application Update</h1>
          <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:16px;">We've reviewed your application</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi ${agentName},</p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Thank you for your interest in becoming a Fly2Any travel agent. After reviewing your application, we were unable to approve it at this time.</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 20px;">
            <p style="color:#991b1b;font-size:14px;font-weight:600;margin:0 0 8px;">Reason:</p>
            <p style="color:#7f1d1d;font-size:14px;margin:0;">${rejectionReason || 'Your application did not meet our current requirements.'}</p>
          </div>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">You are welcome to reapply once you have addressed these issues. If you believe this decision was made in error, please contact our support team.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${baseUrl}/contact" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Contact Support</a>
            </td></tr>
          </table>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:30px 0 0;">Best regards,<br><strong>The Fly2Any Team</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  } else if (status === 'SUSPENDED') {
    subject = 'Your Fly2Any Agent Account Has Been Suspended';
    html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td style="background:#dc2626;padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">Account Suspended</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi ${agentName},</p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">Your Fly2Any travel agent account has been suspended. During this period, you will not be able to access the agent dashboard or make bookings.</p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">If you believe this was done in error or would like to discuss this decision, please contact our support team.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${baseUrl}/contact" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Contact Support</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  } else {
    // Don't send email for other status changes
    return;
  }

  await mailgunClient.send({
    to: agent.user.email,
    subject,
    html,
    from: MAILGUN_CONFIG.fromEmail,
    tags: ['agent-status', status.toLowerCase()],
    forceSend: true,
  });

  console.log(`[AGENT_EMAIL] Sent ${status} notification to ${agent.user.email}`);
}
