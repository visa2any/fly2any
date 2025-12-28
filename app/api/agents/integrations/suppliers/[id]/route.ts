export const dynamic = 'force-dynamic';

// app/api/agents/integrations/suppliers/[id]/route.ts
// Get, Update, and Delete Supplier
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(["ACTIVITY", "TRANSFER", "CAR_RENTAL", "INSURANCE", "CRUISE", "PACKAGE", "OTHER"]).optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  isPreferred: z.boolean().optional(),
});

// GET /api/agents/integrations/suppliers/[id] - Get supplier details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supplier = await prisma!.agentSupplier.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        products: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error("[SUPPLIER_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/integrations/suppliers/[id] - Update supplier
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supplier = await prisma!.agentSupplier.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates = UpdateSupplierSchema.parse(body);

    const updatedSupplier = await prisma!.agentSupplier.update({
      where: { id: supplier.id },
      data: updates,
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "supplier_updated",
        description: `Updated supplier: ${updatedSupplier.name}`,
        entityType: "supplier",
        entityId: supplier.id,
        metadata: {
          updates: Object.keys(updates),
        },
      },
    });

    return NextResponse.json({
      success: true,
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("[SUPPLIER_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/integrations/suppliers/[id] - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const supplier = await prisma!.agentSupplier.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Check if supplier has products
    if (supplier._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete supplier with ${supplier._count.products} products. Please delete products first.`,
        },
        { status: 400 }
      );
    }

    await prisma!.agentSupplier.delete({
      where: { id: supplier.id },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "supplier_deleted",
        description: `Deleted supplier: ${supplier.name}`,
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
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("[SUPPLIER_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}
