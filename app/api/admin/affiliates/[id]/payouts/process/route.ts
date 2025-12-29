export const dynamic = 'force-dynamic';

/**
 * Admin Process Affiliate Payout API
 *
 * POST /api/admin/affiliates/[id]/payouts/process - Manually process payout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';
import { requireAdmin, logAdminAction } from '@/lib/admin/middleware';

/**
 * POST /api/admin/affiliates/[id]/payouts/process
 *
 * Process a payout manually (mark as paid, provide receipt URL)
 *
 * Request body:
 * {
 *   payoutId: string;
 *   receiptUrl?: string;
 *   processingFee?: number;
 *   notes?: string;
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY: Enforce admin authentication - fail closed
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
    const adminUserId = authResult.userId;

    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id: affiliateId } = params;
    const body = await request.json();

    if (!body.payoutId) {
      return NextResponse.json({
        success: false,
        error: 'Payout ID is required',
      }, { status: 400 });
    }

    // Get payout
    const payoutResult = await sql`
      SELECT * FROM payouts
      WHERE id = ${body.payoutId}
        AND affiliate_id = ${affiliateId}
    `;

    if (payoutResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Payout not found',
      }, { status: 404 });
    }

    const payout = payoutResult[0];

    if (payout.status === 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Payout has already been processed',
      }, { status: 400 });
    }

    // Update payout status to paid
    await sql`
      UPDATE payouts
      SET
        status = 'paid',
        receipt_url = ${body.receiptUrl || null},
        processing_fee = ${body.processingFee || payout.processing_fee},
        paid_at = NOW(),
        updated_at = NOW()
      WHERE id = ${body.payoutId}
    `;

    // Update all commissions linked to this payout
    await sql`
      UPDATE commissions
      SET
        status = 'paid',
        updated_at = NOW()
      WHERE payout_id = ${body.payoutId}
    `;

    // Update affiliate's paid amount
    await sql`
      UPDATE affiliates
      SET
        total_commissions_paid = total_commissions_paid + ${payout.amount},
        updated_at = NOW()
      WHERE id = ${affiliateId}
    `;

    // Log activity
    await sql`
      INSERT INTO affiliate_activity_logs (
        affiliate_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${affiliateId},
        'payout_processed',
        ${`Payout processed: $${payout.net_amount} via ${payout.method}`},
        ${JSON.stringify({
          payoutId: body.payoutId,
          adminUserId,
          amount: payout.amount,
          netAmount: payout.net_amount,
          method: payout.method,
          receiptUrl: body.receiptUrl,
          notes: body.notes,
        })},
        NOW()
      )
    `;

    // TODO: Send email notification to affiliate
    console.log(`✅ Payout ${body.payoutId} processed for affiliate ${affiliateId}`);

    return NextResponse.json({
      success: true,
      message: 'Payout processed successfully',
      data: {
        payoutId: body.payoutId,
        amount: parseFloat(payout.amount),
        netAmount: parseFloat(payout.net_amount),
        method: payout.method,
        paidAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('❌ Error processing payout:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process payout',
      message: error.message,
    }, { status: 500 });
  }
}
