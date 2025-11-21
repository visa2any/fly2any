// app/api/agents/integrations/suppliers/route.ts
// Manage supplier/vendor relationships for manual product entry
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const CreateSupplierSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["ACTIVITY", "TRANSFER", "CAR_RENTAL", "INSURANCE", "CRUISE", "PACKAGE", "OTHER"]),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  commissionRate: z.number().min(0).max(100).optional(), // Agent's commission from supplier
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  isPreferred: z.boolean().default(false),
});

const UpdateSupplierSchema = CreateSupplierSchema.partial();

// GET /api/agents/integrations/suppliers - List all suppliers
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

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const isPreferred = searchParams.get("isPreferred");

    const where: any = {
      agentId: agent.id,
    };

    if (category) {
      where.category = category;
    }

    if (isPreferred !== null) {
      where.isPreferred = isPreferred === "true";
    }

    const suppliers = await prisma!.agentSupplier.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [
        { isPreferred: "desc" },
        { name: "asc" },
      ],
    });

    // Group by category
    const suppliersByCategory = suppliers.reduce((acc: any, supplier) => {
      if (!acc[supplier.category]) {
        acc[supplier.category] = [];
      }
      acc[supplier.category].push(supplier);
      return acc;
    }, {});

    return NextResponse.json({
      suppliers,
      suppliersByCategory,
      stats: {
        total: suppliers.length,
        preferred: suppliers.filter(s => s.isPreferred).length,
        byCategory: Object.entries(suppliersByCategory).map(([category, items]) => ({
          category,
          count: (items as any[]).length,
        })),
      },
    });
  } catch (error) {
    console.error("[SUPPLIERS_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST /api/agents/integrations/suppliers - Create new supplier
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

    const body = await request.json();
    const supplierData = CreateSupplierSchema.parse(body);

    const supplier = await prisma!.agentSupplier.create({
      data: {
        agentId: agent.id,
        ...supplierData,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "supplier_created",
        description: `Added new supplier: ${supplier.name}`,
        entityType: "supplier",
        entityId: supplier.id,
        metadata: {
          supplierName: supplier.name,
          category: supplier.category,
        },
      },
    });

    return NextResponse.json({
      success: true,
      supplier,
    }, { status: 201 });
  } catch (error) {
    console.error("[SUPPLIER_CREATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
