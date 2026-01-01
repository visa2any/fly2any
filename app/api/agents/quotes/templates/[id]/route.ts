export const dynamic = 'force-dynamic';

// Quote Template - Individual Operations
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tripName: z.string().optional(),
  destination: z.string().optional(),
  duration: z.number().optional(),
  travelers: z.number().optional(),
  adults: z.number().optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  flights: z.array(z.any()).optional(),
  hotels: z.array(z.any()).optional(),
  activities: z.array(z.any()).optional(),
  transfers: z.array(z.any()).optional(),
  carRentals: z.array(z.any()).optional(),
  insurance: z.any().optional(),
  customItems: z.array(z.any()).optional(),
  agentMarkupPercent: z.number().optional(),
  taxes: z.number().optional(),
  fees: z.number().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  importantInfo: z.string().optional(),
  termsAndConditions: z.string().optional(),
  customNotes: z.string().optional(),
});

// GET - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const template = await prisma!.quoteTemplate.findFirst({
      where: {
        id,
        OR: [{ agentId: agent.id }, { isPublic: true }],
      },
      include: {
        agent: {
          select: { id: true, firstName: true, lastName: true, agencyName: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[TEMPLATE_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existing = await prisma!.quoteTemplate.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = UpdateTemplateSchema.parse(body);

    // If setting as default, unset other defaults
    if (data.isDefault === true) {
      await prisma!.quoteTemplate.updateMany({
        where: { agentId: agent.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const template = await prisma!.quoteTemplate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[TEMPLATE_UPDATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existing = await prisma!.quoteTemplate.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await prisma!.quoteTemplate.delete({ where: { id } });

    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "template_deleted",
        description: `Quote template deleted: ${existing.name}`,
        entityType: "template",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TEMPLATE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
