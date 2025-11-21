// app/api/agents/me/route.ts
// Get and Update Agent Profile
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/agents/me - Get current agent profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        _count: {
          select: {
            clients: true,
            quotes: true,
            bookings: true,
            commissions: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });

  } catch (error) {
    console.error("[AGENT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/me - Update agent profile
const UpdateAgentSchema = z.object({
  agencyName: z.string().optional(),
  iataNumber: z.string().optional(),
  arcNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  businessType: z.enum(["sole_proprietor", "llc", "corporation", "partnership"]).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  customDomain: z.string().optional(),
  emailSignature: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  timezone: z.string().optional(),
  operatingHours: z.record(z.string(), z.any()).optional(),
  // Notification preferences
  emailNotifications: z.boolean().optional(),
  quoteAcceptedEmail: z.boolean().optional(),
  paymentReceivedEmail: z.boolean().optional(),
  clientMessageEmail: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  monthlyStatements: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  // Payout settings
  payoutMethod: z.enum(["stripe", "paypal", "bank_transfer"]).optional(),
  payoutSchedule: z.enum(["instant", "weekly", "monthly"]).optional(),
  payoutEmail: z.string().email().optional(),
  minPayoutThreshold: z.number().min(0).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateAgentSchema.parse(body);

    // Update agent profile
    const updatedAgent = await prisma!.travelAgent.update({
      where: { id: agent.id },
      data: {
        ...validatedData,
        operatingHours: validatedData.operatingHours as any, // Cast to satisfy Prisma type
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "profile_updated",
        description: "Agent profile updated",
        metadata: {
          updatedFields: Object.keys(validatedData),
        },
      },
    });

    return NextResponse.json({ agent: updatedAgent });

  } catch (error) {
    console.error("[AGENT_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
