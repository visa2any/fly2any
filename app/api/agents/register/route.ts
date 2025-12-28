export const dynamic = 'force-dynamic';

// app/api/agents/register/route.ts
// Agent Registration Endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const RegisterAgentSchema = z.object({
  agencyName: z.string().optional(),
  iataNumber: z.string().optional(),
  arcNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  businessType: z.enum(["sole_proprietor", "llc", "corporation", "partnership"]).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  timezone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = RegisterAgentSchema.parse(body);

    // Check if user already has an agent profile
    const existingAgent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (existingAgent) {
      return NextResponse.json(
        { error: "Agent profile already exists for this user" },
        { status: 400 }
      );
    }

    // Create agent profile
    const agent = await prisma!.travelAgent.create({
      data: {
        userId: session.user.id,
        ...validatedData,
        tier: "INDEPENDENT", // Start as independent
        status: "PENDING", // Pending approval
        defaultCommission: 0.05, // 5% platform fee
        commissionModel: "PERCENTAGE",
        onboardingCompleted: false,
        onboardingStep: 1,
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
        activityType: "agent_registered",
        description: "Travel agent profile created",
        metadata: {
          tier: agent.tier,
          status: agent.status,
        },
      },
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        tier: agent.tier,
        status: agent.status,
        onboardingCompleted: agent.onboardingCompleted,
        onboardingStep: agent.onboardingStep,
        user: agent.user,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("[AGENT_REGISTER_ERROR]", error);

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
