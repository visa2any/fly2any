export const dynamic = 'force-dynamic';

// app/api/agents/register/route.ts
// Agent Registration Endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema - Updated with all registration fields
const RegisterAgentSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),

  // Business Info
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.enum(["INDIVIDUAL", "AGENCY", "TOUR_OPERATOR", "OTHER"]).optional(),
  website: z.string().url().optional().or(z.literal("")),
  yearsExperience: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  bio: z.string().optional(),

  // Credentials - IATA/ARC with None option
  credentialType: z.enum(["none", "iata", "arc", "both"]).optional(),
  iataNumber: z.string().optional(),
  arcNumber: z.string().optional(),

  // Tax Info
  ssnOrItin: z.string().optional(),
  ein: z.string().optional(),

  // Documents
  idDocumentUrl: z.string().optional(),
  idDocumentType: z.enum(["drivers_license", "passport", "state_id"]).optional(),

  // Payment
  hasPaymentMethod: z.boolean().optional(),
  cardLastFour: z.string().optional(),

  // Terms
  termsAccepted: z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),

  // Legacy fields for compatibility
  agencyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
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

    // Map form data to database fields
    const agentData = {
      userId: session.user.id,
      // Map businessName to agencyName for DB compatibility
      agencyName: validatedData.businessName || validatedData.agencyName,
      businessType: validatedData.businessType === "INDIVIDUAL" ? "sole_proprietor" :
                    validatedData.businessType === "AGENCY" ? "llc" :
                    validatedData.businessType === "TOUR_OPERATOR" ? "corporation" : "partnership",
      phoneNumber: validatedData.phone || validatedData.phoneNumber,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      country: validatedData.country || "United States",
      zipCode: validatedData.zipCode,
      website: validatedData.website || null,
      iataNumber: validatedData.iataNumber || null,
      arcNumber: validatedData.arcNumber || null,
      // Store additional data in metadata JSON field
      tier: "INDEPENDENT",
      status: "PENDING",
      defaultCommission: 0.05,
      commissionModel: "PERCENTAGE",
      onboardingCompleted: false,
      onboardingStep: 1,
    };

    // Create agent profile
    const agent = await prisma!.travelAgent.create({
      data: agentData,
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
