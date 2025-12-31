export const dynamic = 'force-dynamic';

// app/api/agency/markup-rules/route.ts
// Agency Markup Rules API - Level 6 Ultra-Premium
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const MarkupRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  productType: z.enum(["FLIGHT", "HOTEL", "ACTIVITY", "TRANSFER", "ALL"]).default("ALL"),
  minPrice: z.number().optional().nullable(),
  maxPrice: z.number().optional().nullable(),
  minMarkup: z.number().min(0).max(100).default(5),
  maxMarkup: z.number().min(0).max(100).default(50),
  suggestedMarkup: z.number().min(0).max(100).default(15),
  appliesToAll: z.boolean().default(true),
  agentIds: z.array(z.string()).default([]),
  priority: z.number().default(0),
  active: z.boolean().default(true),
});

// GET /api/agency/markup-rules - List all markup rules
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
      return NextResponse.json({ error: "Not an agency owner" }, { status: 403 });
    }

    const markupRules = await prisma!.agencyMarkupRule.findMany({
      where: { agencyId: agent.id },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ rules: markupRules });
  } catch (error) {
    console.error("[MARKUP_RULES_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch markup rules" }, { status: 500 });
  }
}

// POST /api/agency/markup-rules - Create new markup rule
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
      return NextResponse.json({ error: "Not an agency owner" }, { status: 403 });
    }

    const body = await request.json();
    const data = MarkupRuleSchema.parse(body);

    // Validate markup ranges
    if (data.minMarkup > data.maxMarkup) {
      return NextResponse.json(
        { error: "Minimum markup cannot exceed maximum markup" },
        { status: 400 }
      );
    }

    if (data.suggestedMarkup < data.minMarkup || data.suggestedMarkup > data.maxMarkup) {
      return NextResponse.json(
        { error: "Suggested markup must be between minimum and maximum" },
        { status: 400 }
      );
    }

    // Validate price ranges if provided
    if (data.minPrice !== null && data.maxPrice !== null && data.minPrice > data.maxPrice) {
      return NextResponse.json(
        { error: "Minimum price cannot exceed maximum price" },
        { status: 400 }
      );
    }

    const rule = await prisma!.agencyMarkupRule.create({
      data: {
        agencyId: agent.id,
        name: data.name,
        description: data.description,
        productType: data.productType,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        minMarkup: data.minMarkup,
        maxMarkup: data.maxMarkup,
        suggestedMarkup: data.suggestedMarkup,
        appliesToAll: data.appliesToAll,
        agentIds: data.agentIds,
        priority: data.priority,
        active: data.active,
      },
    });

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (error) {
    console.error("[MARKUP_RULE_CREATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create markup rule" }, { status: 500 });
  }
}

// PUT /api/agency/markup-rules - Update markup rule
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
      return NextResponse.json({ error: "Not an agency owner" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Rule ID required" }, { status: 400 });
    }

    // Verify rule belongs to this agency
    const existingRule = await prisma!.agencyMarkupRule.findFirst({
      where: { id, agencyId: agent.id },
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const data = MarkupRuleSchema.partial().parse(updateData);

    // Validate markup ranges
    const minMarkup = data.minMarkup ?? existingRule.minMarkup;
    const maxMarkup = data.maxMarkup ?? existingRule.maxMarkup;
    const suggestedMarkup = data.suggestedMarkup ?? existingRule.suggestedMarkup;

    if (minMarkup > maxMarkup) {
      return NextResponse.json(
        { error: "Minimum markup cannot exceed maximum markup" },
        { status: 400 }
      );
    }

    if (suggestedMarkup < minMarkup || suggestedMarkup > maxMarkup) {
      return NextResponse.json(
        { error: "Suggested markup must be between minimum and maximum" },
        { status: 400 }
      );
    }

    const rule = await prisma!.agencyMarkupRule.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error("[MARKUP_RULE_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update markup rule" }, { status: 500 });
  }
}

// DELETE /api/agency/markup-rules - Delete markup rule
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
      return NextResponse.json({ error: "Not an agency owner" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Rule ID required" }, { status: 400 });
    }

    // Verify rule belongs to this agency
    const existingRule = await prisma!.agencyMarkupRule.findFirst({
      where: { id, agencyId: agent.id },
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    await prisma!.agencyMarkupRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MARKUP_RULE_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete markup rule" }, { status: 500 });
  }
}
