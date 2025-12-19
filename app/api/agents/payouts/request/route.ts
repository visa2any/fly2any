// app/api/agents/payouts/request/route.ts
// Request payout of available commissions
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { mailgunClient } from '@/lib/email/mailgun-client';



const PayoutRequestSchema = z.object({
  amount: z.number().min(0.01),
  payoutMethod: z.enum(["BANK_TRANSFER", "PAYPAL", "STRIPE", "CHECK", "WIRE_TRANSFER"]),
  accountDetails: z.object({
    accountHolderName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    bankName: z.string().optional(),
    paypalEmail: z.string().email().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

// Generate unique payout number
function generatePayoutNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `PO-${year}-${random}`;
}

// POST /api/agents/payouts/request - Request a payout
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await request.json();
    const payoutData = PayoutRequestSchema.parse(body);

    // Check agent tier-based minimum payout
    const minPayoutAmounts = {
      INDEPENDENT: 100,      // $100 minimum
      PROFESSIONAL: 50,      // $50 minimum
      AGENCY_PARTNER: 25,    // $25 minimum
      WHITE_LABEL: 1,        // $1 minimum (instant payouts)
    };

    const minPayout = minPayoutAmounts[agent.tier];

    if (payoutData.amount < minPayout) {
      return NextResponse.json(
        { error: `Minimum payout amount for ${agent.tier} tier is $${minPayout}` },
        { status: 400 }
      );
    }

    // Get available commissions
    const availableCommissions = await prisma!.agentCommission.findMany({
      where: {
        agentId: agent.id,
        status: "AVAILABLE",
      },
      include: {
        booking: {
          select: {
            confirmationNumber: true,
            tripName: true,
          },
        },
      },
    });

    const availableAmount = availableCommissions.reduce((sum, c) => sum + c.agentEarnings, 0);

    // Validate requested amount doesn't exceed available
    if (payoutData.amount > availableAmount) {
      return NextResponse.json(
        {
          error: `Requested amount exceeds available balance`,
          availableAmount,
          requestedAmount: payoutData.amount,
        },
        { status: 400 }
      );
    }

    // Calculate how many commissions to include (FIFO - oldest first)
    let amountToAllocate = payoutData.amount;
    const commissionsToInclude: string[] = [];
    const sortedCommissions = [...availableCommissions].sort(
      (a, b) => a.bookingDate.getTime() - b.bookingDate.getTime()
    );

    for (const commission of sortedCommissions) {
      if (amountToAllocate <= 0) break;
      commissionsToInclude.push(commission.id);
      amountToAllocate -= commission.agentEarnings;
    }

    // Calculate period covered
    const oldestDate = sortedCommissions[0]?.bookingDate || new Date();
    const newestDate = sortedCommissions[sortedCommissions.length - 1]?.bookingDate || new Date();

    // Create payout record
    const payout = await prisma!.agentPayout.create({
      data: {
        agentId: agent.id,
        payoutNumber: generatePayoutNumber(),
        amount: payoutData.amount,
        method: payoutData.payoutMethod,
        commissionCount: commissionsToInclude.length,
        periodStart: oldestDate,
        periodEnd: newestDate,
        netAmount: payoutData.amount, // Assume no processing fee for now
        status: "PENDING",
        requestedAt: new Date(),
      },
    });

    // Update commission statuses to PAID and link to payout
    await prisma!.agentCommission.updateMany({
      where: {
        id: { in: commissionsToInclude },
      },
      data: {
        status: "PAID",
        payoutId: payout.id,
        paidAt: new Date(),
      },
    });

    // Update agent balances
    await prisma!.travelAgent.update({
      where: { id: agent.id },
      data: {
        availableBalance: { decrement: payoutData.amount },
        lifetimePaid: { increment: payoutData.amount },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "payout_requested",
        description: `Payout of $${payoutData.amount} requested`,
        entityType: "payout",
        entityId: payout.id,
        metadata: {
          payoutNumber: payout.payoutNumber,
          amount: payoutData.amount,
          method: payoutData.payoutMethod,
          commissionsIncluded: commissionsToInclude.length,
        },
      },
    });

    // Send confirmation email to agent
    try {
      try {
        await mailgunClient.send({
          
          to: agent.user.email,
          subject: `Payout Request Received: ${payout.payoutNumber}`,
          html: `
            <h2>Payout Request Confirmed</h2>
            <p>We've received your payout request and are processing it.</p>
            <p><strong>Payout Details:</strong></p>
            <ul>
              <li>Payout Number: ${payout.payoutNumber}</li>
              <li>Amount: $${payoutData.amount.toLocaleString()}</li>
              <li>Method: ${payoutData.payoutMethod.replace('_', ' ')}</li>
              <li>Commissions Included: ${commissionsToInclude.length}</li>
            </ul>
            <p><strong>Processing Time:</strong></p>
            <ul>
              <li>Bank Transfer: 3-5 business days</li>
              <li>PayPal: 1-2 business days</li>
              <li>Wire Transfer: 1-3 business days</li>
              <li>Check: 7-10 business days</li>
            </ul>
            <p>You will receive a notification once the payout is processed.</p>
            <p><a href="${process.env.NEXTAUTH_URL}/agent/payouts/${payout.id}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">View Payout Details</a></p>
          `,
        });
      } else {
        console.warn('[PAYOUT_EMAIL_SKIPPED] RESEND_API_KEY not configured');
      }
    } catch (emailError) {
      console.error("[EMAIL_SEND_ERROR]", emailError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        payoutNumber: payout.payoutNumber,
        amount: payout.amount,
        status: payout.status,
        requestedAt: payout.requestedAt,
      },
      commissionsIncluded: commissionsToInclude.length,
      remainingAvailable: availableAmount - payoutData.amount,
    }, { status: 201 });
  } catch (error) {
    console.error("[PAYOUT_REQUEST_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to request payout" },
      { status: 500 }
    );
  }
}
