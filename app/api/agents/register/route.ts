export const dynamic = 'force-dynamic';

// app/api/agents/register/route.ts
// Agent Registration Endpoint
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resendClient, RESEND_CONFIG } from "@/lib/email/resend-client";
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
      data: agentData as any,
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

    // Notify admin of new agent registration (non-blocking)
    const agentAny = agent as any;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL;
    if (adminEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';
      resendClient.send({
        to: adminEmail,
        from: RESEND_CONFIG.fromEmail,
        subject: `New Agent Registration: ${agentData.agencyName || agentAny.user?.name || 'Unknown'}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#E74035">New Agent Registration</h2>
            <p>A new travel agent has submitted a registration and requires review.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Name</td><td style="padding:8px;border:1px solid #e5e7eb">${agentAny.user?.name || 'N/A'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${agentAny.user?.email || 'N/A'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Business</td><td style="padding:8px;border:1px solid #e5e7eb">${agentData.agencyName || 'N/A'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">Phone</td><td style="padding:8px;border:1px solid #e5e7eb">${agentData.phoneNumber || 'N/A'}</td></tr>
              <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb">IATA</td><td style="padding:8px;border:1px solid #e5e7eb">${agentData.iataNumber || 'None'}</td></tr>
            </table>
            <a href="${baseUrl}/admin/agents?status=PENDING" style="display:inline-block;background:#E74035;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Review Application →</a>
          </div>
        `,
        tags: ['agent-registration'],
      }).catch(() => {}); // Non-blocking
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        tier: agent.tier,
        status: agent.status,
        onboardingCompleted: (agent as any).onboardingCompleted,
        onboardingStep: (agent as any).onboardingStep,
        user: agentAny.user,
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
