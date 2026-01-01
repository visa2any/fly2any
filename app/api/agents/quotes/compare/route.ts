export const dynamic = 'force-dynamic';

// Quote Comparison API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const CreateComparisonSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string(),
  quoteIds: z.array(z.string()).min(2).max(5),
  expiresInDays: z.number().default(7),
});

// GET - List comparisons
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
    const clientId = searchParams.get("clientId");
    const active = searchParams.get("active");

    const where: any = { agentId: agent.id };
    if (clientId) where.clientId = clientId;
    if (active === "true") where.isActive = true;

    const comparisons = await prisma!.quoteComparison.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Fetch quotes for each comparison
    const comparisonsWithQuotes = await Promise.all(
      comparisons.map(async (comp) => {
        const quotes = await prisma!.agentQuote.findMany({
          where: { id: { in: comp.quoteIds } },
          select: {
            id: true,
            quoteNumber: true,
            tripName: true,
            destination: true,
            startDate: true,
            endDate: true,
            total: true,
            status: true,
          },
        });
        return { ...comp, quotes };
      })
    );

    return NextResponse.json({ comparisons: comparisonsWithQuotes });
  } catch (error) {
    console.error("[COMPARISONS_LIST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create comparison
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
    const data = CreateComparisonSchema.parse(body);

    // Verify client
    const client = await prisma!.agentClient.findFirst({
      where: { id: data.clientId, agentId: agent.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify all quotes exist and belong to agent
    const quotes = await prisma!.agentQuote.findMany({
      where: { id: { in: data.quoteIds }, agentId: agent.id },
    });

    if (quotes.length !== data.quoteIds.length) {
      return NextResponse.json({ error: "One or more quotes not found" }, { status: 404 });
    }

    // Create comparison
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    const comparison = await prisma!.quoteComparison.create({
      data: {
        agentId: agent.id,
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        quoteIds: data.quoteIds,
        shareableLink: crypto.randomBytes(32).toString("hex"),
        expiresAt,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "comparison_created",
        description: `Quote comparison created: ${comparison.name}`,
        entityType: "comparison",
        entityId: comparison.id,
        metadata: {
          quoteCount: data.quoteIds.length,
          client: `${client.firstName} ${client.lastName}`,
        },
      },
    });

    return NextResponse.json({
      comparison,
      shareableUrl: `${process.env.NEXT_PUBLIC_APP_URL}/client/compare/${comparison.shareableLink}`,
    }, { status: 201 });

  } catch (error) {
    console.error("[COMPARISON_CREATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
