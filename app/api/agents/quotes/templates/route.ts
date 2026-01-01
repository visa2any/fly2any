export const dynamic = 'force-dynamic';

// Quote Templates API - CRUD Operations
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const TemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  tripName: z.string().optional(),
  destination: z.string().optional(),
  duration: z.number().optional(),
  travelers: z.number().optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  flights: z.array(z.any()).default([]),
  hotels: z.array(z.any()).default([]),
  activities: z.array(z.any()).default([]),
  transfers: z.array(z.any()).default([]),
  carRentals: z.array(z.any()).default([]),
  insurance: z.any().optional(),
  customItems: z.array(z.any()).default([]),
  agentMarkupPercent: z.number().optional(),
  taxes: z.number().optional(),
  fees: z.number().optional(),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  importantInfo: z.string().optional(),
  termsAndConditions: z.string().optional(),
  customNotes: z.string().optional(),
});

// GET - List templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includePublic = searchParams.get("includePublic") === "true";

    const where: any = {
      OR: [
        { agentId: agent.id },
        ...(includePublic ? [{ isPublic: true }] : []),
      ],
    };

    if (category) {
      where.category = category;
    }

    const templates = await prisma!.quoteTemplate.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { usageCount: "desc" }, { createdAt: "desc" }],
      include: {
        agent: {
          select: { id: true, firstName: true, lastName: true, agencyName: true },
        },
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[TEMPLATES_LIST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = TemplateSchema.parse(body);

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma!.quoteTemplate.updateMany({
        where: { agentId: agent.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma!.quoteTemplate.create({
      data: {
        agentId: agent.id,
        name: data.name,
        description: data.description,
        category: data.category,
        isDefault: data.isDefault,
        isPublic: data.isPublic,
        tripName: data.tripName,
        destination: data.destination,
        duration: data.duration,
        travelers: data.travelers,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        flights: data.flights,
        hotels: data.hotels,
        activities: data.activities,
        transfers: data.transfers,
        carRentals: data.carRentals,
        insurance: data.insurance,
        customItems: data.customItems,
        agentMarkupPercent: data.agentMarkupPercent,
        taxes: data.taxes,
        fees: data.fees,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        importantInfo: data.importantInfo,
        termsAndConditions: data.termsAndConditions,
        customNotes: data.customNotes,
      },
    });

    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "template_created",
        description: `Quote template created: ${template.name}`,
        entityType: "template",
        entityId: template.id,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("[TEMPLATE_CREATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
