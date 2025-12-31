export const dynamic = 'force-dynamic';

// app/api/agency/stripe-connect/route.ts
// Stripe Connect Onboarding API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

// Initialize Stripe only if key is available (handles build time)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    })
  : null;

function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  return stripe;
}

// POST /api/agency/stripe-connect - Create/resume onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";
    let accountId = agent.stripeAccountId;

    // Create new connected account if doesn't exist
    if (!accountId) {
      const account = await getStripe().accounts.create({
        type: "express",
        country: agent.country || "US",
        email: agent.email || session.user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          name: agent.agencyName || agent.businessName || `${agent.firstName} ${agent.lastName}`,
          product_description: "Travel booking services",
          mcc: "4722", // Travel agencies and tour operators
        },
        metadata: {
          agentId: agent.id,
          userId: session.user.id,
        },
      });

      accountId = account.id;

      // Save the account ID
      await prisma!.travelAgent.update({
        where: { id: agent.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Create account link for onboarding
    const accountLink = await getStripe().accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/agency/payouts?refresh=true`,
      return_url: `${baseUrl}/agency/payouts?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("[STRIPE_CONNECT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect link" },
      { status: 500 }
    );
  }
}

// GET /api/agency/stripe-connect - Get account status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (!agent.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        status: "not_connected",
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      });
    }

    const account = await getStripe().accounts.retrieve(agent.stripeAccountId);

    return NextResponse.json({
      connected: true,
      status: account.details_submitted ? "active" : "pending",
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
      balance: await getAccountBalance(agent.stripeAccountId),
    });
  } catch (error) {
    console.error("[STRIPE_CONNECT_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to get Stripe Connect status" },
      { status: 500 }
    );
  }
}

async function getAccountBalance(accountId: string) {
  try {
    const balance = await getStripe().balance.retrieve({
      stripeAccount: accountId,
    });

    return {
      available: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
      pending: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
      currency: balance.available[0]?.currency || "usd",
    };
  } catch {
    return { available: 0, pending: 0, currency: "usd" };
  }
}

// DELETE /api/agency/stripe-connect - Disconnect account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || !agent.stripeAccountId) {
      return NextResponse.json({ error: "No connected account" }, { status: 404 });
    }

    // Note: We don't actually delete the Stripe account
    // We just remove the reference from our database
    await prisma!.travelAgent.update({
      where: { id: agent.id },
      data: { stripeAccountId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STRIPE_DISCONNECT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to disconnect Stripe account" },
      { status: 500 }
    );
  }
}
